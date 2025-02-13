from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field, ValidationError, root_validator
from typing import Optional, Literal, List
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from dash import Input, Output, callback, html, State, dcc, no_update
from dash.exceptions import PreventUpdate
import dash_mantine_components as dmc
from app.core.external.pages.sections.classification.utils import parse_validation_errors, create_table_description, session_get_file_path, session_df_to_file, session_dict_to_json, continue_button, reset_button, session_schema_load, session_schema_save, get_target_column
from sklearn.feature_selection import RFE, SelectKBest, chi2, f_classif, mutual_info_classif
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import PCA
import numpy as np

def create_feature_selection_schema(column, targe):
    class FeatureSelectionSchema(BaseModel):
        method: Literal["manual", "auto", "all"] = Field(
            'manual', 
            description="Feature selection method",
        )
        selected_features: Literal[tuple(column)] = Field(
            description="List of selected features if manual selection is used",
            default_factory=list
        )
        k_number: int = Field(
            description='Number of K',
            default=5,
        )
        select_auto_method: Literal['selectKbest (f_classif)', 'selectKbest (mutual_info_classif)', 'RFE'] = Field(
            description='Method to Auto Feature Selection',
            default='RFE',
        )
        target: Literal[tuple(targe)] = Field(
            description="Target column",
        )

        @root_validator(pre=True)
        def check_selected_features(cls, values):
            method = values.get("method")
            selected_features = values.get("selected_features")
            if method == "manual" and not selected_features:
                raise ValueError("Selected features are required when method is 'manual'.")
            if method in ['auto', 'all']:
                values['selected_features'] = []
            return values

    return FeatureSelectionSchema

def feature_selection(df: pd.DataFrame, target: str, schema) -> pd.DataFrame:
    if schema['method'] == "manual":
        features = schema['selected_features']
        if target in features:
            features.remove(target)
        return df[features + [target]]
    elif schema['method'] == "auto" and schema['select_auto_method'] == 'RFE':
        X = df.drop(columns=[target])
        y = df[target]
        model = RandomForestClassifier(random_state=42)
        rfe = RFE(model, n_features_to_select=schema['k_number'])
        rfe.fit(X, y)
        selected_features = X.columns[rfe.support_]
        return df[selected_features.to_list() + [target]]
    elif schema['method'] == "auto" and schema['select_auto_method'] == 'selectKbest (f_classif)':
        X = df.drop(columns=[target])
        y = df[target]
        auto_object = SelectKBest(f_classif,k=schema['k_number']).fit(X,y)
        selected_features = list(auto_object.get_feature_names_out())
        return df[selected_features + [target]]
    elif schema['method']== "auto" and schema['select_auto_method'] == 'selectKbest (mutual_info_classif)':
        X = df.drop(columns=[target])
        y = df[target]
        auto_object = SelectKBest(mutual_info_classif,k=schema['k_number']).fit(X,y)
        selected_features = list(auto_object.get_feature_names_out())
        return df[selected_features + [target]]
    else:
        selected_features = df.drop(columns=[target]).columns
        return df[selected_features.to_list() + [target]]
    
def create_scatter_matrix_and_heatmap(df: pd.DataFrame):
    # Scatter matrix
    df = df.select_dtypes(include=['number'])
    numeric_cols = df.select_dtypes(include=['number']).columns

    df_2 = df.copy()
    num_cols_copy = list(numeric_cols.copy())
    num_cols_copy = [col.replace(' ', '<br>').replace('_', '<br>') for col in numeric_cols]
    df_2.columns = [col if col not in numeric_cols else num_cols_copy.pop(0) for col in df_2.columns]
    numeric_cols = df_2.columns

    scatter_matrix_fig = px.scatter_matrix(df_2, template='simple_white')

    fontsize = int(20/len(df))+10
    scatter_matrix_fig.update_layout(
        font_size=fontsize,
    )
    
    # Correlation heatmap
    corr_matrix = df.corr()
    heatmap_fig = go.Figure(data=go.Heatmap(
        z=corr_matrix.values,
        x=corr_matrix.columns,
        y=corr_matrix.columns,
        colorscale='Viridis',
    ))
    
    heatmap_fig.update_layout(
        template='simple_white',
        font_size=fontsize
    )
    
    return scatter_matrix_fig, heatmap_fig

def create_pca_plot(df: pd.DataFrame, target: str, schema):
    X = df.drop(target,axis=1)
    y = df[target].to_list()
    pca = PCA(n_components=2)
    X = pca.fit_transform(X)
    df_pca = pd.DataFrame({'X1':X[:,0],
                           'X2':X[:,1],
                           'Label':y})
    
    pca_fig = px.scatter(df_pca, 
                     x="X1", 
                     y="X2", 
                     color="Label",
                     labels={'x':'PC1','y':'PC2'},
                     title='Distribution of Data Using 2-Component PCA',
                     width=800,height=600,
                     template='simple_white')
    
    return pca_fig
    
    

def layout():
    df = pd.read_csv(session_get_file_path('preprocessed' ,extension='csv'), index_col=0)
    
    columns = df.columns.to_list()
    target_column = get_target_column()

    features_schema = create_feature_selection_schema(columns, target_column)

    form = ModelForm(
        features_schema,
        "feature_selection",
        "main",
        fields_repr={
            "method": fields.Select(
                options_labels={"manual": "Manual", "auto": "Auto", "all": "All"},
                description="Feature selection method",
                required=True,
            ),
            "selected_features": fields.MultiSelect(
                description="List of selected features if manual selection is used",
                visible = ("method", "==", "manual"),
            ),
            "select_auto_method": fields.Select(
                options_labels={'selectKbest (f_classif)': 'SelectKBest (f_classif)'
                                ,'selectKbest (mutual_info_classif)': 'SelectKBest (mutual_info_classif)','RFE':'RFE'},
                description="Select for Method of Auto Feature Selection",
                visible = ("method", "==", "auto"),
            ),
            "k_number": fields.Number(
                description="Number of K feature to Use",
                visible = ("method", "==", "auto"),
                min = 1,
                maximum = len(columns)-1
            ),
            'target': fields.Select(
                description="Target column",
                required=True,
            ),
        },
    )
    
    scatter_matrix_fig, heatmap_fig = create_scatter_matrix_and_heatmap(df)
    layout = dmc.Stack(
        [
            create_table_description(df),
            html.Div(
                [
                    # Scatter matrix plot area
                    html.Div(
                        [
                            dmc.ScrollArea(
                                h=1000,
                                children=[
                                    dcc.Graph(figure=scatter_matrix_fig, style={'height': '1000px', 'width': '1000px'})
                                ],
                                style={'width': '100%'}
                            )
                        ],
                        style={'display': 'flex', 'justify-content': 'center'}
                    ),

                    # Heatmap plot area
                    html.Div(
                        [
                            dmc.ScrollArea(
                                h=800,
                                children=[
                                    dcc.Graph(figure=heatmap_fig, style={'height': '800px', 'width': '800px'})
                                ],
                                style={'width': '100%'}
                            )
                        ],
                        style={'display': 'flex', 'justify-content': 'center'}
                    ),
                ],
                style={'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center','margin':'0px'}
            ),
            dmc.Paper(
                html.Div(
                    form,
                    style={'margin':10}
                ),
                withBorder=True,
                shadow=0,
            ),
            dmc.Button("Apply", color="blue", id='classification-apply_feature_selection', n_clicks=0),
            dcc.Loading(type='circle',id='classification-loading-feature_data',style={"width": "80px", "height": "80px"}),
            html.Div(id="classification-feature-selection-output"),
            dmc.Group(
                [
                    reset_button,
                    html.Div(
                        id='classification-proceed-output',
                    )
                ],
                justify="space-between",
            )
        ]
    )
    return layout


@callback(
    Output("classification-feature-selection-output", "children"),
    Output("classification-proceed-output", "children", allow_duplicate=True),
    Output('classification-loading-feature_data','children',allow_duplicate=True),
    Input('classification-apply_feature_selection', 'n_clicks'),
    State(ModelForm.ids.main("feature_selection", 'main'), "data"),
    prevent_initial_call = True
)
def apply_feature_selection(n_clicks, form_data):
    if n_clicks > 0:
        
        try:
            df = pd.read_csv(session_get_file_path('preprocessed', extension='csv'), index_col=0)
            schema = form_data
            df = feature_selection(df, schema['target'], schema)

            form_data_dict = dict(schema)
            if form_data_dict['method'] in ['all','auto']:
                form_data_dict['selected_features'] = df.columns[:-1].to_list()

            dict_schema = session_schema_load()
            dict_schema['selected_features'] = form_data_dict['selected_features']
            dict_schema['target'] = form_data_dict['target']

            session_schema_save(dict_schema)

            session_dict_to_json(form_data_dict, 'feature_selection')
            
            scatter_matrix_fig, heatmap_fig = create_scatter_matrix_and_heatmap(df)
            fig_pca = create_pca_plot(df, schema['target'], schema)
            output = dmc.Stack(
                [
                    create_table_description(df),
                    html.Div(
                            [
                                dmc.ScrollArea(
                                    h=1000,
                                    children=[
                                        dcc.Graph(figure=scatter_matrix_fig, style={'height': '1000px', 'width': '1000px'})
                                    ],
                                    style={'width': '100%'}
                                )
                            ],
                            style={'display': 'flex', 'justify-content': 'center','margin':'0px'}
                    ),
                    html.Div(
                            [
                                dmc.ScrollArea(
                                    h=800,
                                    children=[
                                        dcc.Graph(figure=heatmap_fig, style={'height': '800px', 'width': '800px'})
                                    ],
                                    style={'width': '100%'}
                                )
                            ],
                            style={'display': 'flex', 'justify-content': 'center','margin':'0px'}
                    ),
                    dmc.Center(
                        dcc.Graph(figure=fig_pca),
                        style={"width": "100%"}
                    )
                ],
                style={'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center','margin':'0px'}
            )
            
            
            session_df_to_file(df, 'feature_selected')
            
            return output, continue_button, ""
            
        except ValidationError as exc:
            return html.Div(
                [
                    dmc.Alert(
                        parse_validation_errors(exc),
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            ), no_update, ""
        
        except Exception as exc:
            return html.Div(
                [
                    dmc.Alert(
                        "There was an error applying feature selection.",
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            ), no_update, ""

    else:
        raise PreventUpdate
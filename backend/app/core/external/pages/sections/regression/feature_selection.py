from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field, ValidationError,root_validator
from typing import Optional, Literal
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from dash import Input, Output, callback, html, State, dcc, no_update
from dash.exceptions import PreventUpdate
import dash_mantine_components as dmc
from app.core.external.pages.sections.regression.utils import parse_validation_errors, create_table_description, session_get_file_path, session_df_to_file, session_dict_to_json, continue_button, reset_button, session_schema_load, session_schema_save
from sklearn.feature_selection import RFE, SelectKBest, r_regression, f_regression, mutual_info_regression
from sklearn.linear_model import LinearRegression

def create_feature_selection_schema(column):
    class FeatureSelectionSchema(BaseModel):
        method: Literal["manual", "auto", "all"] = Field(
            'manual', 
            description="Feature selection method",
        )
        selected_features: Literal[tuple(column)] = Field( # type: ignore
            description="List of selected features if manual selection is used",
            default_factory=list
        )
        k_number: int = Field(
            description='Number of K',
            default=5,
        )
        select_auto_method: Literal['selectKbest (f_regression)','selectKbest (mutual_info_regression)','RFE'] = Field(
            description='Method to Auto Feature Selection',
            default='RFE',
        )
        target: Literal[tuple(column)] = Field(
            description="Target column",
        )

        @root_validator(pre=True)
        def check_selected_features(cls, values):
            method = values.get("method")
            selected_features = values.get("selected_features")
            select_auto_method = values.get("select_auto_method")
            if method == "manual" and not selected_features:
                raise ValueError("Selected features are required when method is 'manual'.")

            if method in ['auto','all']:
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
        model = LinearRegression()
        rfe = RFE(model, n_features_to_select=schema['k_number'])
        rfe.fit(X, y)
        selected_features = X.columns[rfe.support_]
        return df[selected_features.to_list() + [target]]
    elif schema['method']  == "auto" and schema['select_auto_method'] == 'selectKbest (f_regression)':
        X = df.drop(columns=[target])
        y = df[target]
        auto_object = SelectKBest(f_regression,k=schema['k_number']).fit(X,y)
        selected_features = list(auto_object.get_feature_names_out())
        return df[selected_features + [target]]
    elif schema['method']  == "auto" and schema['select_auto_method'] == 'selectKbest (mutual_info_regression)':
        X = df.drop(columns=[target])
        y = df[target]
        auto_object = SelectKBest(mutual_info_regression,k=schema['k_number']).fit(X,y)
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

def layout():
        
    df = pd.read_csv(session_get_file_path('preprocessed' ,extension='csv'), index_col=0)
    
    columns = df.columns.to_list()

    features_schema = create_feature_selection_schema(columns)
        
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
                options_labels={'selectKbest (f_regression)': 'SelectKBest (f_regresion)'
                                ,'selectKbest (mutual_info_regression)': 'SelectKBest (mutual_info_regresion)','RFE':'RFE'},
                description="Select for Method of Auto Feature Selection",
                visible = ("method", "==", "auto"),
            ),
            "k_number": fields.Number(
                description="Number of K feature to Use",
                visible = ("method", "==", "auto"),
                maximum = len(columns)-1,
                min = 1
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
            dmc.Button("Apply", color="blue", id='regression-apply_feature_selection', n_clicks=0),
            dcc.Loading(type='circle',id='regression-loading-feature_data',style={"width": "80px", "height": "80px"}),
            html.Div(id="regression-feature-selection-output"),
            dmc.Group(
                [
                    reset_button,
                    html.Div(
                        id='regression-proceed-output',
                    )
                ],
                justify="space-between",
            )
        ]
    )
    
    return layout

@callback(
    Output("regression-feature-selection-output", "children"),
    Output("regression-proceed-output", "children", allow_duplicate=True),
    Output('regression-loading-feature_data','children',allow_duplicate=True),
    Input('regression-apply_feature_selection', 'n_clicks'),
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
            print('Masuk')
            output = dmc.Stack(
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
                                style={'display': 'flex', 'justify-content': 'center', 'align-items': 'center', 'margin': '0px'}
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
                                style={'display': 'flex', 'justify-content': 'center', 'align-items': 'center', 'margin': '0px'}
                            ),
                        ],
                        style={'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'margin': '0px'}
                    ),
                ]
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
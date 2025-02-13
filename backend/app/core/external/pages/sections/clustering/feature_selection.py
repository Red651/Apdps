from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field, ValidationError, root_validator
from typing import Optional, Literal
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from dash import Input, Output, callback, html, State, dcc, no_update
from dash.exceptions import PreventUpdate
import dash_mantine_components as dmc
from app.core.external.pages.sections.clustering.utils import parse_validation_errors, create_table_description, session_get_file_path, session_df_to_file, session_dict_to_json, continue_button, reset_button, get_numeric_value, session_schema_load, session_schema_save
from app.core.external.pages.sections.clustering.utils import session_scaler_load
from sklearn.feature_selection import VarianceThreshold
from sklearn.decomposition import PCA
import numpy as np
from sklearn.cluster import KMeans

def create_feature_selection_schema(column):
    class FeatureSelectionSchema(BaseModel):
        method: Literal['manual','auto','all'] = Field(
            description='Method',
            default='manual'
        )
        auto_method: Literal['vtreshold','cluster','vorder'] = Field(
            description='Method for Auto Feature Selection',
            default='vtreshold'
        )
        selected_features: Literal[tuple(column)] = Field( # type: ignore
            description="List of selected features if manual selection is used",
            default_factory=list
        )
        treshold: float = Field(
            description='Treshold to Use',
            default=0.8
        )
        n_feature: int = Field(
            description='Number Feature',
            default= 2
        )

        @root_validator(pre=True)
        def check_selected_features(cls, values):
            method = values.get("method")
            selected_features = values.get("selected_features")
            if method == "manual" and not selected_features:
                raise ValueError("Selected features are required when method is 'manual'.")

            if method in ['auto','all']:
                values['selected_features'] = []
            return values
        
    return FeatureSelectionSchema
    
def feature_selection(df: pd.DataFrame, schema) -> pd.DataFrame:
    numeric_columns = get_numeric_value()
    df_raw = pd.read_csv(session_get_file_path('rawData', extension='csv'), index_col=0)
    df_sel = df.copy()
    if schema['method'] == 'manual':
        features = schema['selected_features']
        return df[features]
    elif schema['method'] == 'all':
        return df
    elif schema['method'] == 'auto' and schema['auto_method'] == 'vtreshold':
        df_sel[numeric_columns] = df_raw[numeric_columns]
        sel = VarianceThreshold(threshold=(schema['treshold'] * (1 - schema['treshold'])))
        sel.fit(df_sel)
        selected_columns = df.columns[sel.get_support()]
        return df[selected_columns]
    elif schema['method'] == 'auto' and schema['auto_method'] == 'vorder':
        columns = df.columns
        df_sel[numeric_columns] = df_raw[numeric_columns]
        var_all = [np.var(df_sel[col]) for col in columns]
        df_var = pd.DataFrame({'Feature name':columns,
                               'Var value':var_all}).sort_values(by=['Var value'])
        selected_columns = df_var.iloc[:schema['n_feature'],0]
        return df[selected_columns]
    elif schema['method'] == 'auto' and schema['auto_method'] == 'cluster':
        num_clusters = schema['n_feature']
        kmeans = KMeans(n_clusters=num_clusters, random_state=42)
        kmeans.fit(df.T)

        selected_features = []
        for cluster in range(num_clusters):
            features_in_cluster = df.columns[kmeans.labels_ == cluster]
            selected_features.append(features_in_cluster[0])

        return df[selected_features]
        

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

def create_pca_plot(df: pd.DataFrame):
    pca = PCA(n_components=2)
    X = pca.fit_transform(df)
    df_pca = pd.DataFrame({'X1':X[:,0],
                           'X2':X[:,1],})
    
    pca_fig = px.scatter(df_pca, 
                     x="X1", 
                     y="X2", 
                     labels={'x':'PC1','y':'PC2'},
                     title='Distribution of Data Using 2-Component PCA',
                     width=800,height=600,
                     template='simple_white')
    
    return pca_fig

def layout():
        
    df = pd.read_csv(session_get_file_path('preprocessed' ,extension='csv'), index_col=0)
    
    columns = df.columns.to_list()

    features_schema = create_feature_selection_schema(columns)
        
    form = ModelForm(
        features_schema,
        "feature_selection",
        "main",
        fields_repr={
            'method' : fields.Select(
                options_labels={'manual':'Manual','auto':'Auto','all':'All'},
                description='Select Method for Feature to Use',
                required=True
            ),
            'auto_method' : fields.Select(
                visible=('method','==','auto'),
                options_labels={'vtreshold':'Variance Treshold','cluster':'Cluster Base Method','vorder':'Variance Order'},
                description='Select for Method of Auto Feature Selection',
                required=True
            ),
            "selected_features": fields.MultiSelect(
                visible=('method','==','manual'),
                description="List of selected features if manual selection is used",
            ),
            "treshold":{
                "description":"Percentile Variance Treshold",
                'min' : "0.1",
                'max' : "0.9",
                "visible": (('method', '==', 'auto'), ('auto_method', '==', 'vtreshold')),

            },
            "n_feature":{
                "description":"Number of Feature to Use",
                'min' : "2",
                'max' : f"{len(columns)}",
                "visible": (('method', '==', 'auto'), ('auto_method', 'in', ['vorder','cluster'])),

            },
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
                    style={'margin':20}
                ),
                withBorder=True,
                shadow=0,
            ),
            dmc.Button("Apply", color="blue", id='clustering-apply_feature_selection', n_clicks=0),
            dcc.Loading(type='circle',id='clustering-loading-feature_data',style={"width": "80px", "height": "80px"}),
            html.Div(id="clustering-feature-selection-output"),
            dmc.Group(
                [
                    reset_button,
                    html.Div(
                        id='clustering-proceed-output',
                    )
                ],
                justify="space-between",
            )
        ]
    )
    
    return layout

@callback(
    Output("clustering-feature-selection-output", "children"),
    Output("clustering-proceed-output", "children", allow_duplicate=True),
    Output('clustering-loading-feature_data','children',allow_duplicate=True),
    Input('clustering-apply_feature_selection', 'n_clicks'),
    State(ModelForm.ids.main("feature_selection", 'main'), "data"),
    prevent_initial_call = True
)
def apply_feature_selection(n_clicks, form_data):
    if n_clicks > 0:
        
        try:
            df = pd.read_csv(session_get_file_path('preprocessed', extension='csv'), index_col=0)
            schema = form_data
            df = feature_selection(df, schema)

            form_data_dict = dict(schema)
            if form_data_dict['method'] in ['all','auto']:
                form_data_dict['selected_features'] = df.columns.to_list()

            dict_schema = session_schema_load()
            dict_schema['selected_features'] = form_data_dict['selected_features']
            
            session_schema_save(dict_schema)
            
            session_dict_to_json(form_data_dict, 'feature_selection')
            
            scatter_matrix_fig, heatmap_fig = create_scatter_matrix_and_heatmap(df)
            fig_pca = create_pca_plot(df)
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
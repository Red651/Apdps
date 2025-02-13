import dash_mantine_components as dmc
from dash import dcc, html, Input, Output, State, callback, no_update
from dash.exceptions import PreventUpdate
from dash_iconify import DashIconify
import flask
import uuid
from pydantic import BaseModel, Field
from app.core.external.pages.sections.classification.utils import parse_validation_errors, session_df_to_file, session_get_file_path, session_delete_file, parse_contents, render_upload_header, reset_button, continue_button, create_table_description, session_json_to_dict
from typing import Literal, Optional
from dash_pydantic_form import ModelForm, fields
import pandas as pd
import plotly.graph_objects as go
from plotly.graph_objs import Figure
from app.core.external.pages.sections.classification.data_preprocessing import preprocess_all_and_visualize
from pydantic import ValidationError
import joblib
import plotly.express as px
import pandas.api.types as ptypes
import numpy as np

session = {}

upload_button = dcc.Upload(
    id='classification-prediction-upload-data',
    children=dmc.Stack([
        dmc.Flex(DashIconify(icon="ic:outline-cloud-upload", height=30),justify='center'),
        dmc.Text('Drag and Drop or Select Files'),
        dmc.Text("Accepted file types: .csv, .xslx, .las .", c='#1890ff', ta='center', style={"fontSize": 12},),
    ], gap=0, m='10px', justify='center'),
    style={
        'width': '100%',
        'height': '100%',
        'lineHeight': '60px',
        'borderWidth': '1px',
        'borderStyle': 'dashed',
        'borderRadius': '5px',
        'textAlign': 'center',
        'borderColor': '#1890ff',
        'color': '#1890ff',
        'fontSize': '16px'
    },
)

class PredictionFeatureSelectionSchema(BaseModel):
    prediction_column_name: str = Field(
        description="Prediction column name",
        default="prediction"
    )

def create_prediction_plot(features_df: pd.DataFrame, predictions: list, prediction_column_name, type_selected) -> go.Figure:

    columns = features_df.columns[:-1]
    fig_list = {}
    # Add predictions as a column in the DataFrame for coloring
    # Create a scatter plot with x, y features, and color as the predicted labels
    for i in range (0,len(columns)):
        if type_selected[i] == 'number':
            col = columns[i]
            fig = px.box(
                features_df,
                y=features_df[col],
                color=prediction_column_name,
                title=f'Boxplot Value of {col} with Predicted Labels',
                labels={'color': f'{prediction_column_name}'},
                template='simple_white'
                # color_continuous_scale=px.colors.qualitative.Safe,  # Use a qualitative color scale for categorical labels
            )

            fig_list[f'{col}'] = fig

    for i in range (0,len(columns)):
        if type_selected[i] == 'string':
            col = columns[i]
            df_aggregated = features_df.groupby([prediction_column_name, columns[i]]).size().reset_index(name='counts')
            fig = px.bar(df_aggregated, x=prediction_column_name, y="counts", color=columns[i], title=f"Prediction vs Type of {columns[i]}")

            fig_list[f'{col}'] = fig
    
    visualizations = [dcc.Graph(figure=figure) for figure in fig_list.values()]

    return visualizations

def predict_and_visualize_classification_model(schema: PredictionFeatureSelectionSchema) -> dict:
    
    with open(session_get_file_path('SessionSchema', extension='joblib'), 'rb') as file:
        schema_load = joblib.load(file)

    raw_df_1 = pd.read_csv(session_get_file_path('predictionData', extension='csv'), index_col=0)
    raw_df = raw_df_1.copy()
    raw_df.reset_index(inplace=True)
    raw_df_1.reset_index(inplace=True)

    column_name = schema_load['column']


    for col in range (0,len(column_name)):

        if column_name[col] != schema_load['target']:
            
            if ptypes.is_numeric_dtype(raw_df[column_name[col]]):
                if schema_load['missing_value'] == "remove":
                    raw_df_1 = raw_df_1.dropna(subset=[col])
                    raw_df = raw_df.dropna(subset=[col])
                else:
                    fill_value = schema_load['fill'][col]
                    raw_df[column_name[col]] = raw_df[column_name[col]].fillna(fill_value)

                if schema['outlier_handling'] == "remove":
                    mean = schema_load['outlier_mean'][col]
                    std = schema_load['outlier_std'][col]
                    raw_df = raw_df[(np.abs(raw_df[column_name[col]] - mean) <= (3 * std))]
                elif schema_load['outlier_handling'] == "cap":
                    raw_df[column_name[col]] = np.where(raw_df[column_name[col]] > schema_load['outlier_cap'], schema_load['outlier_cap'], raw_df[column_name[col]])

                scaler = schema_load['scaler'][col]
                raw_df[column_name[col]] = scaler.transform(raw_df[column_name[col]].values.reshape(-1, 1)).flatten()
            
            
            else:
                raw_df_1 = raw_df_1.dropna(subset=column_name[col])
                raw_df = raw_df.dropna(subset=column_name[col])
                le = schema_load['label_enc'][col]
                raw_df[column_name[col]] = le.transform(raw_df[column_name[col]])


    raw_df = raw_df[schema_load['selected_features']]
    raw_df_1 = raw_df.copy()

    selected_features_idx = [int(np.where(i == np.array(schema_load['column']))[0][0]) for i in schema_load['selected_features']]
    type_selected = [schema_load['type'][i] for i in selected_features_idx]

    for i in selected_features_idx:
        col_name = schema_load['column'][i]
        col_type = schema_load['type'][i]

        if col_type == 'number':
            scaler = schema_load['scaler'][i]
            raw_df_1[col_name] = scaler.transform(raw_df_1[col_name].values.reshape(-1, 1)).flatten()
        
        else:
            encode =   schema_load['label_enc'][i]
            raw_df_1[col_name] = encode.inverse_transform(raw_df_1[col_name])

    with open(session_get_file_path('model', extension='joblib'), 'rb') as file:
        model = joblib.load(file)

    if schema_load['space'] == 'pca':
        pca = schema_load['pca']
        new_feature = pca.fit_transform(raw_df)
        raw_df = pd.DataFrame(new_feature,columns=['PC1','PC2'])

    predictions = model.predict(raw_df)

    idx_target = np.where(schema_load['target']==np.array(schema_load['column']))[0]
    encode = schema_load['label_enc'][idx_target[0]]
    predictions = encode.inverse_transform(predictions)

    raw_df[schema.prediction_column_name] = predictions
    raw_df_1[schema.prediction_column_name] = predictions
    session_df_to_file(raw_df_1, 'predictedData')

    plot_df = raw_df_1.copy()


    plot_df[plot_df.index.name if plot_df.index.name is not None else 'index'] = plot_df.index
    visualization = create_prediction_plot(raw_df_1, predictions, schema.prediction_column_name,type_selected)   

    return dmc.Stack(
                [
                    dmc.SimpleGrid(visualization, cols=3),
                    dmc.Button("Download Predicted Data", color="blue", id='classification-download_predicted_data_button', n_clicks=0,fullWidth=True),
                    dcc.Download(id="classification-download-predicted-data"),
                ]
            ),


def layout():
    
    layout = dmc.Stack(
        [
            html.Div(
                upload_button,
                id='classification-prediction-upload-header'
            ),
            html.Div(
                id='classification-prediction-upload-output-data',
            ),
            dcc.Loading(type='circle',id='classification-loading-predict_data',style={"width": "80px", "height": "80px"}),
            dmc.Group(
                [
                    reset_button,
                    html.Div(continue_button,
                        id='classification-proceed-output',
                    )
                ],
                justify="space-between",
            )
        ],
        gap='md'
    )
    return layout

@callback(
    Output('classification-prediction-upload-output-data', 'children', allow_duplicate=True),
    Output('classification-prediction-upload-header', 'children', allow_duplicate=True),
    Output('classification-loading-predict_data','children',allow_duplicate=True),
    Input('classification-prediction-upload-data', 'contents'),
    State('classification-prediction-upload-data', 'filename'),
    prevent_initial_call=True
)
def upload_data_prediction(contents, filename):
    if contents is not None:
        
        try:
                
            if flask.session.get('session_id', None) is None:
                flask.session['session_id'] = str(uuid.uuid4())

            df = parse_contents(contents, filename, 'predictionData')
            
            df = df.select_dtypes(include=['number'])
            
            upload_header = render_upload_header(filename, 'predictionData')
            
            feature_selection_dict = session_json_to_dict('feature_selection')
            
            df[df.index.name if df.index.name is not None else 'index'] = df.index

    
            form = ModelForm(
                PredictionFeatureSelectionSchema,
                "prediction_feature_selection",
                "main",
                fields_repr={
                    "prediction_column_name": fields.Text(
                        description="Prediction column name",
                        default=f"predicted_{feature_selection_dict.get('target')}",
                        required=True,
                    ),
                },
            )
            
            output = dmc.Stack(
                [
                    create_table_description(df),
                    dmc.Paper(
                        html.Div(
                            form,
                            style={'margin':20}
                        ),
                        withBorder=True,
                        shadow=0,
                    ),
                    dmc.Button("Predict", color="blue", id='classification-apply_prediction', n_clicks=0),
                    html.Div(id="classification-prediction-output"),
                ]
            )
            
            return output, upload_header, ""
            
        except Exception as e:
            
            print(e)

            upload_output = dmc.Alert(
                'There was an error processing this file.',
                color="red",
                variant="filled",
            )

            return upload_output, no_update, ""
    
    else:
        
        raise PreventUpdate

@callback(
    Output('classification-prediction-upload-output-data', 'children'),
    Output('classification-prediction-upload-header', 'children'),
    Input('classification-predictionData-remove-data', 'n_clicks'),
)
def remove_data(n_clicks):

    if n_clicks > 0:
        session_delete_file('predictionData')
        # reset_session()
        return upload_button, None
    else:
        raise PreventUpdate

@callback(
    Output("classification-prediction-output", "children"),
    Output("classification-proceed-output", "children", allow_duplicate=True),
    Output('classification-loading-predict_data','children',allow_duplicate=True),
    Input('classification-apply_prediction', 'n_clicks'),
    State(ModelForm.ids.main("prediction_feature_selection", 'main'), "data"),
    prevent_initial_call = True
)
def apply_prediction(n_clicks, form_data):
    if n_clicks > 0:
        
        try:
            schema = PredictionFeatureSelectionSchema(**form_data)
            
            result = predict_and_visualize_classification_model(schema)
            
            output = result
            
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
            ), no_update, no_update
        
        except Exception as exc:
            print(exc)
            
            return html.Div(
                [
                    dmc.Alert(
                        "There was an error predicting the data.",
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            ), no_update, no_update

    else:
        raise PreventUpdate

@callback(
    Output("classification-download-predicted-data", "data"),
    Input('classification-download_predicted_data_button', 'n_clicks'),
    prevent_initial_call=True
)
def download_predicted_data(n_clicks):
    if n_clicks > 0:
        return dcc.send_file(session_get_file_path('predictedData', extension='csv'), filename='predictedData.csv')
    else:
        raise PreventUpdate
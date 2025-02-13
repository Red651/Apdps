import dash_mantine_components as dmc
from dash import dcc, html, Input, Output, State, callback, no_update
from dash.exceptions import PreventUpdate
from dash_iconify import DashIconify
import flask
import uuid
from app.core.external.pages.sections.clustering.utils import session_delete_file, parse_contents, render_upload_header, reset_button, continue_button, parse_contents_schema,session_get_file_path, session_df_to_file, render_upload_header_database, get_well_data, get_existing_well_list, get_well_data_list, create_session, reset_button_pred, session_delete_file_schema
import pandas as pd
import pandas.api.types as ptypes
import joblib
import numpy as np
import plotly.graph_objs as go
import plotly.express as px
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, kmeans_plusplus
from app.api.well import crud, schemas
from app.core.security import authorize, get_current_user
import numpy as np
from sqlalchemy.orm import Session
from fastapi import Depends, Query
import pandas as pd
from typing import Optional, Literal, List
from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field, ValidationError, root_validator
from app.core.database import sessionmanager

upload_filename = None

def create_form_well_database(well_exist,well_data):
    class WellSelect(BaseModel):
        well_name: Literal[tuple(well_exist)] = Field(
            description="Choose Well To Use",
            default_factory=list,
            required=True
        )
        well_data_type: Literal[tuple(well_data)] = Field(
            default=well_data[0], 
            description="Feature selection method",
            required=True
        )
    
    return WellSelect

alert_predict = dmc.Alert(
                'The model is DBSCANS or Agglomerative Clustering. Predicted Result may have different criteria from the training sections',
                color="orange",
                variant="filled",
                withCloseButton=True
                )

session = {}

upload_button_data = dcc.Upload(
    id='predclus-upload-data',
    children=dmc.Stack([
        dmc.Flex(DashIconify(icon="ic:outline-cloud-upload", height=30),justify='center'),
        dmc.Text('Drag and Drop or Select Files'),
        dmc.Text("Accepted file types: .csv, .xlsx, .las .", c='#1890ff', ta='center', style={"fontSize": 12},),
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

upload_button_database = dmc.Button(
    id='predclus-upload-data-database',
    children=dmc.Stack([
        dmc.Flex(DashIconify(icon="ic:outline-cloud-upload", height=30), justify='center'),
        dmc.Text('Upload Data From Database'),
    ], gap=0, m='10px', justify='center'), n_clicks=0,
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
        'fontSize': '16px',
        'background-color':'white'
    },
)

upload_button_schema = dcc.Upload(
    id='predclus-upload-schema',
    children=dmc.Stack([
        dmc.Flex(DashIconify(icon="ic:outline-cloud-upload", height=30),justify='center'),
        dmc.Text('Drag and Drop or Select Files'),
        dmc.Text("Accepted file types: .joblib .", c='#1890ff', ta='center', style={"fontSize": 12},),
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

button_prediction = dmc.Button("Predict", color="blue", id='predclus-apply_prediction', n_clicks=0,fullWidth=True)
button_downloaded = dmc.Button("Download Predicted Data", color="blue", id='predclus-apply_download', n_clicks=0,fullWidth=True)

def create_prediction_plot(features_df: pd.DataFrame, predictions: list, type_selected) -> go.Figure:

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
                color='prediction',
                title=f'Boxplot Value of {col} with Predicted Labels',
                labels={'color': f'{'prediction'}'},
                template='simple_white'
                # color_continuous_scale=px.colors.qualitative.Safe,  # Use a qualitative color scale for categorical labels
            )

            fig_list[f'{col}'] = fig

    for i in range (0,len(columns)):
        if type_selected[i] == 'string':
            col = columns[i]
            df_aggregated = features_df.groupby(['prediction', columns[i]]).size().reset_index(name='counts')
            fig = px.bar(df_aggregated, x='prediction', y="counts", color=columns[i], title=f"Prediction vs Type of {columns[i]}")

            fig_list[f'{col}'] = fig
    
    visualizations = [dcc.Graph(figure=figure) for figure in fig_list.values()]

    return visualizations

def layout():

    
    layout = dmc.Stack(
        [   
            html.Div(
                dmc.Select(
                    label='Select Input File From',
                    value='file',
                    id='predclus-input-select',
                    data = [
                        {'value':'file', 'label':'File From Computer'},
                        {'value':'database', 'label':'File From Databases'}
                    ]
                ),
                style =  {'width':'50%'},
            ),
            html.Div(
                id='predclus-upload-header',
            ),
            html.Div(
                id='predclus-output-data'
            ), 
            html.Div(
                [
                    html.H4("Upload Your Prediction Schema (Model)", style={'textAlign': 'center'}),  # Judul di atas
                    upload_button_schema,
                ],
                id='predclus-upload-header-schema',
                style={'margin-top':'2px'},
            ),
            html.Div(
                id='predclus-output-schema'
            ),
            html.Div(
                id='predclus-proceed-prediction-button'
            ),
            dcc.Loading(type='circle',id='predclus-loading-predict_data',style={"width": "80px", "height": "80px"}),
            html.Div(
                id='predclus-proceed-output'
            ),
            html.Div(
                id='predclus-download-prediction',
            ),
            html.Div(
                id='predclus-alert-prediction'
            ),
            html.Div(
                reset_button_pred,
                id='predclus-reset-prediction'
            ),
            dmc.Modal(id='predclus-modal-database', opened=False),
        ],
        gap='md'
    )

    return layout

@callback(
    Output('predclus-upload-header','children',allow_duplicate=True),
    Output('predclus-output-data','children',allow_duplicate=True),
    Output('predclus-proceed-output','children',allow_duplicate=True),
    Input('predclus-input-select','value'),
    prevent_initial_call =True
)
def input_selected(value):
    if value == 'file':
        return upload_button_data, None, None
    else:
        return upload_button_database, None, None 

@callback(
    Output('predclus-output-data', 'children', allow_duplicate=True),
    Output('predclus-upload-header', 'children', allow_duplicate=True),
    Output('predclus-loading-predict_data','children',allow_duplicate=True),
    Input('predclus-upload-data', 'contents'),
    State('predclus-upload-data', 'filename'),
    prevent_initial_call=True
)
def upload_data_processing(contents, filename):
    if contents is not None:
        
        try:
                
            if flask.session.get('session_id', None) is None:
                flask.session['session_id'] = str(uuid.uuid4())

            df = parse_contents(contents, filename, 'predclus-rawData', False)
            upload_header = render_upload_header(filename, 'predclus-rawData')
            
            # df = df.describe()
            df = df.head(5)
            df = df.round(2)

            df.reset_index(inplace=True)
            
            upload_output = html.Div(
                dmc.Table(
                    striped=True,
                    highlightOnHover=True,
                    withColumnBorders=True,
                    withTableBorder=True,
                    withRowBorders=True,
                    data={
                        "head": df.columns.to_list(),
                        "body": df.values.tolist(),
                    }
                ),
                style={'overflow':'scroll'}
            )
            
            return upload_output, upload_header, ""
            
        except Exception as e:

            upload_output = dmc.Alert(
                'There was an error processing this file.',
                color="red",
                variant="filled",
                withCloseButton=True
            )

            return upload_output, no_update, ""
    
    else:
        
        raise PreventUpdate


@callback(
    Output('predclus-modal-database', 'opened'),
    Output('predclus-modal-database', 'children'),
    Output('predclus-output-data','children',allow_duplicate=True),
    Input('predclus-upload-data-database', 'n_clicks'),
    [State('predclus-input-select', 'value')],
    prevent_initial_call=True
)
def open_modal(n_clicks, selected_value):
    if selected_value == 'database' and n_clicks > 0:
        # Buat ulang form `well` setiap kali tombol upload diklik
        well_exist = get_existing_well_list()
        well_data = get_well_data_list()

        if len(well_exist) < 1:
            return False, None, dmc.Alert(
                    'Data from Existing Well Cannot Found',
                    color="red",
                    variant="filled",
                    withCloseButton=True
                )
        
        id_well = [str(id_['value']) for id_ in well_exist]
        option_label_name = {str(item['value']): item['label'] for item in well_exist}
        
        # Membuat form well database
        well_get = create_form_well_database(id_well, well_data)
        
        children_ = [ModelForm(
            well_get,
            "well_form",
            "main",
            fields_repr={
                "well_name": fields.Select(
                    options_labels=option_label_name,
                    description="Choose Well Name",
                    required=True,
                ),
                "well_data_type": fields.Select(
                    description="Choose Data to Use",
                    required=True,
                )
            },
        ),
        dmc.Space(h=20),
        dmc.Button("Apply", color="blue", id='predclus-database-submit', n_clicks=0),]
        
        # Modal dengan form yang baru dibuat
        modal_database = dmc.Modal(
            title="Are you sure you want to reset?",
            id='predclus-modal-database',
        )
        
        return True, children_, no_update  # Membuka modal dengan form baru

    return False, None, no_update  # Opens modal on button click

@callback(
    Output('predclus-output-data', 'children', allow_duplicate=True),
    Output('predclus-upload-header', 'children', allow_duplicate=True),
    Output('predclus-modal-database', 'opened', allow_duplicate=True),
    Input('predclus-database-submit','n_clicks'),
    State(ModelForm.ids.main("well_form", 'main'), "data"),
    prevent_initial_call=True
)
def upload_data_processing_database(n_clicks,form_data):
    if n_clicks > 0:

        if flask.session.get('session_id', None) is None:
            flask.session['session_id'] = str(uuid.uuid4())

        create_session()

        get_dataframe = get_well_data(form_data['well_name'],form_data['well_data_type'])

        if get_dataframe == None:
            upload_output = dmc.Alert(
                    'Data Type from Database is None',
                    color="red",
                    variant="filled",
                    withCloseButton=True
                )
            
            return upload_output, no_update, False
        
        else:
            turn_dataframe = pd.DataFrame(get_dataframe)
            upload_header = render_upload_header_database(f'database-{form_data['well_data_type']}', 'predclus-rawData')

            session_df_to_file(turn_dataframe, 'predclus-rawData')

            turn_dataframe = turn_dataframe.head(5)
            turn_dataframe = turn_dataframe.round(2)
            
            upload_output = html.Div(
                dmc.Table(
                    striped=True,
                    highlightOnHover=True,
                    withColumnBorders=True,
                    withTableBorder=True,
                    withRowBorders=True,
                    data={
                        "head": turn_dataframe.columns.to_list(),
                        "body": turn_dataframe.values.tolist(),
                    }
                ),
                style={'overflow':'scroll'}
            )
            
            return upload_output, upload_header, False
    return no_update, no_update, no_update
    
@callback(
    Output('predclus-output-schema', 'children', allow_duplicate=True),
    Output('predclus-upload-header-schema', 'children', allow_duplicate=True),
    Output('predclus-proceed-prediction-button', 'children', allow_duplicate=True),
    Input('predclus-upload-schema', 'contents'),
    State('predclus-upload-schema', 'filename'),
    prevent_initial_call=True
)

def upload_schema_process(contents, filename):
    global upload_filename

    if contents is not None:
        
        try:
            
            upload_filename = filename
            schema = parse_contents_schema(contents, filename, 'predclus-SchemaUse')
            header_schema = render_upload_header(filename,'predclus-schemaUse')
            
            output_schema = dmc.Alert(
                'Schema file processed successfully.',
                color="green",
                variant="filled",
                withCloseButton=True
            )
            return output_schema,header_schema, button_prediction
            
        except Exception as e:

            upload_output = dmc.Alert(
                'There was an error processing this file.',
                color="red",
                variant="filled",
                withCloseButton=True
            )

            return upload_output, no_update, no_update
    
    else:
        
        raise PreventUpdate
    
@callback(
    Output('predclus-proceed-output', 'children', allow_duplicate=True),
    Output('predclus-download-prediction', 'children', allow_duplicate=True),
    Output('predclus-alert-prediction', 'children', allow_duplicate=True),
    Output('predclus-loading-predict_data','children',allow_duplicate=True),
    Input('predclus-apply_prediction', 'n_clicks'),
    prevent_initial_call=True
)
def apply_prediction(n_clicks):
    global upload_filename
    
    if n_clicks > 0:
            
        try:
        
            if upload_filename.endswith('.joblib'):
                schema = joblib.load(session_get_file_path('predclus-SchemaUse', extension='joblib'))
            else:
                schema = joblib.load(session_get_file_path('predclus-SchemaUse', extension='pkl'))
    
            df_1 = pd.read_csv(session_get_file_path('predclus-rawData', extension='csv'), index_col=0)
            df = df_1.copy()
            df.reset_index(inplace=True)
            df_1.reset_index(inplace=True)
            
    
            column_name = schema['column']

            for col in range (0,len(column_name)):

                if ptypes.is_numeric_dtype(df[column_name[col]]):
                    if schema['missing_value'] == "remove":
                        df_1 = df_1.dropna(subset=[column_name[col]])
                        df = df.dropna(subset=[column_name[col]])
                    else:
                        fill_value = schema['fill'][col]
                        df[column_name[col]] = df[column_name[col]].fillna(fill_value)
                        

                    if schema['outlier_handling'] == "remove":
                        mean = schema['outlier_mean'][col]
                        std = schema['outlier_std'][col]
                        df = df[(np.abs(df[column_name[col]] - mean) <= (3 * std))]
                    elif schema['outlier_handling'] == "cap":
                        df[column_name[col]] = np.where(df[column_name[col]] > schema['outlier_cap'], schema['outlier_cap'], df[column_name[col]])
                        
                    scaler = schema['scaler'][col]
                    df[column_name[col]] = scaler.transform(df[column_name[col]].values.reshape(-1, 1)).flatten()

                else:
                    df_1 = df_1.dropna(subset=[column_name[col]])
                    df = df.dropna(subset=[column_name[col]])
                    le = schema['label_enc'][col]
                    df[column_name[col]] = le.transform(df[column_name[col]])

    
            df = df[schema['selected_features']]
            df_1 = df.copy()

            selected_features_idx = [int(np.where(i == np.array(schema['column']))[0][0]) for i in schema['selected_features']]
            type_selected = [schema['type'][i] for i in selected_features_idx]

    
            for i in selected_features_idx:
                col_name = schema['column'][i]
                col_type = schema['type'][i]

                if col_type == 'number':
                    scaler = schema['scaler'][i]
                    df_1[col_name] = scaler.transform(df_1[col_name].values.reshape(-1, 1)).flatten()
                
                else:
                    encode =   schema['label_enc'][i]
                    df_1[col_name] = encode.inverse_transform(df_1[col_name])
            

            model = schema['model']

            if schema['space'] == 'pca':
                pca = schema['pca']
                new_feature = pca.fit_transform(df)
                df = pd.DataFrame(new_feature,columns=['PC1','PC2'])

            if isinstance(model, AgglomerativeClustering) or isinstance(model,DBSCAN):
                predictions = model.fit_predict(df)
                alert = alert_predict
            else:
                predictions = model.predict(df)
                alert = ""

            df['prediction'] = predictions
            df_1['prediction'] = predictions
            session_df_to_file(df_1, 'predictedData')
            
            plot_df = df_1.copy()
            
            plot_df[plot_df.index.name if plot_df.index.name is not None else 'index'] = plot_df.index
            visualization = create_prediction_plot(df_1, predictions, type_selected)

            
            return dmc.Stack(
                    [
                        dmc.SimpleGrid(visualization, cols=3),
                        dcc.Download(id="predclus-download-predicted-data"),
                    ]
                ), button_downloaded, alert, ""
        
        except Exception as e:
            print(e)
            upload_output = dmc.Alert(
                'There was an error processing this file.',
                color="red",
                variant="filled",
                withCloseButton=True
            )

            return upload_output, no_update, no_update, ''

    else:
        raise PreventUpdate

    
@callback(
    Output('predclus-output-data', 'children'),
    Output('predclus-upload-header', 'children'),
    Input('predclus-rawData-remove-data', 'n_clicks'),
)
def remove_data(n_clicks):

    if n_clicks > 0:
        session_delete_file('predclus-rawData')
        # reset_session()
        return upload_button_data, None
    else:
        raise PreventUpdate

@callback(
    Output('predclus-output-data', 'children', allow_duplicate=True),
    Output('predclus-upload-header', 'children', allow_duplicate=True),
    Input('predclus-rawData-remove-data-database', 'n_clicks'),
    prevent_initial_call=True
)
def remove_data_database(n_clicks):
    if n_clicks > 0:
        session_delete_file('predclus-rawData')
        # reset_session()
        return upload_button_database, None
    else:
        raise PreventUpdate

@callback(
    Output('predclus-output-schema', 'children', allow_duplicate=True),
    Output('predclus-upload-header-schema', 'children', allow_duplicate=True),
    Output('predclus-proceed-prediction-button', 'children', allow_duplicate=True),
    Input('predclus-schemaUse-remove-data', 'n_clicks'),
    prevent_initial_call=True
)
def remove_schema(n_clicks):
    global upload_filename
    if n_clicks > 0:    

        if upload_filename.endswith('.joblib'):
            session_delete_file_schema('predclus-SchemaUse','joblib')
        else:
            session_delete_file_schema('predclus-SchemaUse','pkl')

        # reset_session()
        return upload_button_schema, None, None
    else:
        raise PreventUpdate
    
@callback(
    Output("predclus-download-predicted-data", "data"),
    Input('predclus-apply_download', 'n_clicks'),
    prevent_initial_call=True
)
def download_predicted_data(n_clicks):
    if n_clicks > 0:
        return dcc.send_file(session_get_file_path('predictedData', extension='csv'), filename='predictedData.csv')
    else:
        raise PreventUpdate
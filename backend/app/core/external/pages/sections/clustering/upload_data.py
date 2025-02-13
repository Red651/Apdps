import dash_mantine_components as dmc
from dash import dcc, html, Input, Output, State, callback, no_update
from dash.exceptions import PreventUpdate
from dash_iconify import DashIconify
from typing import Optional, Literal, List
from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field, ValidationError, root_validator
import flask
import uuid
from app.core.external.pages.sections.clustering.utils import session_delete_file, parse_contents, render_upload_header, reset_button, continue_button, session_df_to_file, session_schema_create, render_upload_header_database, get_well_data_list, get_existing_well_list, get_well_data, create_session
from app.api.well import crud, schemas
from app.core.security import authorize, get_current_user
import numpy as np
from sqlalchemy.orm import Session
from fastapi import Depends, Query
import pandas as pd
from app.core.database import sessionmanager

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

session = {}

upload_button = dcc.Upload(
    id='clustering-upload-data',
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

upload_button_database = dmc.Button(
    id='clustering-upload-data-database',
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

def layout():
    
    layout = dmc.Stack(
        [   
            
            html.Div(
                dmc.Select(
                    label='Select Input File From',
                    value='file',
                    id='clustering-input-select',
                    data = [
                        {'value':'file', 'label':'File From Computer'},
                        {'value':'database', 'label':'File From Databases'}
                    ]
                ),
                style =  {'width':'50%'},
            ),
            html.Div(
                id='clustering-upload-header',
            ),
            dcc.Loading(type='circle',id='clustering-loading-upload_data',style={"width": "80px", "height": "80px"}),
            dmc.Modal(id='clustering-modal-database', opened=False),
            html.Div(
                id='clustering-output-data'
            ),
            html.Div(
                id='clustering-alert-delete'
            ),  
            dmc.Group(
                [
                    reset_button,
                    html.Div(id='clustering-proceed-output')
                ],
                justify="space-between",
            )
        ],
        gap='md'
    )
    return layout

@callback(
    Output('clustering-upload-header','children',allow_duplicate=True),
    Output('clustering-output-data','children',allow_duplicate=True),
    Output('clustering-proceed-output','children',allow_duplicate=True),
    Input('clustering-input-select','value'),
    prevent_initial_call =True
)
def input_selected(value):
    if value == 'file':
        return upload_button, None, None
    else:
        return upload_button_database, None, None

@callback(
    Output('clustering-output-data', 'children', allow_duplicate=True),
    Output('clustering-upload-header', 'children', allow_duplicate=True),
    Output('clustering-proceed-output', 'children', allow_duplicate=True),
    Output('clustering-loading-upload_data','children',allow_duplicate=True),
    Output('clustering-alert-delete','children',allow_duplicate=True),
    Input('clustering-upload-data', 'contents'),
    State('clustering-upload-data', 'filename'),
    prevent_initial_call=True
)
def upload_data_processing(contents, filename):
    if contents is not None:
        try:
            if flask.session.get('session_id', None) is None:
                flask.session['session_id'] = str(uuid.uuid4())
            
            df = parse_contents(contents, filename, 'rawData', False)
            upload_header = render_upload_header(filename, 'clustering-rawData')

            
            df.reset_index(inplace=True)

            alert_delete = ''

            idx_check_null = df.isnull().all().to_numpy()

            if True in idx_check_null:
                idx_true = np.where(True==idx_check_null)[0]
                df.drop(df.columns[idx_true],axis=1,inplace=True)
                
                alert_delete = dmc.Alert(
                        'Some Column Deleted Because Null or Doesnt have Uniqueness',
                        color="orange",
                        variant="filled",
                        withCloseButton=True
                        )

            idx_check_non_unique = [True if len(df[col].unique()) == 1 or (len(df[col].unique()) == 2 and pd.isna(df[col].unique()).any()) else False for col in df.columns]

            if True in idx_check_non_unique:
                idx_true = np.where(True==np.array(idx_check_non_unique))[0]
                df.drop(df.columns[idx_true],axis=1,inplace=True)


                alert_delete = dmc.Alert(
                        'Some Column Deleted Because Null or Doesnt have Uniqueness',
                        color="orange",
                        variant="filled",
                        withCloseButton=True
                        )

            session_df_to_file(df, 'rawData')
            session_schema_create()

        
        # df = df.describe()
            df = df.head(5)
            df = df.round(2)
            
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
            
            return upload_output, upload_header, continue_button, "", alert_delete
            
        except Exception as e:

            upload_output = dmc.Alert(
                'There was an error processing this file.',
                color="red",
                variant="filled",
                withCloseButton=True
            )

            return upload_output, no_update, no_update, "", alert_delete
    
    else:
        
        raise PreventUpdate

@callback(
    Output('clustering-modal-database', 'opened'),
    Output('clustering-modal-database', 'children'),
    Output('clustering-output-data','children',allow_duplicate=True),
    Input('clustering-upload-data-database', 'n_clicks'),
    [State('clustering-input-select', 'value')],
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
        dmc.Button("Apply", color="blue", id='clustering-database-submit', n_clicks=0),]
        
        # Modal dengan form yang baru dibuat
        modal_database = dmc.Modal(
            title="Are you sure you want to reset?",
            id='clustering-modal-database',
        )
        
        return True, children_, no_update  # Membuka modal dengan form baru

    return False, None, no_update  # Opens modal on button click

@callback(
    Output('clustering-output-data', 'children', allow_duplicate=True),
    Output('clustering-upload-header', 'children', allow_duplicate=True),
    Output('clustering-proceed-output', 'children', allow_duplicate=True),
    Output('clustering-loading-upload_data','children',allow_duplicate=True),
    Output('clustering-modal-database', 'opened', allow_duplicate=True),
    Output('clustering-alert-delete','children',allow_duplicate=True),
    Input('clustering-database-submit','n_clicks'),
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
            
            return upload_output,no_update, no_update, "", False, alert_delete
        
        else:
            turn_dataframe = pd.DataFrame(get_dataframe)
            upload_header = render_upload_header_database(f'database-{form_data['well_data_type']}', 'clustering-rawData')

            alert_delete = ''

            idx_check_null = turn_dataframe.isnull().all().to_numpy()

            if True in idx_check_null:
                idx_true = np.where(True==idx_check_null)[0]
                turn_dataframe.drop(turn_dataframe.columns[idx_true],axis=1,inplace=True)
                
                alert_delete = dmc.Alert(
                        'Some Column Deleted Because Null or Doesnt have Uniqueness',
                        color="orange",
                        variant="filled",
                        withCloseButton=True
                        )

            idx_check_non_unique = [True if len(turn_dataframe[col].unique()) == 1 or (len(turn_dataframe[col].unique()) == 2 and pd.isna(turn_dataframe[col].unique()).any()) else False for col in turn_dataframe.columns]

            if True in idx_check_non_unique:
                idx_true = np.where(True==np.array(idx_check_non_unique))[0]
                turn_dataframe.drop(turn_dataframe.columns[idx_true],axis=1,inplace=True)


                alert_delete = dmc.Alert(
                        'Some Column Deleted Because Null or Doesnt have Uniqueness',
                        color="orange",
                        variant="filled",
                        withCloseButton=True
                        )

            session_df_to_file(turn_dataframe, 'rawData')

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
            
            return upload_output, upload_header, continue_button, "", False, alert_delete

    return no_update, no_update, no_update, no_update, no_update, no_update

@callback(
    Output('clustering-output-data', 'children', allow_duplicate=True),
    Output('clustering-upload-header', 'children',allow_duplicate=True),
    Output('clustering-proceed-output','children',allow_duplicate=True),
    Input('clustering-rawData-remove-data', 'n_clicks'),
    prevent_initial_call=True
)
def remove_data(n_clicks):
    if n_clicks > 0:
        session_delete_file('rawData')
        # reset_session()
        return None, upload_button, ''
    else:
        raise PreventUpdate
    

@callback(
    Output('clustering-output-data', 'children', allow_duplicate=True),
    Output('clustering-upload-header', 'children',allow_duplicate=True),
    Output('clustering-proceed-output','children',allow_duplicate=True),
    Input('clustering-rawData-remove-data-database', 'n_clicks'),
    prevent_initial_call=True
)
def remove_data_database(n_clicks):
    if n_clicks > 0:
        session_delete_file('rawData')
        # reset_session()
        return None, upload_button_database, ''
    else:
        raise PreventUpdate
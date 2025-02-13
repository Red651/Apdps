import time
import os
import shutil
import pandas as pd
import dash_mantine_components as dmc
from dash import html, Output, Input, callback
import threading
import flask
import json
from dash_iconify import DashIconify
import base64
import io
import numpy as np
import joblib
import lasio
from pathlib import Path
from app.api.visualize.lib.well_profile.well import Well
from app.api.well.models import ExistingWell, WellDigitalData, WellDigitalDataType
from app.core.database import sessionmanager

loader = dmc.Flex(dmc.Loader(color="blue", size="xl"), justify="center")
continue_button  = dmc.Popover(
        [
            dmc.PopoverTarget(dmc.Button("Next")),
            dmc.PopoverDropdown(
                dmc.Stack(
                    [
                        dmc.Text("Are you sure you want to proceed?"),
                        dmc.Button("Yes", id="next-button", n_clicks=0, color="green", variant="filled"),
                    ],
                    gap=5
                )
            ),
        ],
        id='next-popover',
        width=200,
        position="bottom",
        withArrow=True,
        shadow="md",
        zIndex=2000,
    )

@callback(
    Output("next-popover", "opened"),
    Input("next-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_next_modal(n_clicks):
    if n_clicks > 0:
        return False

reset_button = dmc.Button(
    "Reset",
    id="toggle-reset-modal",
    n_clicks=0,
    color="red",
    variant="filled",
)

def render_upload_header(filename, prefix):
    return dmc.Group(
        [
            dmc.ActionIcon(
                id=f"{prefix}-remove-data",
                color="red",
                size="md",
                radius="sm",
                children=DashIconify(icon="ic:outline-delete", height=20),
                n_clicks=0
            ),
            dmc.Text(
                filename,
                size="md",
            ),
        ],
        gap=5,
    )

def render_upload_header_database(filename, prefix):
    return dmc.Group(
        [
            dmc.ActionIcon(
                id=f"{prefix}-remove-data-database",
                color="red",
                size="md",
                radius="sm",
                children=DashIconify(icon="ic:outline-delete", height=20),
                n_clicks=0
            ),
            dmc.Text(
                filename,
                size="md",
            ),
        ],
        gap=5,
    )

def parse_contents(contents, filename, finalfilename, all_number=False):
        
    create_session()

    time.sleep(0.005)
    
    extension = session_content_to_file(contents, filename, 'initialData' )
    
    if extension == 'csv':
        df = pd.read_csv(session_get_file_path('initialData', extension=extension), index_col=0)
    elif extension == 'xlsx':
        df = pd.read_excel(session_get_file_path('initialData', extension=extension), index_col=0)
    elif extension == 'las':
        log = lasio.read(session_get_file_path('initialData', extension=extension))
        df = log.df()
    
    if all_number:
        df = df.select_dtypes(include=[np.number])
    
    session_df_to_file(df, finalfilename)
    
    return df

def parse_contents_schema(contents, filename, finalfilename):
    create_session()
    if 'joblib' in filename:
        extension = session_content_to_file(contents, filename, finalfilename)
        return None
    elif '.pkl' in filename:
        extension = session_content_to_file(contents, filename, finalfilename)
        return None
    else:
        raise Exception('Invalid file extension')

def create_timed_folder(folder_path):

    os.makedirs(folder_path, exist_ok=True)

    time.sleep(3600)

    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)

def create_session():
    path = 'app/core/external/sessions/' + flask.session['session_id']
    background_thread = threading.Thread(target=create_timed_folder, args=(path,))
    background_thread.daemon = True
    background_thread.start()

def session_content_to_file(contents, filename, finalfilename):
    
    content_type, content_string = contents.split(',')
    decoded = base64.b64decode(content_string)

    if filename.endswith('.csv'):
        extension = 'csv'
    elif filename.endswith('.xls') or filename.endswith('.xlsx'):
        extension = 'xlsx'
    elif filename.endswith('.las'):
        extension = 'las'
    elif filename.endswith('.joblib'):
        extension = 'joblib'
    elif filename.endswith('.pkl'):
        extension = 'pkl'
    else:
        raise Exception('Invalid file extension')
    
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + finalfilename + '.' + extension

    if extension != 'joblib':
        with open(Path(path), 'wb') as f:
            f.write(decoded)
    elif extension == 'joblib':
        with open(Path(path), 'wb') as f:
            f.write(decoded)
    
    return extension

def session_df_to_file(df, filename):
    df.to_csv(Path('app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.csv', index=True))
    
def session_delete_file(filename):
    os.remove(Path('app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.csv'))

def session_delete_file_schema(filename,extension):
    os.remove(Path('app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.' + extension))

def session_get_file_path(filename, extension=None):
    if extension:
        return Path('app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.' + extension)
    else:
        return Path('app/core/external/sessions/' + flask.session['session_id'] + '/' + filename)

def create_table_description(df: pd.DataFrame):

    df = df.describe()
    df = df.round(2)

    df.reset_index(inplace=True)
    
    return html.Div(
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
        # style={
        #     "width": "550px",
        #     "overflow-x": "scroll",
        #     }
        style={'overflow':'scroll'}
    )

def session_dict_to_json(dict, filename):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.json'
    with open(Path(path), 'w') as json_file:
        json.dump(dict, json_file)

def session_json_to_dict(filename):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.json'
    with open(Path(path), 'r') as json_file:
        return json.load(json_file)

def session_save_model(model, filename):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.joblib'
    joblib.dump(model, Path(path))

def parse_validation_errors(error):
    readable_errors = []
    for err in error.errors():
        loc = " -> ".join(str(l) for l in err['loc'])  # Converts location tuple to string
        msg = err['msg']  # Error message
        type_ = err['type']  # Error type
        readable_errors.append(f"Error in {loc}: {msg} (Type: {type_})")
    return readable_errors

def session_scaler_save(scaler,filename='SessionScale'):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.joblib'
    joblib.dump(scaler, Path(path))

def session_scaler_load(filename='SessionScale'):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.joblib'
    load = joblib.load(path)
    return load

def session_schema_create(filename='SessionSchema'):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.joblib'
    preprocessing_schema = {
        "type": [],  
        "missing_value": [],  
        "column": [],  
        "fill": [], 
        "outlier_handling": [], 
        "outlier_mean": [], 
        "outlier_std": [], 
        "outlier_cap": [], 
        "label_enc": [],  
        "scaler": [],  
        "selected_features": list,
        "space" : str,
        "model" : [],
    }
    joblib.dump(preprocessing_schema, Path(path))
    return preprocessing_schema

def session_schema_load(filename='SessionSchema'):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.joblib'
    load = joblib.load(path)
    return load

def session_schema_save(schema_file,filename='SessionSchema'):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.joblib'
    joblib.dump(schema_file, Path(path))

def get_numeric_value(filename='rawData'):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.csv'
    df = pd.read_csv(path,index_col=0)
    numeric_column = df.select_dtypes(include=['number']).columns.to_list()
    return numeric_column

def get_target_column(filename='rawData'):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.csv'
    df = pd.read_csv(path,index_col=0)
    target_column = df.select_dtypes(include=['object']).columns.to_list()
    return target_column

def get_target_value(column_name, filename='rawData'):
    path = 'app/core/external/sessions/' + flask.session['session_id'] + '/' + filename + '.csv'
    df = pd.read_csv(path,index_col=0)
    column_value = df[column_name].values
    return column_value

def get_existing_well_list():
    
    with sessionmanager.sync_session() as db:
        
        wells = db.query(ExistingWell.id, ExistingWell.well_name).all()
        
        well_list = []
        
        for well in wells:
            well_list.append(
                {
                    'value': well.id,
                    'label': well.well_name
                }
            )
        
        return well_list

def get_well_data_list():
    return [
        data_type.value for data_type in WellDigitalDataType
    ]

def get_well_data(well_id, well_digital_data_type: str):
    
    with sessionmanager.sync_session() as db:
        
        data = db.query(WellDigitalData).filter(WellDigitalData.data_type == WellDigitalDataType(well_digital_data_type), WellDigitalData.well_instance_id == well_id).first()

        if data is None:
            return None
            
        return data.data


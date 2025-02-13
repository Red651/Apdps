from app.core.external.pages.report_functions import generate_pusdatin_report
from app.core.database import get_sync_db_session
import dash_mantine_components as dmc
from dash import html, register_page, dcc, Output, Input, callback, State
from dash.exceptions import PreventUpdate
from datetime import datetime
import dash_ag_grid as dag
import pandas as pd
from app.core.database import sessionmanager

register_page(__name__, path='/report/pusdatin', title='Pusdatin Report')

def layout():
    
    with sessionmanager.sync_session() as db:
        pusdatin = pd.DataFrame(generate_pusdatin_report(db))
    
    layout = html.Div(
        dmc.Stack(
            [
                dmc.Stack(
                    [
                        dmc.Center(dmc.Title('Pusdatin Report', fw=200, fz=50)),
                        dmc.Center(dmc.Text(f'As of {datetime.now().strftime("%d %b %Y %H:%M")}')),
                        dmc.Center(dmc.Button("Download .xlsx", id="btn_xlsx", color="blue", variant="filled", radius="md", size="md", n_clicks=0)),
                        dcc.Download(id="download-pusdatin"),
                    ],
                    gap=5,
                ),
                dag.AgGrid(
                    id='pusdatin-data',
                    columnDefs=[
                        {
                            'headerName': col,
                            'field': col,
                            'editable': False,
                            'filter': True,
                            'sortable': True,
                        } for col in pusdatin.columns
                    ],
                    rowData=pusdatin.to_dict('records'),
                    className='ag-theme-quartz',
                    style={'height': '100%', 'width': '100%'},
                )
            ],
            style={'height': '150vh'}
        ),
        id='container',
        style={'height':'100vh'}
    )
    return layout

@callback(
    Output("download-pusdatin", "data"),
    Input("btn_xlsx", "n_clicks"),
    State("pusdatin-data", "rowData"),
    prevent_initial_call=True,
)
def func(n_clicks, data):
    if n_clicks > 0:
        df = pd.DataFrame(data)
        return dcc.send_data_frame(df.to_excel, "pusdatin_report.xlsx", sheet_name="Pusdatin Report")
    else:
        raise PreventUpdate


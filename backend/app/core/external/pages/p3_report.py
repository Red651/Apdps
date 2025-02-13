from turtle import st
from app.core.external.pages.report_functions import generate_p3_report
from app.core.database import get_sync_db_session
import dash_mantine_components as dmc
from dash import html, register_page, dcc, Output, Input, callback, State
from dash.exceptions import PreventUpdate
from datetime import datetime
import dash_ag_grid as dag
import pandas as pd
from app.api.job.models import JobType
from app.core.database import sessionmanager

register_page(__name__, path='/report/ppp', title='PPP Report')

def generate_p3_layout(df):
    
    return dmc.Stack(
            [
                dmc.Center(dmc.Button("Download .xlsx", id="btn_xlsx", color="blue", variant="filled", radius="md", size="md", n_clicks=0, mt='lg')),
                dcc.Download(id="download-p3"),
                dag.AgGrid(
                    id='p3-data',
                    columnDefs=[
                        {
                            'headerName': col,
                            'field': col,
                            'editable': False,
                            'filter': True,
                            'sortable': True,
                        } for col in df.columns
                    ],
                    rowData=df.to_dict('records'),
                    className='ag-theme-quartz',
                    style={'height': '100%', 'width': '100%'},
                )
            ],
            style={'height': '150vh'}
        )

def layout():
    
    job_type_dashboard = {}
    
    with sessionmanager.sync_session() as db:
        
        for job_type in JobType:
            df = pd.DataFrame(generate_p3_report(db, job_type))
            job_type_dashboard[job_type] = generate_p3_layout(df)
    
    pill_style = {"border": "1px solid #dee2e6",'border-radius': '45px'}
    
    layout = html.Div(
        dmc.Stack(
            [
                dmc.Stack(
                    [
                        dmc.Center(dmc.Title("PPP Report", fw=200, fz=50)),
                        dmc.Center(dmc.Text(f'As of {datetime.now().strftime("%d %b %Y %H:%M")}')),
                    ],
                    gap=5,
                ),
                dmc.Tabs(
                    [
                        dmc.Center(
                            dmc.TabsList(
                                [
                                    dmc.TabsTab(dmc.Text('Exploration', fw=400), value='exploration', style=pill_style),
                                    dmc.TabsTab(dmc.Text('Development', fw=400), value='development', style=pill_style),
                                    dmc.TabsTab(dmc.Text('Workover', fw=400), value='workover', style=pill_style),
                                    dmc.TabsTab(dmc.Text('Well Service', fw=400), value='wellservice', style=pill_style),
                                ]
                            ),
                        ),
                        dmc.TabsPanel(
                            job_type_dashboard[JobType.EXPLORATION],
                            value='exploration', pt='l', style={'height':'100%'}
                        ),
                        dmc.TabsPanel(
                            job_type_dashboard[JobType.DEVELOPMENT],
                            value='development', pt='l', style={'height':'100%'}
                        ),
                        dmc.TabsPanel(
                            job_type_dashboard[JobType.WORKOVER],
                            value='workover', pt='l', style={'height':'100%'}
                        ),
                        dmc.TabsPanel(
                            job_type_dashboard[JobType.WELLSERVICE],
                            value='wellservice', pt='l', style={'height':'100%'}
                        )
                    ],
                    value='exploration', 
                    variant='pills',
                    color='#22b8cf',
                    style={'height':'100%'}
                )
            ],
        ),
        id='container',
        style={'height':'100vh'}
    )
    return layout

@callback(
    Output("download-p3", "data"),
    Input("btn_xlsx", "n_clicks"),
    State("p3-data", "rowData"),
    prevent_initial_call=True,
)
def func(n_clicks, data):
    if n_clicks > 0:
        df = pd.DataFrame(data)
        return dcc.send_data_frame(df.to_excel, "p3_report.xlsx", sheet_name="PPP Report")
    else:
        raise PreventUpdate


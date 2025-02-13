import dash_mantine_components as dmc
from dash import dcc, html
import plotly.graph_objects as go
import numpy as np
from app.core.database import get_sync_db_session
from app.api.job.models import *
from app.api.dashboard.crud import get_kkks_progress_by_job_type
from datetime import datetime, date
from sqlalchemy import or_
import pandas as pd
from collections import Counter
import calendar
from dash_iconify import DashIconify
from sqlalchemy import func, extract
from sqlalchemy import or_
from plotly.subplots import make_subplots
from datetime import timedelta, datetime
from app.api.dashboard.utils import COLOR_SEQUENCE
from string import Template
from app.core.database import sessionmanager

def get_job_summary_and_fig(db, job_type: JobType, period: str):
    
    current_year = datetime.now().year ##todo: sync with wpnb year

    rencana = db.query(
        (Job.plan_start_date).label('plan_start_date'),
    ).filter(
        Job.job_type == job_type,
        Job.planning_status == PlanningStatus.APPROVED,
        Job.wpb_year == current_year).all()

    # Query for realized jobs
    realisasi = db.query(
        (Job.actual_start_date).label('actual_start_date'),
    ).filter(
        Job.job_type == job_type,
        or_(
            Job.operation_status == OperationStatus.OPERATING,
            Job.operation_status == OperationStatus.FINISHED,
        ),
        Job.wpb_year == current_year).all()
    
    list_rencana = [date.plan_start_date for date in rencana]
    list_realisasi = [date.actual_start_date for date in realisasi]

    if 'month' == period:
        
        rencana = pd.to_datetime(pd.Series(list_rencana)).dt.to_period('M')
        realisasi = pd.to_datetime(pd.Series(list_realisasi)).dt.to_period('M')
        
        current = pd.to_datetime(pd.Series([date.today()])).dt.to_period('M')
        
        summary = {
            'rencana' : len(rencana[rencana == current[0]]),
            'realisasi' : len(realisasi[realisasi == current[0]]),
            'current' : date.today().strftime('%B %Y')
        }
        
        start_date = datetime(current_year, 1, 1).date()
        end_date = datetime(current_year, 12, 31).date()
        
        months_list = np.unique(pd.date_range(start=start_date, end=end_date).to_period('M'))
        
        m=[]
        j_rencana=[]
        j_realisasi=[]

        month_counts_rencana = Counter(rencana)
        month_counts_realisasi = Counter(realisasi)
        nama_bulan = calendar.month_name[1:]
        
        for month in months_list:
            m.append(f'{nama_bulan[month.month-1]} {month.year}')
            try:
                j_rencana.append(month_counts_rencana[month])
                
            except:
                j_rencana.append(0)
            try:
                j_realisasi.append(month_counts_realisasi[month])
            except:
                j_realisasi.append(0)
        

        rencanasum = np.cumsum(j_rencana)
        realisasisum = np.cumsum(j_realisasi)
        
        fig = make_subplots(specs=[[{"secondary_y": True}]])
        fig.add_trace(go.Bar(y=j_rencana, x=m, name="Rencana", text=j_rencana, textposition='auto', marker_color=COLOR_SEQUENCE[0]), secondary_y=False)
        fig.add_trace(go.Bar(y=j_realisasi, x=m, name="Realisasi", text=j_realisasi, textposition='auto', marker_color=COLOR_SEQUENCE[1]), secondary_y=False)
        fig.add_trace(go.Scatter(y=rencanasum, x=m, name="Rencana Kumulatif", marker_color=COLOR_SEQUENCE[2]), secondary_y=True)
        fig.add_trace(go.Scatter(y=realisasisum, x=m, name="Realisasi Kumulatif", marker_color=COLOR_SEQUENCE[3]), secondary_y=True)

        # Update layout for better visualization
        fig.update_layout(
            hovermode='x unified',
            template='plotly_white',
            margin={'l': 0, 'r': 0, 'b': 0, 't': 0},
            xaxis={'type': 'category'},  # Keep the category type for the x-axis
            yaxis2={'showgrid': False},  # Hide grid for secondary y-axis
            bargap=0.1,  # Add some gap between bars,
        )

        # Update the range of the primary and secondary y-axes to prevent overlap
        fig.update_yaxes(title_text="Count", secondary_y=False)
        fig.update_yaxes(title_text="Cumulative", secondary_y=True)
    
    if 'week' == period:
        
        def get_week(date):
            week_num = (date.day - 1) // 7 + 1
            return f'M{week_num} {date.strftime("%B %Y")}'
        
        rencana = pd.to_datetime(pd.Series(list_rencana)).apply(get_week)
        realisasi = pd.to_datetime(pd.Series(list_realisasi)).apply(get_week)

        current = f"M{(date.today().day - 1) // 7 + 1} {date.today().strftime('%B %Y')}"
        
        summary = {
            'rencana' : len(rencana[rencana == current]),
            'realisasi' : len(realisasi[realisasi == current]),
            'current' : current
        }
        
        current_year = 2024

        start_date = datetime(current_year, 1, 1).date()
        end_date = datetime(current_year, 12, 31).date()

        week_list = []
        current_date = start_date
        while current_date <= end_date:
            week_number = (current_date.day - 1) // 7 + 1
            label = f"M{week_number} {current_date.strftime('%B')} {current_date.year}"
            week_list.append(label)
            current_date += timedelta(days=7)
        
        w=week_list
        j_rencana=[]
        j_realisasi=[]

        week_counts_rencana = Counter(rencana)
        week_counts_realisasi = Counter(realisasi)
        
        for week in week_list:
            try:
                j_rencana.append(week_counts_rencana[week])
            except:
                j_rencana.append(0)
            try:
                j_realisasi.append(week_counts_realisasi[week])
            except:
                j_realisasi.append(0)

        rencanasum = np.cumsum(j_rencana)
        realisasisum = np.cumsum(j_realisasi)

        # Graph components
        fig = make_subplots(specs=[[{"secondary_y": True}]])
        fig.add_trace(go.Bar(y=j_rencana, x=w, name="Rencana", marker_color=COLOR_SEQUENCE[0]),secondary_y=False)
        fig.add_trace(go.Bar(y=j_realisasi, x=w, name="Realisasi", marker_color=COLOR_SEQUENCE[1]),secondary_y=False)
        fig.add_trace(go.Scatter(y=rencanasum, x=w, name="Rencana Kumulatif", marker_color=COLOR_SEQUENCE[2]),secondary_y=True)
        fig.add_trace(go.Scatter(y=realisasisum, x=w, name="Realisasi Kumulatif", marker_color=COLOR_SEQUENCE[3]),secondary_y=True)
        fig.update_layout(hovermode='x unified')
        fig.update_layout(template='plotly_white')
        fig['layout']['xaxis']['type'] = 'category'
        fig['layout']['margin'] = {'l': 10, 'r': 10, 'b': 10, 't': 10}
        fig['layout']['yaxis2']['showgrid'] = False
    
    if 'day' == period:

        start_date = datetime(current_year, 1, 1).date()
        end_date = datetime(current_year, 12, 31).date()
            
        rencana = pd.Series(list_rencana)
        realisasi = pd.Series(list_realisasi)
        
        summary = {
            'rencana' : len(rencana[rencana == date.today()]),
            'realisasi' : len(realisasi[realisasi == date.today()]),
            'current' : date.today().strftime('%d %B %Y')
        }

        day_list = pd.date_range(start=start_date, end=end_date)

        d=[]
        j_rencana=[]
        j_realisasi=[]

        day_counts_rencana = Counter(rencana)
        day_counts_realisasi = Counter(realisasi)

        for day in day_list:
            d.append(day.date().strftime("%d %B %Y"))
            try:
                j_rencana.append(day_counts_rencana[day.date()])

            except:
                j_rencana.append(0)
            try:
                j_realisasi.append(day_counts_realisasi[day.date()])
            except:
                j_realisasi.append(0)
        

        rencanasum = np.cumsum(j_rencana)
        realisasisum = np.cumsum(j_realisasi)

        # Graph components
        fig = make_subplots(specs=[[{"secondary_y": True}]])
        fig.add_trace(go.Bar(y=j_rencana, x=d, name="Rencana", marker_color=COLOR_SEQUENCE[0]),secondary_y=False)
        fig.add_trace(go.Bar(y=j_realisasi, x=d, name="Realisasi", marker_color=COLOR_SEQUENCE[1]),secondary_y=False)
        fig.add_trace(go.Scatter(y=rencanasum, x=d, name="Rencana Kumulatif", marker_color=COLOR_SEQUENCE[2]),secondary_y=True)
        fig.add_trace(go.Scatter(y=realisasisum, x=d, name="Realisasi Kumulatif", marker_color=COLOR_SEQUENCE[3]),secondary_y=True)
        fig.update_layout(hovermode='x unified')
        fig.update_layout(template='plotly_white')
        fig['layout']['margin'] = {'l': 10, 'r': 10, 'b': 10, 't': 10}
        fig['layout']['xaxis']['type'] = 'category'
        fig['layout']['yaxis2']['showgrid'] = False

    return {
        'summary' : summary,
        'fig' : fig
    }

# def generate_graph_row(names, values, max_value):
    
#     fig = go.Figure()
    
#     for name, value in zip(names, values):
#         fig.add_trace(go.Bar(
#             x=[name],
#             y=[value],
#             showlegend=False,
#             text=[value],
#             textposition='outside',
#         ))
        
#     fig.update_layout(barmode='group')
#     fig.update_layout(xaxis={'visible': False, 'showticklabels': False}, yaxis={'visible': False, 'showticklabels': False})
#     fig.update_layout(
#         autosize=True,
#         height=300,
#         margin=dict(
#             l=0,
#             r=0,
#             b=0,
#             t=0,
#         ),
#     )
#     fig.update_layout(template='simple_white')
#     fig.update_layout(yaxis_range=[0, max_value])
    
#     return dcc.Graph(figure=fig, style={'width': '100%'})

def generate_summary(db):
    
    results = db.query(
        Job.job_type,
        func.count(Job.id).filter(Job.planning_status == PlanningStatus.APPROVED).label('rencana'),
        func.count(Job.id).filter(Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED])).label('realisasi'),
        func.count(Job.id).filter(Job.actual_start_date == datetime.now().date()).label('change'),
    ).group_by(Job.job_type).all()

    dashboard_table_data = {}
    
    for result in results:
        job_type = result.job_type
        dashboard_table_data[job_type] = {}
        dashboard_table_data[job_type]["rencana"] = result.rencana
        dashboard_table_data[job_type]["realisasi"] = result.realisasi
        dashboard_table_data[job_type]["change"] = result.change
        dashboard_table_data[job_type]["percentage"] = int((result.realisasi/result.rencana)*100) if result.rencana > 0 else 0
    
    return dashboard_table_data

def render_template(file_path, variables):
    with open(file_path, 'r') as file:
        template_content = file.read()
        
    # Create a Template object
    template = Template(template_content)
    
    # Substitute variables into the template
    rendered_content = template.safe_substitute(variables)
    return rendered_content

# def progress_table_chart(db, job_type):
    
#     current_year = datetime.now().year ##todo: sync with wpnb year
    
#     rencana = db.query(
#         (Job.plan_start_date).label('plan_start_date'),
#     ).filter(
#         Job.job_type == job_type,
#         Job.planning_status == PlanningStatus.APPROVED,
#         Job.wpb_year == current_year).all()

#     # Query for realized jobs
#     realisasi = db.query(
#         (Job.actual_start_date).label('actual_start_date'),
#     ).filter(
#         Job.job_type == job_type,
#         or_(
#             Job.operation_status == OperationStatus.OPERATING,
#             Job.operation_status == OperationStatus.FINISHED,
#         ),
#         Job.wpb_year == current_year).all()
    
#     list_rencana = [date.plan_start_date for date in rencana]
#     list_realisasi = [date.actual_start_date for date in realisasi]
        
#     rencana = pd.to_datetime(pd.Series(list_rencana)).dt.to_period('M')
#     realisasi = pd.to_datetime(pd.Series(list_realisasi)).dt.to_period('M')
    
#     start_date = datetime(current_year, 1, 1).date()
#     end_date = datetime(current_year, 12, 31).date()
    
#     months_list = np.unique(pd.date_range(start=start_date, end=end_date).to_period('M'))
    
#     m=[]
#     j_rencana=[]
#     j_realisasi=[]

#     month_counts_rencana = Counter(rencana)
#     month_counts_realisasi = Counter(realisasi)
#     nama_bulan = calendar.month_name[1:]

#     for month in months_list:
#         m.append(f'{nama_bulan[month.month-1]}')
#         try:
#             j_rencana.append(month_counts_rencana[month])
            
#         except:
#             j_rencana.append(0)
#         try:
#             j_realisasi.append(month_counts_realisasi[month])
#         except:
#             j_realisasi.append(0)
    
#     rencanasum = np.cumsum(j_rencana)
#     realisasisum = np.cumsum(j_realisasi)
    
#     max_value = max(j_rencana+j_realisasi)
#     max_value += max_value*0.1

#     graph_rows = dmc.TableTr(
#         [
#             dmc.TableTd()
#         ] +
#         [
#             dmc.TableTd(
#                 dmc.Center(generate_graph_row(['Rencana', 'Realisasi'], [rencana, realisasi], max_value))
#             ) for rencana, realisasi in zip(j_rencana, j_realisasi)
#         ]
#     )

#     percentage = realisasisum / rencanasum[-1] * 100

#     body = dmc.TableTbody(
#         [
#             dmc.TableTr(
#                 [dmc.TableTd('Rencana')]+[
#                     dmc.TableTd(dmc.Center(value)) for value in j_rencana
#                 ]
#             ),
#             dmc.TableTr(
#                 [dmc.TableTd('Realisasi')]+[
#                     dmc.TableTd(dmc.Center(value)) for value in j_realisasi
#                 ]
#             ),
#             dmc.TableTr(
#                 [dmc.TableTd('Kumulatif Rencana')]+[
#                     dmc.TableTd(dmc.Center(value)) for value in rencanasum
#                 ]
#             ),
#             dmc.TableTr(
#                 [dmc.TableTd('Kumulatif Realisasi')]+[
#                     dmc.TableTd(dmc.Center(value)) for value in realisasisum
#                 ]
#             ),
#             dmc.TableTr(
#                 [dmc.TableTd('Persentase')]+[
#                     dmc.TableTd(dmc.Center(f'{int(percentage[i])}%')) for i in range(len(rencanasum))
#                 ]
#             ),
#         ]
#     )
    
#     head = dmc.TableTr(
#             [dmc.TableTh('Bulan',w=300)]+[
#                 dmc.TableTh(dmc.Center(value)) for value in m
#             ]
#         )

#     table = dmc.Table(
#         [
#             graph_rows,
#             head,
#             body
#         ],
#         striped=True,
#         highlightOnHover=True,
#         withTableBorder=True,
#         withRowBorders=True,
#         withColumnBorders=True,
#         style={'table-layout': 'fixed', 'width': '100%'}
#     )
    
#     return table

def generate_pusdatin_report(db):
    
    jobs = db.query(Job).filter(Job.ppp_status == PPPStatus.APPROVED).filter(Job.job_type.in_([JobType.EXPLORATION, JobType.DEVELOPMENT])).all()
    
    pusdatin = []
    
    for job in jobs:
        pusdatin.append(
            {
                'WK_ID': job.area.label,
                'WILAYAH_KERJA': job.area.name,
                'FIELD': job.field.name,
                'KKKS': job.kkks.name,
                'TAHUN_LAPOR': date.today().strftime("%d %b %Y"),
                'KUARTAL_LAPOR': f"Q{((datetime.now().month - 1) // 3) + 1}",
                'TAHUN': date.today().year,
                'BULAN': date.today().month,
                'NAMA_SUMUR': job.well_name,
                'NO_AFE': job.afe_number,
                'KOORDINAT_SUMUR_LONG': job.actual_job.well.surface_longitude,
                'KOORDINAT_SUMUR_LAT': job.actual_job.well.surface_latitude,
                'LOKASI': job.actual_job.well.environment_type,
                'FASE_SUMUR': job.job_type.value,
                'STATUS_SUMUR': job.actual_job.well.well_status,
                'TIPE_SUMUR': job.actual_job.well.well_class,
                'RENCANA_TVD': job.job_plan.well.maximum_tvd,
                'REALISASI_TVD ': job.actual_job.well.maximum_tvd,
                'RENCANA_MD': job.job_plan.well.final_md,
                'REALISASI_MD': job.actual_job.well.final_md,
                'TIPE_RIG': job.actual_job.rig_type,
                'KAPASITAS_RIG (HP)': job.actual_job.rig_horse_power,
                'TGL_TAJAK': job.actual_job.well.spud_date,
                'TGL_DRILLING_SELESAI*': job.actual_job.well.final_drill_date,
                'DTTM_UPDATE': datetime.now().strftime("%d %b %Y %H:%M"),
                'UPDATE_BY': 'ApDPS'
            }
        )

    return pusdatin

def card_statistik(stat,icon,color,leftlabel,rightlabel):
    return dmc.Card(
    children=[
        dmc.CardSection(
                    dmc.Group(
                        [
                            dmc.Text(stat, fw=500, fz=40),
                            dmc.ThemeIcon(
                                size="xl",
                                color=color,
                                variant="light",
                                radius=90,
                                children=DashIconify(icon=icon, width=35),
                            )
                        ],
                        justify="space-between",
                        mt="md",
                        mb="xs",
                    ),
        withBorder=True,
        inheritPadding=True,
        ),
        dmc.Group([
            dmc.Text(
                leftlabel,
                fw=500,
                fz=20,
                # c=color
            ),
            dmc.Text(
                rightlabel,
                fw=500,
                fz=20
            ),
        ], justify="space-between", pt=15),
    ],
    withBorder=True,
    # shadow="sm",
    # radius="md",
)

def progress_to_color(value):
    if value < 30:
        return '#FFCCCC'  # Light red
    elif value < 100:
        return '#FFD580'  # Light orange
    elif value == 100:
        return '#B3E6B3'  # Light green
    
# def generate_wrm_progress(db, job_type):

#     output = get_wrm_progress_by_job_type(db, job_type, page_size=5000)
#     wrm_progresses = pd.DataFrame(output['jobs'])
#     wrm_progresses = wrm_progresses.drop(columns=['job_id', 'RENCANA MULAI', 'RENCANA SELESAI', 'REALISASI MULAI', 'REALISASI SELESAI'])
#     keys = wrm_progresses.columns
    
#     th_td_style = {
#         'width': '1%',
#         'word-wrap': 'break-word'
#     }
    
#     rows = [
#         dmc.TableTr(
#             [
#                 dmc.TableTd(f'{wrm_progress[key]}%', style={'background-color':progress_to_color(wrm_progress[key]), **th_td_style}) if isinstance(wrm_progress[key], int) else dmc.TableTd(wrm_progress[key], style=th_td_style) for key in keys
#             ] 
#         )
#         for wrm_progress in wrm_progresses.to_dict(orient="records")
#     ]

#     head = dmc.TableThead(
#         dmc.TableTr(
#             [
#                 dmc.TableTh(key, style=th_td_style) for key in keys
#             ]
#         ),
#     )
#     body = dmc.TableTbody(rows)
#     return dmc.Table(
#         [head, body], 
#         style={'width':'100%'},
#         highlightOnHover=True,
#         withTableBorder=True,
#         withRowBorders=True,
#         withColumnBorders=True,
#     )

# def generate_periodic_progress(db, job_type):
#     output = make_job_graph(db, job_type, ['month', 'week', 'day'])
    
#     return dmc.Stack(
#         [
#             dmc.Paper(dcc.Graph(figure=plotly.io.from_json(json.dumps(output['month']))), withBorder=True),
#             dmc.Paper(dcc.Graph(figure=plotly.io.from_json(json.dumps(output['week']))), withBorder=True),
#             dmc.Paper(dcc.Graph(figure=plotly.io.from_json(json.dumps(output['day']))), withBorder=True),
#         ]
#     )

def generate_kkks_progress(db, job_type):
    
    output = get_kkks_progress_by_job_type(db, job_type)
    kkks_progresses = pd.DataFrame(output)
    kkks_progresses = kkks_progresses.drop(columns=['id'])
    kkks_progresses = kkks_progresses.rename(columns={'name':'NAMA KKKS','rencana':'RENCANA', 'realisasi':'REALISASI', 'percentage':'PERSENTASE'})
    keys = kkks_progresses.columns
    
    th_td_style = {
        'width': '1%',
        'word-wrap': 'break-word'
    }
    
    rows = [
        dmc.TableTr(
            [
                dmc.TableTd(f'{kkks_progress[key]}%', style={'background-color':progress_to_color(kkks_progress[key]), **th_td_style}) if key=='PERSENTASE' else dmc.TableTd(kkks_progress[key], style=th_td_style) for key in keys
            ]
        )
        for kkks_progress in kkks_progresses.to_dict(orient="records")
    ]

    head = dmc.TableThead(
        dmc.TableTr(
            [
                dmc.TableTh(key, style=th_td_style) for key in keys
            ]
        ),
    )
    body = dmc.TableTbody(rows)
    return dmc.Table(
        [head, body], 
        style={'width':'100%'},
        striped=True,
        highlightOnHover=True,
        withTableBorder=True,
        withRowBorders=True,
        withColumnBorders=True,
    )

def generate_report(period: str):
    
    with sessionmanager.sync_session() as db:
    
        job_type_dashboard = {}
        
        pill_style = {"border": "1px solid #dee2e6",'border-radius': '45px'}
        
        summary = generate_summary(db)
        
        if period == 'day':
            title = 'Daily Progress Report'
            keterangan = 'hari ini'
        elif period == 'week':
            title = 'Weekly Progress Report'
            keterangan = 'minggu ini'
        elif period == 'month':
            title = 'Monthly Progress Report'
            keterangan = 'bulan ini'
        
        for job_type in JobType:
            
            data = get_job_summary_and_fig(db, job_type, period)
            current_progress_summary = data['summary']
            job_type_figure = data['fig']
            job_type_summary = summary[job_type]
            
            job_type_dashboard[job_type] = dmc.Stack(
                [
                    dmc.SimpleGrid(
                        [
                            card_statistik(
                                dmc.Group(
                                    [
                                        dmc.Text(job_type_summary['rencana'], fw=500, fz=40),
                                        dmc.Text(f'({current_progress_summary["rencana"]} {keterangan})', fw=400, fz=25)
                                    ]
                                ),
                                'fluent-mdl2:date-time-2',
                                'green',
                                'Rencana',
                                current_progress_summary["current"],
                            ),
                            card_statistik(
                                dmc.Group(
                                    [
                                        dmc.Group(
                                            [
                                                dmc.Text(job_type_summary['realisasi'], fw=500, fz=40),
                                            ]
                                        ),
                                        dmc.Group(
                                            [
                                                html.Div(DashIconify(icon='mdi:arrow-up-bold',color='green',width=35)),
                                                dmc.Text(f'{current_progress_summary["realisasi"]} {keterangan}', fw=400, fz=25, c='green'),
                                            ],
                                            gap=5
                                        ) if current_progress_summary["realisasi"] != 0 else None,
                                    ]
                                ),
                                'fluent-mdl2:date-time-2',
                                'red',
                                'Realisasi',
                                current_progress_summary["current"],
                            ),
                            card_statistik(
                                f'{int(job_type_summary['percentage'])}%',
                                'simple-line-icons:graph',
                                'blue',
                                'Persentase',
                                None,
                            ),
                        ],
                        cols=3,
                    ),
                    # progress_table_chart(db,job_type),
                    # generate_periodic_progress(db,job_type),
                    # dmc.Center(dmc.Title('Well Readiness Monitoring', fw=200, fz=50)),
                    # generate_wrm_progress(db,job_type),
                    dmc.Paper(
                        dcc.Graph(figure=job_type_figure, style={'padding':10}),
                        withBorder=True
                    ),
                    generate_kkks_progress(db,job_type)
                ],
                style={'padding-top':15}
            )
    
    return dmc.Stack(
            [
                dmc.Stack(
                    [
                        dmc.Center(dmc.Title(title, fw=200, fz=50)),
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
                            value='exploration', pt='l'
                        ),
                        dmc.TabsPanel(
                            job_type_dashboard[JobType.DEVELOPMENT],
                            value='development', pt='l'
                        ),
                        dmc.TabsPanel(
                            job_type_dashboard[JobType.WORKOVER],
                            value='workover', pt='l'
                        ),
                        dmc.TabsPanel(
                           job_type_dashboard[JobType.WELLSERVICE],
                            value='wellservice', pt='l'
                        )
                    ],
                    value='exploration', 
                    variant='pills',
                    color='#22b8cf'
                )
            ],
        )

def generate_p3_report(db, job_type):
    
    jobs = db.query(Job).filter(Job.ppp_status == PPPStatus.APPROVED).filter(Job.job_type==job_type).all()
    
    if job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
        departemen = 'Operasi Pengeboran'
    else:
        departemen = 'Operasi Kerja Ulang dan Perawatan Sumur'
    
    p3 = []
    
    for job in jobs:
        
        p3.append(
            {
                "Nama KKKS": job.kkks.name,
                "Nomor AFE": job.afe_number,
                "Nilai Anggaran (US $)": job.job_plan.total_budget,
                "Nomor Surat Masuk": job.nomor_surat_pengajuan_ppp,
                "Nama Sumur / Project Kegiatan": job.well_name,
                "Tanggal Surat P3 KKKS": job.date_ppp_proposed,
                "Tanggal Dokumen Lengkap": job.date_ppp_proposed,
                "Tanggal P3 Selesai": job.date_ppp_approved,
                "Lama Proses Evaluasi": (job.date_ppp_approved-job.date_ppp_proposed).days,
                "Status Penyelesaian": job.ppp_status,
                "Estimasi Realisasi Biaya (US $)": job.actual_job.total_budget,
                "PIC": None,
                "Nomor Surat Keluar": None,
                "Departemen Owner": departemen,
                "Proses Persetujuan": None
            }
        )
    
    return p3

def generate_text_report():
    
    current_date = datetime.now().date()
    current_month = current_date.month
    
    with sessionmanager.sync_session() as db:
        results = db.query(
            Job.job_type,
            func.count(Job.id).filter(Job.planning_status == PlanningStatus.APPROVED).label('rencana'),
            func.count(Job.id).filter(Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED])).label('realisasi'),
            func.count(Job.id).filter(Job.planning_status == PlanningStatus.APPROVED, extract('month', Job.actual_start_date) == current_month).label('rencana_bulan'),
            func.count(Job.id).filter(Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED]), extract('month', Job.actual_start_date) == current_month).label('realisasi_bulan'),
            func.count(Job.id).filter(Job.actual_start_date == datetime.now().date()).label('change'),
            func.count(Job.id).filter(Job.operation_status.in_([OperationStatus.OPERATING])).label('beroperasi'),
            func.count(Job.id).filter(Job.operation_status.in_([OperationStatus.FINISHED])).label('selesai'),
        ).group_by(Job.job_type).all()
        
        # Dictionary to hold the dashboard data
        data = {}

        for result in results:
            job_type = result.job_type
            data[job_type] = {
                "rencana": result.rencana,
                "realisasi": result.realisasi,
                "change": f"+{result.change}" if result.change > 0 else '-',
                "realisasi_bulan": result.realisasi_bulan,
                "rencana_bulan": result.rencana_bulan,
                "beroperasi": result.beroperasi,
                "selesai": result.selesai
            }
        
        job_type_issues = {}
        
        for job_type in JobType:
            
            issues = db.query(
                JobIssue
            ).join(
                Job, Job.id == JobIssue.job_id
            ).filter(
                Job.job_type == job_type,
                JobIssue.resolved == False
            ).all()
            
            if len(issues) >= 5:
                
                issues_text = [
                    f'{issue.job.well_name} - {issue.date_time.strftime("%Y-%m-%d %H:%M:%S")} - {issue.severity.value} - {issue.description}' for issue in issues[:5]
                ] + [
                    f'...and {len(issues)-5} more issues'
                ]
            
            else:
                
                issues_text = [
                    f'{issue.job.well_name} - {issue.date_time.strftime("%Y-%m-%d %H:%M:%S")} - {issue.severity.value} - {issue.description}' for issue in issues
                ]
            
            job_type_issues[job_type] = "\n".join(f"-{s}" for s in issues_text)
    
    variables = {
        "date": current_date.strftime("%A, %d %B %Y"),
        "month": current_date.strftime("%B"),
        "year": current_date.strftime("%Y"),
        
        # Pengeboran Eksplorasi
        "rencana_eksplorasi": data[JobType.EXPLORATION]["rencana"],
        "realisasi_eksplorasi_bulan": data[JobType.EXPLORATION]["realisasi_bulan"],
        "change_eksplorasi_bulan": data[JobType.EXPLORATION]["change"],
        "realisasi_eksplorasi_kumulatif": data[JobType.EXPLORATION]["realisasi"],
        "eksplorasi_beroperasi": data[JobType.EXPLORATION]["beroperasi"],
        "isu_eksplorasi": job_type_issues[JobType.EXPLORATION],

        # Pengeboran Eksploitasi
        "rencana_eksploitasi": data[JobType.DEVELOPMENT]["rencana"],
        "realisasi_eksploitasi_bulan": data[JobType.DEVELOPMENT]["realisasi_bulan"],
        "change_eksploitasi_bulan": data[JobType.DEVELOPMENT]["change"],
        "realisasi_eksploitasi_kumulatif": data[JobType.DEVELOPMENT]["realisasi"],
        "eksploitasi_beroperasi": data[JobType.DEVELOPMENT]["beroperasi"],
        "eksploitasi_selesai": data[JobType.DEVELOPMENT]["selesai"],
        "isu_eksploitasi": job_type_issues[JobType.DEVELOPMENT],

        # Kerja Ulang
        "rencana_kerja_ulang": data[JobType.WORKOVER]["rencana"],
        "rencana_kerja_ulang_bulan": data[JobType.WORKOVER]["rencana_bulan"],
        "realisasi_kerja_ulang_bulan": data[JobType.WORKOVER]["realisasi_bulan"],
        "change_kerja_ulang_bulan": data[JobType.WORKOVER]["change"],
        "realisasi_kerja_ulang_kumulatif": data[JobType.WORKOVER]["realisasi"],

        # Perawatan Sumur
        "rencana_perawatan": data[JobType.WELLSERVICE]["rencana"],
        "rencana_perawatan_bulan": data[JobType.WELLSERVICE]["rencana_bulan"],
        "realisasi_perawatan_bulan": data[JobType.WELLSERVICE]["realisasi_bulan"],
        "change_perawatan_bulan": data[JobType.WELLSERVICE]["change"],
        "realisasi_perawatan_kumulatif": data[JobType.WELLSERVICE]["realisasi"],
        "isu_kups": job_type_issues[JobType.WELLSERVICE],
    }

    return dmc.Stack(
            [
                dmc.Stack(
                    [
                        dmc.Center(dmc.Title("Daily Division Report", fw=200, fz=50)),
                        dmc.Center(dmc.Text(f'As of {datetime.now().strftime("%d %b %Y %H:%M")}')),
                    ],
                    gap=5,
                ),
                dmc.Center(
                    dmc.Code(
                        render_template('app/core/external/daily_report_text_template.txt', variables), block=True, w='30%'
                    )
                )
            ],
        )

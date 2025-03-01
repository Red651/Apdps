from sqlalchemy.orm import Session
from app.api.auth.models import *
from app.api.auth.schemas import *
from app.api.job.models import *
from app.api.job.utils import job_schema_map, wrm_name_map
from app.api.job.schemas import *
from app.api.well.crud import *
from app.api.well.schemas import *
from app.api.spatial.schemas import *
from app.api.dashboard.schemas import *
from app.api.dashboard.models import *
from app.api.well.models import *
from typing import Dict
from sqlalchemy import and_,case,or_
import plotly.graph_objs as go
from plotly.subplots import make_subplots
import json
from datetime import timedelta, datetime
from collections import Counter
from sqlalchemy import func, cast, Float
import plotly.graph_objects as go
import calendar
import numpy as np
import pandas as pd
from app.api.dashboard.utils import generate_pie_chart, generate_vs_bar_graph, generate_stimulation_graph, COLOR_SEQUENCE

job_type_map = {
    'Exploration': JobType.EXPLORATION,
    'Development': JobType.DEVELOPMENT,
    'Workover': JobType.WORKOVER,
    'Well Service': JobType.WELLSERVICE
}

def return_zero_if_none(value):
    if value is None:
        return 0
    else:
        return value

# #dashboard per job
# def get_plans_dashboard(db: Session, job_type: JobType, user):
#     if not kkks_id:
#         plans = db.query(Job).filter(Job.job_type == job_type).all()
        
#         # Modifikasi query summary untuk SQLite
#         summary = db.query(
#             func.count(Job.id).label('total'),
#             func.sum(case(
#                 (Job.planning_status.in_([PlanningStatus.APPROVED, PlanningStatus.PROPOSED, PlanningStatus.RETURNED]), 1),
#                 else_=0
#             )).label('diajukan'),
#             func.sum(case(
#                 (Job.planning_status == PlanningStatus.APPROVED, 1),
#                 else_=0
#             )).label('disetujui'),
#             func.sum(case(
#                 (Job.planning_status == PlanningStatus.RETURNED, 1),
#                 else_=0
#             )).label('dikembalikan'),
#         ).filter(Job.job_type == job_type).first()
#     else:
#         plans = db.query(Job).filter(Job.job_type == job_type, Job.kkks_id == kkks_id).all()
        
#         # Modifikasi query summary untuk SQLite
#         summary = db.query(
#             func.count(Job.id).label('total'),
#             func.sum(case(
#                 (Job.planning_status.in_([PlanningStatus.APPROVED, PlanningStatus.PROPOSED]), 1),
#                 else_=0
#             )).label('diajukan'),
#             func.sum(case(
#                 (Job.planning_status == PlanningStatus.APPROVED, 1),
#                 else_=0
#             )).label('disetujui'),
#             func.sum(case(
#                 (Job.planning_status == PlanningStatus.RETURNED, 1),
#                 else_=0
#             )).label('dikembalikan'),
#         ).filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()

#     result = {
#         "job_details": [],
#         "summary": {
#             "disetujui": summary.disetujui,
#             "diajukan": summary.diajukan,
#             "dikembalikan": summary.dikembalikan
#         }
#     }

#     for i, job in enumerate(plans):
#         job_detail = {
#             "id": job.id,
#             'NO': i+1,
#             "NAMA SUMUR": job.well_name if job.well_name else "N/A",
#             "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
#             "Field": job.field_name if job.field_name else "N/A",
#             "KKKS": job.kkks_name if job.kkks_name else "N/A",
#             "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
#             "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
#             "TANGGAL DIAJUKAN": job.date_proposed.strftime("%d %b %Y") if job.date_proposed else "N/A",
#             "STATUS": job.planning_status.value,
#         }
        
#         if job.job_type in [JobType.WELLSERVICE, JobType.WORKOVER]:
#             job_detail['JENIS PEKERJAAN'] = job.job_plan.job_category.value
        
#         result["job_details"].append(job_detail)

#     return result

# def get_operations_dashboard(db: Session, job_type: JobType, user) -> Dict[str, Dict]:
#     if not kkks_id:
#         jobs = db.query(Job).filter(Job.planning_status == PlanningStatus.APPROVED).filter(Job.job_type == job_type).all()

#         summary = db.query(
#             func.sum(case((Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED]), 1), else_=0)).label('beroperasi'),
#             func.sum(case((Job.planning_status == PlanningStatus.APPROVED, 1), else_=0)).label('disetujui'),
#             func.sum(case((Job.operation_status == OperationStatus.FINISHED, 1), else_=0)).label('selesai_beroperasi'),
#         ).filter(Job.job_type == job_type).first()
#     else:
#         jobs = db.query(Job).filter(Job.planning_status == PlanningStatus.APPROVED, Job.job_type == job_type, Job.kkks_id == kkks_id).all()
        
#         summary = db.query(
#             func.sum(case((Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED]), 1), else_=0)).label('beroperasi'),
#             func.sum(case((Job.planning_status == PlanningStatus.APPROVED, 1), else_=0)).label('disetujui'),
#             func.sum(case((Job.operation_status == OperationStatus.FINISHED, 1), else_=0)).label('selesai_beroperasi'),
#         ).filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()

#     result = {
#         "job_details": [],
#         "summary": {
#             "disetujui": summary.disetujui or 0,
#             "beroperasi": summary.beroperasi or 0,
#             "selesai_beroperasi": summary.selesai_beroperasi or 0
#         }
#     }
    
#     for i, job in enumerate(jobs):
#         job_detail = {
#             "id": job.id,
#             'NO': i+1,
#             "NAMA SUMUR": job.well_name if job.well_name else "N/A",
#             "ACTUAL_JOB_ID": job.actual_job_id if job.actual_job_id else "N/A",
#             "JOB_PLAN_ID": job.job_plan_id if job.job_plan_id else "N/A",
#             "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
#             "Field": job.field_name if job.field_name else "N/A",
#             "KKKS": job.kkks_name if job.kkks_name else "N/A",
#             "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
#             "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
#             "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
#             "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
#             "STATUS": job.operation_status.value if job.operation_status is not None else job.job_current_status
#         }
        
#         if job.job_type in [JobType.WELLSERVICE, JobType.WORKOVER]:
#             job_detail['JENIS PEKERJAAN'] = job.job_plan.job_category.value
        
#         result["job_details"].append(job_detail)
        
#     return result

# def get_ppp_dashboard(db: Session, job_type: JobType, user) -> Dict[str, Dict]:
#     if not kkks_id:
#         jobs = db.query(Job).filter(Job.operation_status == OperationStatus.FINISHED, Job.job_type == job_type).all()
        
#         summary = db.query(
#             func.sum(case((Job.ppp_status.in_([PPPStatus.PROPOSED.value, PPPStatus.APPROVED.value]), 1), else_=0)).label('diajukan'),
#             func.sum(case((Job.ppp_status == PPPStatus.APPROVED.value, 1), else_=0)).label('disetujui'),
#             func.sum(case((Job.operation_status == OperationStatus.FINISHED.value, 1), else_=0)).label('selesai_beroperasi'),
#         ).filter(Job.job_type == job_type).first()
#     else:
#         jobs = db.query(Job).filter(Job.operation_status == OperationStatus.FINISHED, Job.job_type == job_type, Job.kkks_id == kkks_id).all()
        
#         summary = db.query(
#             func.sum(case((Job.ppp_status.in_([PPPStatus.PROPOSED.value, PPPStatus.APPROVED.value]), 1), else_=0)).label('diajukan'),
#             func.sum(case((Job.ppp_status == PPPStatus.APPROVED.value, 1), else_=0)).label('disetujui'),
#             func.sum(case((Job.operation_status == OperationStatus.FINISHED.value, 1), else_=0)).label('selesai_beroperasi'),
#         ).filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()
    
#     result = {
#         "job_details": [],
#         "summary": {
#             "selesai_beroperasi": summary.selesai_beroperasi or 0,
#             "diajukan": summary.diajukan or 0,
#             "disetujui": summary.disetujui or 0
#         }
#     }
    
#     for i, job in enumerate(jobs):
#         job_detail = {
#             "id": job.id,
#             'NO': i+1,
#             "NAMA SUMUR": job.well_name if job.well_name else "N/A",
#             "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
#             "Field": job.field_name if job.field_name else "N/A",
#             "KKKS": job.kkks_name if job.kkks_name else "N/A",
#             "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
#             "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
#             "TANGGAL P3 DIAJUKAN": job.date_ppp_proposed.strftime("%d %b %Y") if job.date_ppp_proposed else "Belum Diajukan",
#             "TANGGAL P3 DISETUJUI": job.date_ppp_approved.strftime("%d %b %Y") if job.date_ppp_approved else "Belum Disetujui" if job.date_ppp_proposed else "Belum Diajukan",
#             "STATUS": job.ppp_status.value if job.ppp_status is not None else job.job_current_status
#         }
        
#         if job.job_type in [JobType.WELLSERVICE, JobType.WORKOVER]:
#             job_detail['JENIS PEKERJAAN'] = job.job_plan.job_category.value
        
#         result["job_details"].append(job_detail)
    
#     return result

# def get_co_dashboard(db: Session, job_type: JobType, user) -> Dict[str, Dict]:
#     if not kkks_id:
#         jobs = db.query(Job).filter(Job.ppp_status == PPPStatus.APPROVED, Job.job_type == job_type).all()
        
#         summary = db.query(
#             func.sum(case((Job.closeout_status.in_([CloseOutStatus.PROPOSED, CloseOutStatus.APPROVED]), 1), else_=0)).label('diajukan'),
#             func.sum(case((Job.closeout_status == CloseOutStatus.APPROVED, 1), else_=0)).label('disetujui'),
#             func.sum(case((Job.ppp_status == PPPStatus.APPROVED, 1), else_=0)).label('selesai_p3'),
#         ).filter(Job.job_type == job_type).first()
#     else:
#         jobs = db.query(Job).filter(Job.ppp_status == PPPStatus.APPROVED, Job.job_type == job_type, Job.kkks_id == kkks_id).all()
        
#         summary = db.query(
#             func.sum(case((Job.closeout_status.in_([CloseOutStatus.PROPOSED, CloseOutStatus.APPROVED]), 1), else_=0)).label('diajukan'),
#             func.sum(case((Job.closeout_status == CloseOutStatus.APPROVED, 1), else_=0)).label('disetujui'),
#             func.sum(case((Job.ppp_status == PPPStatus.APPROVED, 1), else_=0)).label('selesai_p3'),
#         ).filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()

#     result = {
#         "job_details": [],
#         "summary": {
#             "selesai_p3": summary.selesai_p3 or 0,
#             "diajukan": summary.diajukan or 0,
#             "disetujui": summary.disetujui or 0
#         }
#     }
    
#     for i, job in enumerate(jobs):
#         job_detail = {
#             "id": job.id,
#             'NO': i+1,
#             "NAMA SUMUR": job.well_name if job.well_name else "N/A",
#             "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
#             "Field": job.field_name if job.field_name else "N/A",
#             "KKKS": job.kkks_name if job.kkks_name else "N/A",
#             "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
#             "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
#             "TANGGAL CO DIAJUKAN": job.date_co_proposed.strftime("%d %b %Y") if job.date_co_proposed else "N/A",
#             "TANGGAL CO DISETUJUI": job.date_co_approved.strftime("%d %b %Y") if job.date_co_approved else "N/A",
#             "STATUS": job.closeout_status.value if job.closeout_status is not None else job.job_current_status
#         }
        
#         if job.job_type in [JobType.WELLSERVICE, JobType.WORKOVER]:
#             job_detail['JENIS PEKERJAAN'] = job.job_plan.job_category.value
        
#         result["job_details"].append(job_detail)
    
#     return result

#home dashboard
def get_dashboard_progress_tablechart(db: Session) -> Dict:

    results = db.query(
        Job.job_type,
        func.count(Job.id).filter(Job.planning_status == PlanningStatus.APPROVED).label('rencana'),
        func.count(Job.id).filter(Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED])).label('realisasi'),
        func.count(Job.id).filter(Job.actual_start_date == datetime.now().date()).label('change'),
    ).group_by(Job.job_type).all()

    dashboard_table_data = {}
    
    for result in results:
        job_type = result.job_type.value.lower()
        dashboard_table_data[job_type] = {}
        dashboard_table_data[job_type]["rencana"] = result.rencana
        dashboard_table_data[job_type]["realisasi"] = result.realisasi
        dashboard_table_data[job_type]["change"] = result.change
        dashboard_table_data[job_type]["percentage"] = round((result.realisasi/result.rencana)*100,0) if result.rencana > 0 else 0
    
    job_types = list(job_type_map.keys())
    
    fig = go.Figure(data=[
        go.Bar(name='Rencana', x=job_types, y=[dashboard_table_data.get(job_type_map[job_type].value.lower(),{}).get("rencana",0) for job_type in job_types], marker_color=COLOR_SEQUENCE[0]),
        go.Bar(name='Realisasi', x=job_types, y=[dashboard_table_data.get(job_type_map[job_type].value.lower(),{}).get("realisasi",0) for job_type in job_types], marker_color=COLOR_SEQUENCE[1])
    ])
    
    fig.update_layout(
        hovermode='x unified',
        template='plotly_white',
        margin={'l': 0, 'r': 0, 'b': 0, 't': 0},
        xaxis={'type': 'category'},  # Keep the category type for the x-axis
        yaxis2={'showgrid': False},  # Hide grid for secondary y-axis
        bargap=0.1,  # Add some gap between bars,
    )
    
    fig.update_layout(barmode='group')
    fig.update_layout(template='plotly_white')
    fig_json = fig.to_json(pretty=True, engine="json")
    fig_data = json.loads(fig_json)
    
    return {
        'table':dashboard_table_data,
        'plot':fig_data
    }

#make graph
def make_job_graph(db: Session, job_type: JobType, periods: list, kkks_id: str = None) -> Dict[str, Dict]:
    
    current_year = datetime.now().year ##todo: sync with wpnb year
    
    if not kkks_id:
        
        # Query for planned jobs
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
    else:
        
        rencana = db.query(
            (Job.plan_start_date).label('plan_start_date'),
        ).filter(
            Job.job_type == job_type,
            Job.kkks_id == kkks_id,
            Job.planning_status == PlanningStatus.APPROVED,
            Job.wpb_year == current_year).all()

        # Query for realized jobs
        realisasi = db.query(
            (Job.actual_start_date).label('actual_start_date'),
        ).filter(
            Job.job_type == job_type,
            Job.kkks_id == kkks_id,
            or_(
                Job.operation_status == OperationStatus.OPERATING,
                Job.operation_status == OperationStatus.FINISHED,
            ),
            Job.wpb_year == current_year).all()
        
    
    list_rencana = [date.plan_start_date for date in rencana]
    list_realisasi = [date.actual_start_date for date in realisasi]

    output = {}
    
    if 'month' in periods:
        
        rencana = pd.to_datetime(pd.Series(list_rencana)).dt.to_period('M')
        realisasi = pd.to_datetime(pd.Series(list_realisasi)).dt.to_period('M')
        
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

        fig_json = fig.to_json(pretty=True, engine="json")
        fig_data = json.loads(fig_json)
        output['month'] = fig_data
    
    if 'week' in periods:
        
        def get_week(date):
            week_num = (date.day - 1) // 7 + 1
            return f'M{week_num} {date.strftime("%B %Y")}'
        
        rencana = pd.to_datetime(pd.Series(list_rencana)).apply(get_week)
        realisasi = pd.to_datetime(pd.Series(list_realisasi)).apply(get_week)
        
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
        
        fig_json = fig.to_json(pretty=True, engine="json")
        fig_data = json.loads(fig_json)
        
        output['week'] = fig_data
    
    if 'day' in periods:

        start_date = datetime(current_year, 1, 1).date()
        end_date = datetime(current_year, 12, 31).date()
            
        rencana = list_rencana
        realisasi = list_realisasi

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

        fig_json = fig.to_json(pretty=True, engine="json")
        fig_data = json.loads(fig_json)
        
        output['day'] = fig_data

    return output

def get_job_type_summary(db: Session, job_type: JobType, kkks_id: str = None):
    
    if not kkks_id:
    
        result = db.query(
            func.count(
                case(
                    (Job.planning_status == PlanningStatus.APPROVED, 1),
                    else_=None
                )
            ).label('rencana'),
            func.count(
                case(
                    (Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED]), 1),
                    else_=None
                )
            ).label('realisasi'),
            func.count(
                case(
                    (Job.operation_status == OperationStatus.FINISHED, 1),
                    else_=None
                )
            ).label('selesai')
        ).filter(Job.job_type == job_type).first()
    
    else:
        
        result = db.query(
            func.count(
                case(
                    (Job.planning_status == PlanningStatus.APPROVED, 1),
                    else_=None
                )
            ).label('rencana'),
            func.count(
                case(
                    (Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED]), 1),
                    else_=None
                )
            ).label('realisasi'),
            func.count(
                case(
                    (Job.operation_status == OperationStatus.FINISHED, 1),
                    else_=None
                )
            ).label('selesai')
        ).filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()

    return {
        'rencana': return_zero_if_none(result.rencana),
        'realisasi': return_zero_if_none(result.realisasi),
        'selesai': return_zero_if_none(result.selesai)
    }

def get_kkks_table_by_job_type(db: Session, job_type: JobType):
    
    
    
    columns = [
        KKKS.id,
        KKKS.name.label('name'),
        (func.count(Job.id).filter(
            Job.planning_status == PlanningStatus.APPROVED,
            Job.job_type == job_type,
        )).label('rencana'),
        (func.count(Job.id).filter(
            and_(
                or_(
                    Job.operation_status == OperationStatus.OPERATING,
                    Job.operation_status == OperationStatus.FINISHED,
                ),
                Job.job_type == job_type
            )
        )).label('realisasi'),
    ]

    query = db.query(
        *columns
        ).outerjoin(Job, KKKS.id == Job.kkks_id).group_by(KKKS.id, KKKS.name)

    results = query.all()

    kkks_data = []
    for result in results:

            
        kkks_data.append(
            dict(
                id=result.id,
                name=result.name,
                rencana=result.rencana,
                realisasi=result.realisasi,
                percentage=round( result.realisasi/ result.rencana * 100, 2) if result.rencana > 0 else 0,
            )  
        )
    
    total_results = query.count()
            
    return kkks_data

def get_costs_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    
    if not kkks_id:
        
        query = db.query(
            func.sum(Job.plan_total_budget).filter(
                Job.job_type == job_type,
                Job.planning_status == PlanningStatus.APPROVED,
            ).label('rencana'),
            func.sum(Job.actual_total_budget).filter(
                and_(
                    or_(
                        Job.operation_status == OperationStatus.OPERATING,
                        Job.operation_status == OperationStatus.FINISHED,
                    ),
                    Job.job_type == job_type
                )
            ).label('realisasi'),
        )
        
    else:
        
        query = db.query(
            func.sum(Job.plan_total_budget).filter(
                Job.job_type == job_type,
                Job.planning_status == PlanningStatus.APPROVED,
            ).label('rencana'),
            func.sum(Job.actual_total_budget).filter(
                and_(
                    or_(
                        Job.operation_status == OperationStatus.OPERATING,
                        Job.operation_status == OperationStatus.FINISHED,
                    ),
                    Job.job_type == job_type
                )
            ).label('realisasi'),
        ).filter(Job.kkks_id == kkks_id)
        
    result = query.first()
        
    
    return {
        'rencana': return_zero_if_none(result.rencana),
        'realisasi': return_zero_if_none(result.realisasi),
    }

def get_actual_well_status_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    
    if not kkks_id:

        result = (
            db.query(ActualWell.well_status.label('well_status'), func.count(ActualWell.well_status).label('count'))
            .join(JobInstance, JobInstance.well_id == ActualWell.id)
            .join(Job, Job.actual_job_id == JobInstance.job_instance_id)
            .filter(Job.job_type == job_type, 
                or_(
                    Job.operation_status == OperationStatus.OPERATING,
                    Job.operation_status == OperationStatus.FINISHED
                ))
            .group_by(ActualWell.well_status)
            .all()
        )

    else:
        
        result = (
            db.query(ActualWell.well_status.label('well_status'), func.count(ActualWell.well_status).label('count'))
            .join(JobInstance, JobInstance.well_id == ActualWell.id)
            .join(Job, Job.actual_job_id == JobInstance.job_instance_id)
            .filter(Job.job_type == job_type, 
                or_(
                    Job.operation_status == OperationStatus.OPERATING,
                    Job.operation_status == OperationStatus.FINISHED
                ))
            .filter(Job.kkks_id == kkks_id)
            .group_by(ActualWell.well_status)
            .all()
        )
    
    if result:
        output = {}
        for row in result:
            try:
                output[row.well_status] = row.count
            except:
                pass
        return output
    else:
        return []

def get_well_stimulation_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    
    if job_type == JobType.WORKOVER:
        plan_job_model = PlanWorkover
        actual_job_model = ActualWorkover
    elif job_type == JobType.WELLSERVICE:
        plan_job_model = PlanWellService
        actual_job_model = ActualWellService
        
    if not kkks_id:
        
        result_current = (
            db.query(
                func.sum(plan_job_model.onstream_oil).label('current_onstream_oil'), 
                func.sum(plan_job_model.onstream_gas).label('current_onstream_gas'), 
                )
            .join(Job, Job.job_plan_id == plan_job_model.job_instance_id)
            .filter(Job.job_type == job_type, 
                Job.planning_status == PlanningStatus.APPROVED)
            .first()
        )
        
        result_final = (
            db.query(
                func.sum(actual_job_model.onstream_oil).label('final_onstream_oil'), 
                func.sum(actual_job_model.onstream_gas).label('final_onstream_gas'), 
            )
            .join(Job, Job.actual_job_id == actual_job_model.job_instance_id)
            .filter(Job.job_type == job_type, 
                or_(
                    Job.operation_status == OperationStatus.OPERATING,
                    Job.operation_status == OperationStatus.FINISHED
                ))
            .first()
        )
        
    else:
        
        result_current = (
            db.query(
                func.sum(plan_job_model.onstream_oil).label('current_onstream_oil'), 
                func.sum(plan_job_model.onstream_gas).label('current_onstream_gas'), 
                )
            .join(Job, Job.job_plan_id == plan_job_model.job_instance_id)
            .filter(Job.job_type == job_type, Job.kkks_id == kkks_id,
                Job.planning_status == PlanningStatus.APPROVED)
            .first()
        )
        
        result_final = (
            db.query(
                func.sum(actual_job_model.onstream_oil).label('final_onstream_oil'), 
                func.sum(actual_job_model.onstream_gas).label('final_onstream_gas'), 
            )
            .join(Job, Job.actual_job_id == actual_job_model.job_instance_id)
            .filter(Job.job_type == job_type, Job.kkks_id == kkks_id,
                or_(
                    Job.operation_status == OperationStatus.OPERATING,
                    Job.operation_status == OperationStatus.FINISHED
                ))
            .first()
        )

    output = {
        'current_onstream_oil': return_zero_if_none(result_current.current_onstream_oil),
        'current_onstream_gas': return_zero_if_none(result_current.current_onstream_gas),
        'final_onstream_oil': return_zero_if_none(result_final.final_onstream_oil),
        'final_onstream_gas': return_zero_if_none(result_final.final_onstream_gas),
    }

    return output

def get_environment_type_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    
    if not kkks_id:
        
        result = (
            db.query(WellInstance.environment_type.label('environment_type'), func.count(WellInstance.environment_type).label('count'))
            .join(JobInstance, JobInstance.well_id == WellInstance.id)
            .join(Job, Job.job_plan_id == JobInstance.job_instance_id)
            .filter(Job.job_type == job_type, 
                or_(
                    Job.operation_status == OperationStatus.OPERATING,
                    Job.operation_status == OperationStatus.FINISHED
                ))
            .group_by(ActualWell.environment_type)
            .all()
        )
        
    else:
        
        result = (
            db.query(WellInstance.environment_type.label('environment_type'), func.count(WellInstance.environment_type).label('count'))
            .join(JobInstance, JobInstance.well_id == WellInstance.id)
            .join(Job, Job.job_plan_id == JobInstance.job_instance_id)
            .filter(Job.job_type == job_type, Job.kkks_id == kkks_id,
                or_(
                    Job.operation_status == OperationStatus.OPERATING,
                    Job.operation_status == OperationStatus.FINISHED
                ))
            .group_by(ActualWell.environment_type)
            .all()
        )
    
    if result:
        output = {}
        for row in result:
            output[row.environment_type] = row.count
        return output
    else:
        return None

def get_job_type_dashboard(db: Session, job_type: JobType, kkks_id: str = None):
    
    if not kkks_id:
    
        cost = get_costs_by_job_type(db, job_type, kkks_id)
        cost_graph = generate_vs_bar_graph(['Plan Cost', 'Actual Cost'],[cost['rencana'], cost['realisasi']], orientation='h')

        output = {
            'summary': get_job_type_summary(db, job_type, kkks_id),
            'job_graph': make_job_graph(db, job_type, ['month'], kkks_id),
            'cost_graph': cost_graph,
        }
        
        if job_type in [JobType.WELLSERVICE, JobType.WORKOVER]:
            well_stimulation = get_well_stimulation_by_job_type(db, job_type, kkks_id)
            well_stimulation_graph = generate_stimulation_graph(well_stimulation)
            output['well_stimulation_graph'] = well_stimulation_graph
        else:
            status_akhir = get_actual_well_status_by_job_type(db, job_type, kkks_id)
            status_akhir_graph = generate_pie_chart(list(status_akhir.values()), list(status_akhir.keys()))
            environment_type = get_environment_type_by_job_type(db, job_type, kkks_id)
            environment_type_graph = generate_pie_chart(list(environment_type.values()), list(environment_type.keys()))
            output['status_akhir_graph'] = status_akhir_graph
            output['environment_type_graph'] = environment_type_graph
            
    else:
        
        cost = get_costs_by_job_type(db, job_type, kkks_id)
        cost_graph = generate_vs_bar_graph(['Plan Cost', 'Actual Cost'],[cost['rencana'], cost['realisasi']], orientation='h')

        output = {
            'summary': get_job_type_summary(db, job_type, kkks_id),
            'job_graph': make_job_graph(db, job_type, ['month'], kkks_id),
            'cost_graph': cost_graph,
        }
        
        if job_type in [JobType.WELLSERVICE, JobType.WORKOVER]:
            well_stimulation = get_well_stimulation_by_job_type(db, job_type, kkks_id)
            well_stimulation_graph = generate_stimulation_graph(well_stimulation)
            output['well_stimulation_graph'] = well_stimulation_graph
        else:
            status_akhir = get_actual_well_status_by_job_type(db, job_type, kkks_id)
            status_akhir_graph = generate_pie_chart(list(status_akhir.values()), list(status_akhir.keys()))
            environment_type = get_environment_type_by_job_type(db, job_type, kkks_id)
            environment_type_graph = generate_pie_chart(list(environment_type.values()), list(environment_type.keys()))
            output['status_akhir_graph'] = status_akhir_graph
            output['environment_type_graph'] = environment_type_graph
    
    return output

def get_kkks_info(db: Session, kkks_id, user):
    
    summary = db.query(
        Job.job_type,
        func.count(Job.id).filter(Job.planning_status == PlanningStatus.APPROVED).label('rencana'),
        func.count(Job.id).filter(Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED])).label('realisasi'),
        func.count(Job.id).filter(Job.operation_status == OperationStatus.FINISHED).label('selesai'),
    ).filter(Job.kkks_id == kkks_id).group_by(Job.job_type).all()
    
    jobs = db.query(
        Job
    ).filter(Job.planning_status == PlanningStatus.APPROVED).filter(Job.kkks_id==kkks_id).all()
    
    job_dict = {job_type:[] for job_type in job_type_map.values()}
    
    for job in jobs:
        job_dict[job.job_type].append({
            "id": job.id,
            "NAMA SUMUR": job.well_name if job.well_name else "N/A",
            "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
            "Field": job.field_name if job.field_name else "N/A",
            "KKKS": job.kkks_name if job.kkks_name else "N/A",
            "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
            "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
            "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
            "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
            "STATUS": job.job_current_status
        })
    
    summary_dict = {
        summary_item.job_type:{
            "rencana": return_zero_if_none(summary_item.rencana),
            "realisasi": return_zero_if_none(summary_item.realisasi),
            "change": return_zero_if_none(summary_item.selesai),
        } for summary_item in summary
    }
    
    output_list = []
    
    for job_type_label, job_type in job_type_map.items():
        output_list.append(
            {
                job_type_label:{
                    "rencana": return_zero_if_none(summary_dict.get(job_type, {}).get("rencana", 0)),
                    "realisasi": return_zero_if_none(summary_dict.get(job_type, {}).get("realisasi", 0)),
                    "selesai": return_zero_if_none(summary_dict.get(job_type, {}).get("selesai", 0)),
                    "jobs": return_zero_if_none(job_dict.get(job_type, []))
                }
            }
        )
    
    output = {
        'map_geojson_path':f'/spatial/get/kkks-info/{kkks_id}',
        'data':output_list
    }
    
    return output

def get_summary_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):

    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")
    
    query = db.query(
        Job.job_type,
        func.count(Job.id).filter(Job.planning_status == PlanningStatus.APPROVED).label('rencana'),
        func.count(Job.id).filter(Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED])).label('realisasi'),
        func.count(Job.id).filter(Job.operation_status == OperationStatus.FINISHED).label('selesai'),
    )
    
    if not kkks_id:
        summary = query.group_by(Job.job_type).all()
    else:
        summary = query.filter(Job.kkks_id == kkks_id).group_by(Job.job_type).all()
        
    
    summary_dict = {
        summary_item.job_type:{
            "rencana": return_zero_if_none(summary_item.rencana),
            "realisasi": return_zero_if_none(summary_item.realisasi),
            "change": return_zero_if_none(summary_item.selesai),
        } for summary_item in summary
    }
    
    return summary_dict

def get_jobs_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):

    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")

    
    
    query = db.query(
        Job
    ).filter(
        Job.planning_status == PlanningStatus.APPROVED,
        Job.job_type == job_type
    )
    
    if not kkks_id:
        jobs = query.all()
        total = db.query(Job).filter(
            Job.planning_status == PlanningStatus.APPROVED,
            Job.job_type == job_type
        ).count()
    else:
        jobs = query.filter(Job.kkks_id==kkks_id).all()
        total = db.query(Job).filter(
            Job.planning_status == PlanningStatus.APPROVED,
            Job.job_type == job_type,
            Job.kkks_id == kkks_id
        ).count()

    output_list = []
    for job in jobs:
        output_list.append({
            "id": job.id,
            "NAMA SUMUR": job.well_name if job.well_name else "N/A",
            "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
            "Field": job.field_name if job.field_name else "N/A",
            "KKKS": job.kkks_name if job.kkks_name else "N/A",
            "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
            "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
            "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
            "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
            "STATUS": job.job_current_status
        })

    return output_list

def get_kkks_progress_by_job_type(db: Session, job_type: JobType):

    

    columns = [
        KKKS.id,
        KKKS.name.label('name'),
        (func.count(Job.id).filter(
            Job.planning_status == PlanningStatus.APPROVED,
            Job.job_type == job_type,
        )).label('rencana'),
        (func.count(Job.id).filter(
            and_(
                or_(
                    Job.operation_status == OperationStatus.OPERATING,
                    Job.operation_status == OperationStatus.FINISHED,
                ),
                Job.job_type == job_type
            )
        )).label('realisasi'),
    ]

    # Base query with outer join and grouping
    query = db.query(*columns).outerjoin(Job, KKKS.id == Job.kkks_id).group_by(KKKS.id, KKKS.name)

    # Get the results for the current page
    results = query.all()

    # Initialize the data list
    kkks_data = []
    for result in results:
        if result.rencana == 0 and result.realisasi == 0:
            pass
        else:
            kkks_data.append(
                dict(
                    id=result.id,
                    name=result.name,
                    rencana=result.rencana,
                    realisasi=result.realisasi,
                    percentage=round(result.realisasi / result.rencana * 100, 2) if result.rencana > 0 else 0,
                )
            )

    # Get the total count of results (without pagination) for metadata
    total_results = query.count()

    # Return paginated data with metadata
    return kkks_data

def get_dashboard_kkks_table(db: Session) -> Dict:
    
    # Define columns to query
    columns = [
        KKKS.id,
        KKKS.name.label('name')
    ] + [
        (cast(
            func.count(Job.id).filter(
                and_(
                    or_(
                        Job.operation_status == OperationStatus.OPERATING,
                        Job.operation_status == OperationStatus.FINISHED,
                    ),
                    Job.job_type == job_type
                )
            ), Float) / 
            cast(
                func.nullif(
                    func.count(Job.id).filter(
                        and_(
                            Job.planning_status == PlanningStatus.APPROVED,
                            Job.job_type == job_type
                        )
                    ), 0
                ), Float
            ) * 100
        ).label(f'{job_type.value.lower().replace(" ", "")}_percentage') for job_type in JobType
    ]

    # Create query
    query = db.query(
        *columns
    ).outerjoin(Job, KKKS.id == Job.kkks_id).group_by(KKKS.id, KKKS.name)

    # Get total count of KKKS records
    total_count = query.count()

    # Execute query and fetch results
    results = query.all()

    # Prepare data for response
    kkks_data = []
    for result in results:
        kkks_data.append(
            dict(
                id=result.id,
                name=result.name,
                exploration_percentage=round(result.exploration_percentage, 2) if result.exploration_percentage else 0,
                development_percentage=round(result.development_percentage, 2) if result.development_percentage else 0,
                workover_percentage=round(result.workover_percentage, 2) if result.workover_percentage else 0,
                wellservice_percentage=round(result.wellservice_percentage, 2) if result.wellservice_percentage else 0,
            )  
        )

    # Return paginated data along with total count
    return kkks_data

def get_wrm_progress_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    # Validate the job type
    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")
    
    # Calculate offset for pagination
    

    # Query with pagination (limit and offset)
    jobs_query = db.query(
        Job
    ).filter(
        Job.planning_status == PlanningStatus.APPROVED,
        Job.operation_status.in_([OperationStatus.OPERATING]),
        Job.job_type == job_type
    )

    # Get paginated results
    if kkks_id is None:
        jobs = jobs_query.all()
    else:
        jobs = jobs_query.filter(Job.kkks_id == kkks_id).all()

    # Initialize output list
    output = []

    # Process the jobs
    for job in jobs:
        db_actual_job = job.actual_job
        
        if not db_actual_job:
            raise HTTPException(status_code=404, detail="Job has not been operated yet")

        _output = {
            "job_id": job.id,
            "NAMA SUMUR": job.well_name if job.well_name else "N/A",
            "KKKS": job.kkks_name if job.kkks_name else "N/A",
            "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
            "LAPANGAN": job.field_name if job.field_name else "N/A",
            "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
            "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
            "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
            "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
            "STATUS": job.operation_status.value if job.operation_status is not None else job.job_current_status,
        }

        # Add WRM data to the output
        for wrm in list(job_schema_map[job_type]['wrm'].model_fields.keys()):
            _output[wrm_name_map.get(wrm).upper()] = getattr(db_actual_job, wrm)

        output.append(_output)

    # Return paginated results with metadata
    return output

def get_issues_plot_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):

    # Validate the job type
    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")
    
    query = db.query(
        JobIssue.severity,
        func.count(JobIssue.id).filter(JobIssue.resolved == False).label('amount'),
    )
    
    if not kkks_id:
        issues = query.group_by(JobIssue.severity).all()
    else:
        issues = query.join(Job, Job.id==JobIssue.job_id).filter(Job.kkks_id == kkks_id)
    
    severities = []
    count = []
    
    for issue in issues:
        severities.append(issue.severity.value.lower())
        count.append(issue.amount)
        
    return generate_pie_chart(count, severities)

def get_issues_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):

    # Validate the job type
    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")
    
    # Calculate offset for pagination
    

    # Query with pagination (limit and offset)
    issues_query = db.query(
        JobIssue
    )
    
    # Get paginated results
    if kkks_id is None:
        issues_query = issues_query.filter(
            Job.job_type == job_type,
            JobIssue.resolved == False
        )
    else:
        issues_query = issues_query.filter(
            Job.job_type == job_type,
            JobIssue.resolved == False,
            Job.kkks_id == kkks_id
        )
    
    issues = issues_query.all()

    # Initialize output list
    output = []

    # Process the issues
    for issue in issues:
        _output = {
            "job_id": issue.job.id,
            "NAMA SUMUR": issue.job.well_name if issue.job.well_name else "N/A",
            "KKKS": issue.job.kkks_name if issue.job.kkks_name else "N/A",
            "DESCRIPTION": issue.description,
            "DATE TIME": issue.date_time,
            "SEVERITY": issue.severity,
        }

        output.append(_output)

    # Calculate the total number of issues matching the filter (for pagination)
    if kkks_id is None:
        total_issues = db.query(
            JobIssue
        ).join(
            Job, Job.id == JobIssue.job_id
        ).filter(
            Job.job_type == job_type,
            JobIssue.resolved == False
        ).count()
    else:
        total_issues = db.query(
            JobIssue
        ).join(
            Job, Job.id == JobIssue.job_id
        ).filter(
            JobIssue.resolved == False,
            Job.job_type == job_type,
            Job.kkks_id == kkks_id
        ).count()

    # Return paginated results with metadata
    return output

def get_plan_summary_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):

    summary_query = db.query(
        func.count(Job.id).label('total'),
        func.sum(case(
            (Job.planning_status.in_([PlanningStatus.APPROVED, PlanningStatus.PROPOSED, PlanningStatus.RETURNED]), 1),
            else_=0
        )).label('diajukan'),
        func.sum(case(
            (Job.planning_status == PlanningStatus.APPROVED, 1),
            else_=0
        )).label('disetujui'),
        func.sum(case(
            (Job.planning_status == PlanningStatus.RETURNED, 1),
            else_=0
        )).label('dikembalikan'),
    )

    if kkks_id is None:
        summary = summary_query.filter(Job.job_type == job_type).first()
    else:
        summary = summary_query.filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()

    return {
        "disetujui": return_zero_if_none(summary.disetujui),
        "diproses": return_zero_if_none(summary.diajukan) - return_zero_if_none(summary.disetujui) - return_zero_if_none(summary.dikembalikan),
        "diajukan": return_zero_if_none(summary.diajukan),
        "dikembalikan": return_zero_if_none(summary.dikembalikan)
    }

def get_operation_summary_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):

    summary_query = db.query(
        func.sum(case((Job.operation_status.in_([OperationStatus.OPERATING]), 1), else_=0)).label('beroperasi'),
        func.sum(case((Job.planning_status == PlanningStatus.APPROVED, 1), else_=0)).label('disetujui'),
        func.sum(case((Job.operation_status == OperationStatus.FINISHED, 1), else_=0)).label('selesai_beroperasi'),
    )

    if kkks_id is None:
        summary = summary_query.filter(Job.job_type == job_type).first()
    else:
        summary = summary_query.filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()

    return {
        "disetujui": return_zero_if_none(summary.disetujui),
        "persiapan": return_zero_if_none(summary.disetujui) - return_zero_if_none(summary.beroperasi) - return_zero_if_none(summary.selesai_beroperasi),
        "beroperasi": return_zero_if_none(summary.beroperasi),
        "selesai_beroperasi": return_zero_if_none(summary.selesai_beroperasi)
    }

def get_ppp_summary_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):

    summary_query = db.query(
        func.sum(case((Job.ppp_status.in_([PPPStatus.PROPOSED, PPPStatus.APPROVED, PPPStatus.RETURNED]), 1), else_=0)).label('diajukan'),
        func.sum(case((Job.ppp_status == PPPStatus.APPROVED, 1), else_=0)).label('disetujui'),
        func.sum(case((Job.ppp_status == PPPStatus.RETURNED, 1), else_=0)).label('dikembalikan'),
        func.sum(case((Job.operation_status == OperationStatus.FINISHED, 1), else_=0)).label('selesai_beroperasi'),
    )

    if kkks_id is None:
        summary = summary_query.filter(Job.job_type == job_type).first()
    else:
        summary = summary_query.filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()

    return {
        "diajukan": return_zero_if_none(summary.diajukan),
        "diproses": return_zero_if_none(summary.diajukan) - return_zero_if_none(summary.disetujui) - return_zero_if_none(summary.dikembalikan),
        "disetujui": return_zero_if_none(summary.disetujui),
        "selesai_beroperasi": return_zero_if_none(summary.selesai_beroperasi)
    }

def get_co_summary_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):

    summary_query = db.query(
        func.sum(case((Job.closeout_status.in_([CloseOutStatus.PROPOSED, CloseOutStatus.APPROVED]), 1), else_=0)).label('diajukan'),
        func.sum(case((Job.closeout_status == CloseOutStatus.APPROVED, 1), else_=0)).label('disetujui'),
        func.sum(case((Job.ppp_status == PPPStatus.APPROVED, 1), else_=0)).label('selesai_p3'),
    )
    
    if kkks_id is None:
        summary = summary_query.filter(Job.job_type == job_type).first()
    else:
        summary = summary_query.filter(Job.job_type == job_type, Job.kkks_id == kkks_id).first()

    return {
        "diajukan": return_zero_if_none(summary.diajukan),
        "diproses": return_zero_if_none(summary.diajukan) - return_zero_if_none(summary.disetujui),
        "disetujui": return_zero_if_none(summary.disetujui),
        "selesai_p3": return_zero_if_none(summary.selesai_p3)
    }

def get_plan_jobs_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    # Validate the job type
    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")
    
    # Calculate offset for pagination
    

    # Query with pagination (limit and offset)
    jobs_query = db.query(
        Job
    ).filter(
        # Job.planning_status == PlanningStatus.APPROVED,
        Job.job_type == job_type
    )

    # Get paginated results
    if kkks_id is None:
        jobs = jobs_query.all()
    else:
        jobs = jobs_query.filter(Job.kkks_id == kkks_id).all()

    # Initialize output list
    output = []

    # Process the jobs
    for job in jobs:
        _output = {
            "job_id": job.id,
            "NAMA SUMUR": job.well_name if job.well_name else "N/A",
            "KKKS": job.kkks_name if job.kkks_name else "N/A",
            "WILAYAH KERJA": job.area_name if job.area_name else "N/A",            
            "LAPANGAN": job.field_name if job.field_name else "N/A",
            "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
            "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
            "TANGGAL DIAJUKAN": job.date_proposed.strftime("%d %b %Y") if job.date_proposed else "N/A",
            "STATUS": job.planning_status.value,
        }

        output.append(_output)

    # Return paginated results with metadata
    return output

def get_operation_jobs_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    # Validate the job type
    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")
    
    # Calculate offset for pagination
    

    # Query with pagination (limit and offset)
    jobs_query = db.query(
        Job
    ).filter(
        Job.planning_status == PlanningStatus.APPROVED,
        # Job.operation_status.in_([OperationStatus.OPERATING, OperationStatus.FINISHED]),
        Job.job_type == job_type
    )

    # Get paginated results
    if kkks_id is None:
        jobs = jobs_query.all()
    else:
        jobs = jobs_query.filter(Job.kkks_id == kkks_id).all()

    # Initialize output list
    output = []

    # Process the jobs
    for job in jobs:
        _output = {
            "job_id": job.id,
            "NAMA SUMUR": job.well_name if job.well_name else "N/A",
            "KKKS": job.kkks_name if job.kkks_name else "N/A",
            "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
            "LAPANGAN": job.field_name if job.field_name else "N/A",
            "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
            "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
            "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
            "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
            "STATUS": job.operation_status.value if job.operation_status is not None else job.job_current_status,
        }

        output.append(_output)

    # Return paginated results with metadata
    return output

def get_ppp_jobs_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    # Validate the job type
    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")
    
    # Calculate offset for pagination
    

    # Query with pagination (limit and offset)
    jobs_query = db.query(
        Job
    ).filter(
        Job.operation_status == OperationStatus.FINISHED,
        Job.job_type == job_type
    )

    # Get paginated results
    if kkks_id is None:
        jobs = jobs_query.all()
    else:
        jobs = jobs_query.filter(Job.kkks_id == kkks_id).all()

    # Initialize output list
    output = []

    # Process the jobs
    for job in jobs:
        _output = {
            "job_id": job.id,
            "NAMA SUMUR": job.well_name if job.well_name else "N/A",
            "KKKS": job.kkks_name if job.kkks_name else "N/A",
            "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
            "LAPANGAN": job.field_name if job.field_name else "N/A",
            "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
            "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
            "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
            "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
            "STATUS": job.ppp_status.value if job.ppp_status is not None else job.job_current_status,
        }

        output.append(_output)

    return output

def get_co_jobs_by_job_type(db: Session, job_type: JobType, kkks_id: str = None):
    # Validate the job type
    if job_type not in job_type_map.values():
        raise HTTPException(status_code=400, detail="Invalid job type")
    
    # Calculate offset for pagination
    

    # Query with pagination (limit and offset)
    jobs_query = db.query(
        Job
    ).filter(
        Job.ppp_status == PPPStatus.APPROVED,
        Job.job_type == job_type
    )

    # Get paginated results
    if kkks_id is None:
        jobs = jobs_query.all()
    else:
        jobs = jobs_query.filter(Job.kkks_id == kkks_id).all()

    # Initialize output list
    output = []

    # Process the jobs
    for job in jobs:
        _output = {
            "job_id": job.id,
            "NAMA SUMUR": job.well_name if job.well_name else "N/A",
            "KKKS": job.kkks_name if job.kkks_name else "N/A",
            "WILAYAH KERJA": job.area_name if job.area_name else "N/A",
            "LAPANGAN": job.field_name if job.field_name else "N/A",
            "RENCANA MULAI": job.plan_start_date.strftime("%d %b %Y") if job.plan_start_date else "N/A",
            "RENCANA SELESAI": job.plan_end_date.strftime("%d %b %Y") if job.plan_end_date else "N/A",
            "REALISASI MULAI": job.actual_start_date.strftime("%d %b %Y") if job.actual_start_date else "N/A",
            "REALISASI SELESAI": job.actual_end_date.strftime("%d %b %Y") if job.actual_end_date else "N/A",
            "STATUS": job.closeout_status.value if job.closeout_status is not None else job.job_current_status,
        }

        output.append(_output)

    # Return paginated results with metadata
    return output
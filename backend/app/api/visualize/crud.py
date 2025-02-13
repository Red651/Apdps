from typing import Literal

from fastapi.responses import FileResponse
from app.api.job.models import *
from app.api.utils.schemas import *
from sqlalchemy.orm import Session
from app.api.well.models import *
import app.api.visualize.lib.gantt_chart as gantt
import numpy as np
from plotly import graph_objects as go
from plotly.subplots import make_subplots
import json
from well_profile import load
from .lib.wellschematicspy import models, schematics
from io import BytesIO
import matplotlib.pyplot as plt
from fastapi import BackgroundTasks, Response
import matplotlib
from .lib.well_profile_func import render_well_profile, render_well_comparison
import segyio

colors = ['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52']
matplotlib.use('AGG')

def get_well_data(data_type: str, db: Session, well_id: str):
    return db.query(WellDigitalData).filter(WellDigitalData.data_type == data_type, WellDigitalData.well_id == well_id).first()

def serialize_work_breakdown_structure(db_job: Job,  wbs_type: Literal['plan', 'actual']):
    
    plan_wbs = db_job.job_plan.work_breakdown_structure
    actual_wbs = getattr(db_job.actual_job, 'work_breakdown_structure', None)
    
    actual_wbs_event_dict = {
        event.event : {
            'start_date': getattr(event, 'start_date'),
            'end_date': getattr(event, 'end_date')
        } for event in actual_wbs.events
    } if actual_wbs else {}
    
    if db_job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
        
        wrm_data = {
            "wrm_internal_kkks": {
                "label": "Internal KKKS",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_internal_kkks", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_internal_kkks", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_internal_kkks", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_internal_kkks", None), "end_date", None)
            },
            "wrm_persiapan_lokasi": {
                "label": "Persiapan Lokasi",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_persiapan_lokasi", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_persiapan_lokasi", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_persiapan_lokasi", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_persiapan_lokasi", None), "end_date", None)
            },
            "wrm_pengadaan_lli": {
                "label": "Pengadaan LLI",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_pengadaan_lli", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_pengadaan_lli", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_pengadaan_lli", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_pengadaan_lli", None), "end_date", None)
            },
            "wrm_pembebasan_lahan": {
                "label": "Pembebasan Lahan",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_pembebasan_lahan", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_pembebasan_lahan", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_pembebasan_lahan", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_pembebasan_lahan", None), "end_date", None)
            },
            "wrm_ippkh": {
                "label": "IPPKH",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_ippkh", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_ippkh", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_ippkh", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_ippkh", None), "end_date", None)
            },
            "wrm_ukl_upl": {
                "label": "UKL/UPL",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_ukl_upl", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_ukl_upl", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_ukl_upl", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_ukl_upl", None), "end_date", None)
            },
            "wrm_amdal": {
                "label": "Amdal",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_amdal", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_amdal", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_amdal", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_amdal", None), "end_date", None)
            },
            "wrm_pengadaan_rig": {
                "label": "Pengadaan Rig",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_pengadaan_rig", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_pengadaan_rig", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_pengadaan_rig", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_pengadaan_rig", None), "end_date", None)
            },
            "wrm_pengadaan_drilling_services": {
                "label": "Pengadaan Drilling Services",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_pengadaan_drilling_services", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_pengadaan_drilling_services", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_pengadaan_drilling_services", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_pengadaan_drilling_services", None), "end_date", None)
            },
            "wrm_evaluasi_subsurface": {
                "label": "Evaluasi Subsurface",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_evaluasi_subsurface", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_evaluasi_subsurface", None), "end_date", None),
                "actual_start_date": getattr(getattr(actual_wbs, "wrm_evaluasi_subsurface", None), "start_date", None),
                "actual_end_date": getattr(getattr(actual_wbs, "wrm_evaluasi_subsurface", None), "end_date", None)
            },
        }
        
        if db_job.job_type == JobType.DEVELOPMENT:
            
            wrm_data["wrm_cutting_dumping"] = {
                "label": "Cutting/Dumping",
                "plan_start_date": getattr(getattr(plan_wbs, "wrm_cutting_dumping", None), "start_date", None),
                "plan_end_date": getattr(getattr(plan_wbs, "wrm_cutting_dumping", None), "end_date", None)
            }
        
    elif db_job.job_type in [JobType.WORKOVER, JobType.WELLSERVICE]:
        
        wrm_data = {
            'wrm_internal_kkks': {
                'label': 'Internal KKKS',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_internal_kkks', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_internal_kkks', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_internal_kkks', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_internal_kkks', None), 'end_date', None)
            },
            'wrm_persiapan_lokasi': {
                'label': 'Persiapan Lokasi',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_persiapan_lokasi', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_persiapan_lokasi', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_persiapan_lokasi', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_persiapan_lokasi', None), 'end_date', None)
            },
            'wrm_pengadaan_lli': {
                'label': 'Pengadaan LLI',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_lli', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_lli', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_lli', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_lli', None), 'end_date', None)
            },
            'wrm_pengadaan_equipment': {
                'label': 'Pengadaan Equipment',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_equipment', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_equipment', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_equipment', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_equipment', None), 'end_date', None)
            },
            'wrm_pengadaan_services': {
                'label': 'Pengadaan Services',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_services', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_services', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_services', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_services', None), 'end_date', None)
            },
            'wrm_pengadaan_handak': {
                'label': 'Pengadaan Handak',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_handak', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_handak', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_handak', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_handak', None), 'end_date', None)
            },
            'wrm_pengadaan_octg': {
                'label': 'Pengadaan OCTG',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_octg', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_octg', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_octg', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_octg', None), 'end_date', None)
            },
            'wrm_pengadaan_artificial_lift': {
                'label': 'Pengadaan Artificial Lift',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_artificial_lift', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_pengadaan_artificial_lift', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_artificial_lift', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_pengadaan_artificial_lift', None), 'end_date', None)
            },
            'wrm_sumur_berproduksi': {
                'label': 'Sumur Berproduksi',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_sumur_berproduksi', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_sumur_berproduksi', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_sumur_berproduksi', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_sumur_berproduksi', None), 'end_date', None)
            },
            'wrm_fasilitas_produksi': {
                'label': 'Fasilitas Produksi',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_fasilitas_produksi', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_fasilitas_produksi', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_fasilitas_produksi', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_fasilitas_produksi', None), 'end_date', None)
            },
            'wrm_persiapan_lokasi': {
                'label': 'Persiapan Lokasi',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_persiapan_lokasi', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_persiapan_lokasi', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_persiapan_lokasi', None), 'start_date', None),
                'actual_end_date': getattr(getattr(actual_wbs, 'wrm_persiapan_lokasi', None), 'end_date', None)
            },
            'wrm_well_integrity': {
                'label': 'Well Integrity',
                'plan_start_date': getattr(getattr(plan_wbs, 'wrm_well_integrity', None), 'start_date', None),
                'plan_end_date': getattr(getattr(plan_wbs, 'wrm_well_integrity', None), 'end_date', None),
                'actual_start_date': getattr(getattr(actual_wbs, 'wrm_well_integrity', None), 'start_date', None),
            },
        }
    
    last_index = 1
    
    all_data = []
    plans = []
    actuals = []
    
    for wrm in wrm_data.values():
        if wrm:
        
            all_data.append({
                'name': wrm['label'],
                'start': wrm.get('plan_start_date', None),
                'finish': wrm.get('plan_end_date', None),
                'resource': None,
                'predecessor': None,
                'milestone': None,
                'parent': ''
            })
            
            plans.append({
                'name': 'Plan',
                'start': wrm.get('plan_start_date', None),
                'finish': wrm.get('plan_end_date', None),
                'resource': None,
                'predecessor': None,
                'milestone': None,
                'parent': last_index
            })
            
            actuals.append({
                'name': 'Actual',
                'start': wrm.get('actual_start_date', None),
                'finish': wrm.get('actual_end_date', None),
                'resource': None,
                'predecessor': None,
                'milestone': None,
                'parent': last_index,
                'color':'red'
            })
            
            last_index += 1

    for i, event in enumerate(plan_wbs.events):
        
        parent = {
            'name': getattr(event, 'event'),
            'start': getattr(event, 'start_date'),
            'finish': getattr(event, 'end_date'),
            'resource': None,
            'predecessor': None,
            'milestone': None,
            'parent': ''
        }
        
        all_data.append(parent)
        
        plan = {
            'name': 'Plan',
            'start': getattr(event, 'start_date'),
            'finish': getattr(event, 'end_date'),
            'resource': None,
            'predecessor': None,
            'milestone': None,
            'parent': last_index + i
        }
        
        actual = {
            'name': 'Actual',
            'start': actual_wbs_event_dict.get(event.event, {}).get('start_date', None),
            'finish': actual_wbs_event_dict.get(event.event, {}).get('end_date', None),
            'resource': None,
            'predecessor': None,
            'milestone': None,
            'parent': last_index + i,
            'color':'red'
        }
        
        plans.append(plan)
        actuals.append(actual)
    
    if wbs_type == 'actual':
        
        all_data = all_data + plans + actuals
        
    elif wbs_type == 'plan':
        
        all_data = all_data + plans
    
    return all_data

def visualize_work_breakdown_structure(db: Session, job_id: UUID, wbs_type: Literal['plan', 'actual']):
    
    db_job = db.query(Job).filter(Job.id == job_id).first()
    
    all_data = serialize_work_breakdown_structure(db_job, wbs_type)

    data = gantt.Data()
    index = 1
    for d in all_data:
        
        if d['start'] and d['finish']:
            data.add(index,d['name'],d['start'].strftime('%Y-%m-%d'),d['finish'].strftime('%Y-%m-%d'),d['resource'],d['predecessor'],d['milestone'],d['parent'], d.get('color', '#67AAFF'))
        else:
            data.add(index,d['name'],d['start'],d['finish'],d['resource'],d['predecessor'],d['milestone'],d['parent'], d.get('color', '#67AAFF'))
        index += 1
    # print(data.data)
    
    temp = gantt.Gantt()
    temp.load(data.data)
    temp.ganttChart('Work Breakdown Structure')
    svg_string = temp.to_string()

    return svg_string

def visualize_time_depth_curve(db: Session, job_id: UUID, tdc_type: Literal['plan', 'actual']):
    
    query = db.query(
        Job
    ).filter(Job.id == job_id)
    
    db_job = query.first()
    
    job_operation_days: list[JobOperationDay] = db_job.job_plan.job_operation_days
    job_operation_days = sorted(
        db_job.job_plan.job_operation_days,
        key=lambda x: (x.depth_in, x.depth_out)
    )
    
    plan_events = [row.phase for row in job_operation_days]
    plan_days = [row.operation_days for row in job_operation_days]
    plan_start_depths = [row.depth_in for row in job_operation_days]
    plan_end_depths = [row.depth_out for row in job_operation_days]
    plan_costs = [(db_job.job_plan.total_budget / len(job_operation_days)) for _ in job_operation_days]
    
    plan_cumulative_days_start = np.cumsum([0] + plan_days[:-1])
    plan_cumulative_days_end = np.cumsum(plan_days)
    
    cost_plan = db_job.job_plan.total_budget
    
    plan_cumulative_days_start = np.cumsum([0] + plan_days[:-1])
    plan_cumulative_days_end = np.cumsum(plan_days)
    
    plan_costs = [(cost_plan / len(plan_events)) for _ in plan_events]

    fig = make_subplots(
    # rows=2, cols=1,
    # shared_xaxes=True,
    # vertical_spacing=0.12,
    specs=[[{"secondary_y": True}],
            #  [{"type": "table"}]
            ]
    )

    for i in range(len(plan_events)):

        o = 'left'

        days = [plan_cumulative_days_start[i], plan_cumulative_days_end[i]]
        depths = [plan_start_depths[i], plan_end_depths[i]]
        fig.add_trace(
            go.Scatter(
                x=days,
                y=depths,
                line=dict(width=2),
                name='Planned Operation',
                showlegend=False if i!= len(plan_events)-1 else True,
                marker_color = colors[0]
                ),
            # row=1, col=1
            )

        center_days = ((days[1]-days[0])/2)+days[0]
        center_depths = ((depths[1]-depths[0])/2)+depths[0]

        fig.add_annotation(
            x=center_days,
            y=center_depths,
            xshift=2,
            text=i+1,
            showarrow=True,
            ax=-30,
            ay=25,
            font=dict(
                family="Arial",
                size=16,
                color='black'
            ),
            align="center",
            arrowhead=2,
            arrowsize=1,
            arrowwidth=2,
            arrowcolor="#636363",
            bordercolor="#c7c7c7",
            borderwidth=2,
            borderpad=4,
            opacity=0.8
            )

    if tdc_type == 'actual':
        
        job_operation_days: list[JobOperationDay] = db_job.actual_job.job_operation_days
        
        job_operation_days = sorted(
            db_job.job_plan.job_operation_days,
            key=lambda x: (x.depth_in, x.depth_out)
        )
        
        actual_events = [row.phase for row in job_operation_days]
        actual_days = [row.operation_days for row in job_operation_days]
        actual_start_depths = [row.depth_in for row in job_operation_days]
        actual_end_depths = [row.depth_out for row in job_operation_days]
        actual_costs = [(db_job.job_plan.total_budget / len(job_operation_days)) for _ in job_operation_days]
        
        actual_cumulative_days_start = np.cumsum([0] + actual_days[:-1])
        actual_cumulative_days_end = np.cumsum(actual_days)
        
        
        for i in range(len(actual_events)):

            o = 'right'

            days = [actual_cumulative_days_start[i], actual_cumulative_days_end[i]]
            depths = [actual_start_depths[i], actual_end_depths[i]]
            fig.add_trace(
                go.Scatter(
                    x=days,
                    y=depths,
                    line=dict(width=2),
                    name='Actual Operation',
                    showlegend=False if i!= len(actual_events)-1 else True,
                    marker_color = colors[1]
                    ),
                # row=1, col=1
                )

            center_days = ((days[1]-days[0])/2)+days[0]
            center_depths = ((depths[1]-depths[0])/2)+depths[0]

            fig.add_annotation(
                x=center_days,
                y=center_depths,
                xshift=2,
                text=i+1,
                showarrow=True,
                ax=25,
                ay=-30,
                font=dict(
                    family="Arial",
                    size=16,
                    color='black'
                ),
                align="center",
                arrowhead=2,
                arrowsize=1,
                arrowwidth=2,
                arrowcolor="#636363",
                bordercolor="#c7c7c7",
                borderwidth=2,
                borderpad=4,
                opacity=0.8
                )
    
    fig.add_trace(
        go.Scatter(
            x=plan_cumulative_days_end,
            y=np.cumsum(plan_costs),
            line=dict(width=2, dash='dash'),
            name='Planned Cost',
            marker_color=colors[5],
            xaxis='x1',
            yaxis='y2',
            ),
        secondary_y=True,
        # row=1, col=1
        )

    if tdc_type == 'actual':
        
        actual_cumulative_days_start = np.cumsum([0] + actual_days[:-1])
        actual_cumulative_days_end = np.cumsum(actual_days)
    
        fig.add_trace(
            go.Scatter(
                x=actual_cumulative_days_end,
                y=np.cumsum(actual_costs),
                line=dict(width=2, dash='dash'),
                name='Actual Cost',
                marker_color=colors[6],
                xaxis='x1',
                yaxis='y2',
                ),
            secondary_y=True,
            # row=1, col=1
            )

        # fig.add_trace(
        #     go.Table(
        #         header=dict(
        #             values=['Event','Days','Start Depth','End Depth','Cost'],
        #             line_color='darkslategray',
        #             fill_color='royalblue',
        #             align=['left','center'],
        #             font=dict(color='white', size=12),
        #             height=40
        #         ),
        #         cells=dict(
        #             values=[plan_events,
        #                     plan_days,
        #                     plan_start_depths,
        #                     plan_end_depths,
        #                     plan_costs],
        #             line_color='darkslategray',
        # fill=dict(color=['paleturquoise', 'white']),
        # align=['left', 'center'],
        # font_size=12,
        # height=30)
        #     ),
        #     row=2, col=1
        # )

    fig.update_yaxes(autorange="reversed", secondary_y=False)
    fig.update_layout(template='plotly_white')
    fig.update_layout(
        height=600,
    )
    fig.update_layout(
        xaxis=dict(
            showline=True,
            showgrid=False,
            showticklabels=True,
            linecolor='rgb(204, 204, 204)',
            linewidth=2,
            ticks='outside',
            tickfont=dict(
                family='Arial',
                size=12,
                color='rgb(82, 82, 82)',
            ),
        ),
        yaxis=dict(
            autorange='reversed',
            showline=True,
            showgrid=False,
            showticklabels=True,
            linecolor='rgb(204, 204, 204)',
            linewidth=2,
            ticks='outside',
            tickfont=dict(
                family='Arial',
                size=12,
                color='rgb(82, 82, 82)',
            ),
        ),
        xaxis_title="Days",
        yaxis_title="Depth",
        margin=dict(
            l=0,
            r=0,
            t=50,
            b=0
        ),
        plot_bgcolor='white',
    )
    
    fig_json = fig.to_json(pretty=True, engine="json")
    fig_data = json.loads(fig_json)

    return fig_data

def visualize_trajectory(db: Session, job_id: UUID, trajectory_type: Literal['plan', 'actual']):
    
    query = db.query(
        Job
    ).filter(Job.id == job_id)
    
    db_job = query.first()

    if trajectory_type == 'plan':
        well_profile = load(db_job.job_plan.well.well_trajectory.file.file_location)
        fig_data = render_well_profile(well_profile)
    else:
        well_profile_plan = load(db_job.job_plan.well.well_trajectory.file.file_location)
        well_profile_actual = load(db_job.actual_job.well.well_trajectory.file.file_location)
        fig_data = render_well_comparison([well_profile_plan, well_profile_actual], ['Plan', 'Actual'])

    return fig_data

def visualize_well_casing(db: Session, job_id: UUID, background_tasks: BackgroundTasks, casing_type: Literal['plan', 'actual']):
    wsh = schematics.WellSchema(
        open_holes=[
            models.OpenHole(
                name = '',
                top = 0,
                bottom= 0,
                diameter = 0
            )
        ]
    )
    
    if casing_type == 'plan':
        casings = db.query(Job).filter(Job.id == job_id).first().job_plan.well.well_casings
    else:
        casings = db.query(Job).filter(Job.id == job_id).first().actual_job.well.well_casings
    
    names = [casing.remark for casing in casings]
    top_depths = [casing.top_depth for casing in casings]
    bottom_depths = [casing.base_depth for casing in casings]
    diameters = [casing.outside_diameter for casing in casings]
    
    wsh.casings = [
        models.Casing(
            name=names[i],
            top=top_depths[i],
            bottom=bottom_depths[i],
            diameter = diameters[i]
        ) for i in range(len(names)) 
    ] 
    
    wsh.plot()
    fig = plt.gcf()
    buf = BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)
    
    background_tasks.add_task(buf.close)
    headers = {'Content-Disposition': 'inline; filename="casing.png"'}

    return Response(buf.getvalue(), headers=headers, media_type='image/png')

def generate_seismic_section(db: Session, job_id: UUID, background_tasks: BackgroundTasks, seismic_type: Literal['plan', 'actual']):
    
    query = db.query(
        Job
    ).filter(Job.id == job_id)
    
    db_job = query.first()
    
    if seismic_type == 'plan':
        well = db_job.job_plan.well
    else:
        well = db_job.actual_job.well
    
    if well.seismic_line:
            
        if well.seismic_line.file.file_extension in ['.sgy', '.segy']:
            
            # Path to your SEG-Y file
            file_path = well.seismic_line.file.file_location

            # Set a constant average velocity (in meters/second)
            average_velocity = well.seismic_line.average_velocity

            # Open the SEG-Y file and read trace data along with shot points
            with segyio.open(file_path, "r", ignore_geometry=True) as segyfile:
                # Extract trace data as a 2D array
                trace_data = np.stack([segyfile.trace[i] for i in range(segyfile.tracecount)], axis=0)

                # Retrieve shot points for each trace
                shot_points = [segyfile.header[i][segyio.TraceField.EnergySourcePoint] for i in range(segyfile.tracecount)]

                # Get sample rate (in microseconds) and convert to milliseconds
                sample_rate = segyfile.bin[segyio.BinField.Interval] / 1000.0  # Convert to milliseconds
                time_samples = segyfile.samples  # Time (or depth) sample values

            # Convert time samples (ms) to depth (m) using the average velocity (in meters/second)
            time_samples_sec = time_samples / 1000.0  # Convert milliseconds to seconds
            depth_samples = (average_velocity * time_samples_sec) / 2  # Depth = Velocity * Time / 2

            # Plotting the 2D SEG-Y data with shot points as x-axis and depth as y-axis
            fig = plt.figure(figsize=(12, 8))
            plt.imshow(trace_data.T, cmap='seismic', aspect='auto',
                    extent=[shot_points[0], shot_points[-1], depth_samples[-1], depth_samples[0]])

            # Set up plot labels and colorbar
            plt.colorbar(label='Amplitude')
            plt.xlabel("Shot Point")
            plt.ylabel("Depth (m)")
            plt.title("2D SEG-Y Data Section with Shot Points and Depth")
            
            buf = BytesIO()
            fig.savefig(buf, format="png")
            plt.close(fig)
            
            background_tasks.add_task(buf.close)
            headers = {'Content-Disposition': 'inline; filename="seismic.png"'}

            return Response(buf.getvalue(), headers=headers, media_type='image/png')

        elif well.seismic_line.file.file_extension in ['.jpg', '.jpeg', '.png', '.pdf']:
        
            return FileResponse(well.seismic_line.file.file_location)

def generate_schematic(db: Session, job_id: UUID, background_tasks: BackgroundTasks, seismic_type: Literal['plan', 'actual']):
    
    query = db.query(
        Job
    ).filter(Job.id == job_id)
    
    db_job = query.first()
    
    if seismic_type == 'plan':
        well = db_job.job_plan.well
    else:
        well = db_job.actual_job.well
    
    if well.well_schematic:

        if well.well_schematic.file.file_extension in ['.jpg', '.jpeg', '.png', '.pdf']:
        
            return FileResponse(well.well_schematic.file.file_location)
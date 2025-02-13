from turtle import update
from fastapi.exceptions import HTTPException
from numpy import var
from sqlalchemy.orm import Session
from sqlalchemy import exists
from datetime import datetime, time

from app.api.job.models import *
from app.api.spatial.models import Area, Field
from app.api.well.models import ActualWell
from app.core.schema_operations import parse_schema
from app.api.job.utils import *
import pandas as pd
from typing import Union,Dict
from pydantic import ValidationError
import io
from uuid import uuid4
from app.core.error_handlers import AreaDoesntExist, FieldDoesntExist, WellDoesntExist
from app.core.schema_operations import build_nested_model
import utm
from fastapi import Response, UploadFile
import xmltodict
from app.api.utils.utils import change_files_status_to_used, delete_files
from jinja2 import Template
from sqlalchemy import func
from app.core.database_functions import update_object
import uuid


def create_job_plan(db: Session, job_type: JobType, plan: object, user):
    db_job = Job(**parse_schema(plan, variables={'uwi': str(uuid.uuid4()), 'unit_type': plan.job_plan.well.unit_type}))
    db.recursive_add(db_job)
    db_job.kkks_id = user.kkks_id
    db_job.job_type = job_type
    db_job.date_proposed = datetime.now().date()
    db_job.planning_status = PlanningStatus.PROPOSED
    db_job.created_by_id = user.id
    db_job.time_created = datetime.now()
    if isinstance(plan, (CreateExplorationJob, CreateDevelopmentJob)):
        db_job.job_plan.well.area_id = plan.area_id
        db_job.job_plan.well.field_id = plan.field_id
        db_job.job_plan.well.kkks_id = user.kkks_id
    change_files_status_to_used(plan, db)
    db.commit()
    return db_job.id

def get_job_plan(id: UUID, db: Session) -> dict:
    job_plan = db.query(Job).get(id)
    job_schema = job_schema_map[job_plan.job_type]['get-job-plan']
    return job_schema.model_validate(job_plan, from_attributes=True).model_dump()

def upload_batch(db: Session, content: bytes, job_type: JobType, user):

    error_list = []
    validated_data = []
    
    dtype_map = {
        **job_schema_map[job_type]['upload_headers']['plan'],
        **job_schema_map[job_type]['upload_headers']['wrm']
    }

    try:
        df = pd.read_excel(io.BytesIO(content), header=None, skiprows=1)
        df = df.iloc[2:].set_axis((df.iloc[:2].ffill(axis=1).apply(lambda x: ':'.join(x.dropna().str.replace(' ', ':')))), axis=1).reset_index(drop=True)
        
        # Check if all required columns are present
        required_columns = set(dtype_map.keys())
        missing_columns = required_columns - set(df.columns)
        
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        for col, converter in dtype_map.items():
            df[col] = df[col].apply(converter)
        
        df = df.replace({'nan': None, 'None': None})
        
        # Rename the columns based on the provided dictionary
        # df.rename(columns=plan_label_key_mapping, inplace=True)
        
        wrm_df = df.drop(columns=list(job_schema_map[job_type]['upload_headers']['plan'].keys()))
        df = df[list(job_schema_map[job_type]['upload_headers']['plan'].keys())]
        df.columns = df.columns.str.lower()
        wrm_df.columns = wrm_df.columns.str.lower()
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    area_names = db.query(Area.name).all()

    for index, row in df.iterrows():
        
        try:
            
            if row['area_name'] not in [area.name for area in area_names]:
                raise AreaDoesntExist
            
            row['area_id'] = db.query(Area).filter(Area.name == row['area_name']).first().id
            
            field_names = db.query(Field.name).filter(Field.area_id == row['area_id']).all()

            if row['field_name'] not in [field.name for field in field_names]:
                raise FieldDoesntExist
            
            if job_type in [JobType.WORKOVER,JobType.WELLSERVICE]:
                if row.get('well_name',None):
                    well = db.query(ExistingWell).filter(ExistingWell.well_name == row['well_name']).first()
                    if well is None:
                        row['well_id'] = 'not found'
                        raise WellDoesntExist
                    else:
                        row['well_id'] = well.id
                        
            row['field_id'] = db.query(Field).filter(Field.area_id == row['area_id'], Field.name == row['field_name']).first().id
            
        except AreaDoesntExist:
            error_list.append(f'Row {index + 2} in Area: Area does not exist in the database')
            
        except FieldDoesntExist:
            error_list.append(f'Row {index + 2} in Field: Field does not exist in the database')
            
        except WellDoesntExist:
            error_list.append(f'Row {index + 2} in Well: Well does not exist in the database')
        
        try:
            
            job_schema = job_schema_map[job_type]['job']
            job_plan_schema = job_schema_map[job_type]['schema']['plan']
            
            wbs_dict = {}
            wrm_dict = {}
                    
            #wrm
            for key, value in wrm_df.loc[index].to_dict().items():
                wrm, date = key.split(':')
                if wbs_dict.get(wrm, None) is None:
                    wbs_dict[wrm] = {}
                wbs_dict[wrm][date] = value
            
            for key, value in wbs_dict.items():
                if value.get('start_date', None) is None or value.get('end_date', None) is None:
                    wrm_dict[key] = False
                else:
                    wrm_dict[key] = True
            
            _row_dict = row.to_dict()
            row_dict = {**_row_dict,"work_breakdown_structure": wbs_dict, **wrm_dict}

            data_dict = {
                "area_id": row.get('area_id','not found'),
                "field_id": row.get('field_id','not found'),
                "contract_type": row['contract_type'],
                "afe_number": row['afe_number'],
                "wpb_year": row['wpb_year'],                
                "job_plan": {
                    **build_nested_model(job_plan_schema,  row_dict),
                }
            }

            plan = job_schema(**data_dict)
            
            db_job = Job(**parse_schema(plan))
            db_job.kkks_id = user.kkks_id
            db_job.job_type = job_type
            db_job.date_proposed = datetime.now().date()
            db_job.planning_status = PlanningStatus.PROPOSED
            db_job.created_by_id = user.id
            db_job.time_created = datetime.now()
            
            if isinstance(plan, (CreateExplorationJob, CreateDevelopmentJob)):
                db_job.job_plan.well.area_id = plan.area_id
                db_job.job_plan.well.field_id = plan.field_id
                db_job.job_plan.well.kkks_id = user.kkks_id
            
            validated_data.append(db_job)
            
        except ValidationError as e:
            
            for error in e.errors():
                
                if "_ID" not in {error["loc"][-1].upper()}:
                
                    error_list.append(f'Row {index + 2} in {error["loc"][-1].upper()}: {error["msg"]}. Your input was {error['input']}')
            
    if error_list:
        raise HTTPException(status_code=400, detail={"errors": error_list})
    
    db.add_all(validated_data)
    db.commit()

def update_job_plan(db: Session, job_id: UUID, plan: object, user):
    db_job = db.query(Job).filter_by(id=job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job plan not found")
    if db_job.planning_status == PlanningStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Job is already approved")

    db_job_new = Job(**parse_schema(plan, variables={'uwi': str(db_job.job_plan.well.id), 'unit_type': plan.job_plan.well.unit_type}))
    db_job_new.id = job_id
    db_job_new.kkks_id = db_job.kkks_id
    db_job_new.job_type = db_job.job_type
    db_job_new.date_proposed = db_job.date_proposed
    db_job_new.planning_status = PlanningStatus.PROPOSED
    db_job_new.created_by_id = db_job.created_by_id
    db_job_new.time_created = db_job.time_created
    db_job_new.last_edited_by_id = user.id
    db_job_new.last_edited = datetime.now().date()
    
    update_object(db_job.job_plan.well, db_job_new.job_plan.well)
    update_object(db_job.job_plan, db_job_new.job_plan, exclude_fields=['well'])
    update_object(db_job, db_job_new, exclude_fields=['job_plan'])
    
    change_files_status_to_used(plan, db)
    db.commit()

def delete_job_plan(id: UUID, db: Session, user):
    db_job = db.query(Job).filter_by(id=id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job plan not found")
    if db_job.planning_status == PlanningStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Job is already approved")
    job_schema = job_schema_map[db_job.job_type]['job']
    delete_files(job_schema.model_validate(db_job), db)
    db.delete(db_job)
    db.commit()

def approve_job_plan(id: UUID, db: Session, user):
    db_job = db.query(Job).filter_by(id=id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job plan not found")
    db_job.planning_status = PlanningStatus.APPROVED
    db_job.date_approved = datetime.now().date()
    db_job.approved_by_id = user.id

    actual_schema = job_schema_map[db_job.job_type]['schema']['actual']
    plan_schema = job_schema_map[db_job.job_type]['schema']['plan']
    
    if db_job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
        
        job_plan_schema = plan_schema.model_validate(db_job.job_plan, from_attributes=True)
        
        job_plan_dict = {
            **job_plan_schema.model_dump(
                include={
                    'total_budget':True,
                    'rig_id':True,
                    'job_operation_days':True,
                    'job_project_management_team':True,
                    'job_equipments':True,
                    'job_hse_aspect':True,
                    'job_hazards':True,
                    'well' : {
                        "unit_type",
                        "well_name",
                        "well_num",
                        "well_level_type",
                        "well_class",
                        "well_profile_type",
                        "environment_type",
                        "surface_longitude",
                        "surface_latitude",
                        "bottom_hole_longitude",
                        "bottom_hole_latitude",
                        "spud_date",
                        "final_drill_date",
                        "completion_date",
                        "abandonment_date",
                        "rig_on_site_date",
                        "rig_release_date",
                        "maximum_inclination",
                        "azimuth",
                        "hydrocarbon_target",
                        "kick_off_point",
                        "difference_lat_msl",
                        "subsea_elev_ref_type",
                        "elev_ref_datum",
                        "rotary_table_elev",
                        "kb_elev",
                        "derrick_floor_elev",
                        "ground_elev",
                        "ground_elev_type",
                        "base_depth",
                        "water_depth",
                        "water_depth_datum",
                        "deepest_depth",
                        "depth_datum",
                        "depth_datum_elev",
                        "drill_td",
                        "top_depth",
                        "maximum_tvd",
                        "final_md",
                        "plugback_depth",
                        "whipstock_depth",
                        "water_acoustic_vel",
                        "net_pay",
                        "parent_well_id",
                    },
                    'work_breakdown_structure':True
                }
            )
        }
        
        job_plan_dict['well']['area_id'] = db_job.area_id
        job_plan_dict['well']['area_type'] = db_job.area_type
        job_plan_dict['well']['field_id'] = db_job.field_id
        job_plan_dict['well']['kkks_id'] = db_job.kkks_id
        
        actual_job_temporary_schema = actual_schema(**job_plan_dict)
        
    else:
        actual_job_temporary_schema = actual_schema(**plan_schema.model_validate(db_job.job_plan, from_attributes=True).model_dump(
            exclude={
                'job_hazards':True,
                'job_documents':True,
                'work_breakdown_structure':True,
            }
        ))

    actual_job_id = str(uuid4())
    
    db_job.actual_job = job_schema_map[db_job.job_type]['model']['actual'](**parse_schema(actual_job_temporary_schema), id=actual_job_id)
    
    db.commit()
    return {"message": "Job plan approved successfully"}

def return_job_plan(id: UUID, remarks: str, db: Session, user):
    db_job = db.query(Job).filter_by(id=id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job plan not found")
    db_job.planning_status = PlanningStatus.RETURNED
    db_job.date_returned = datetime.now().date()
    db_job.returned_by_id = user.id
    db_job.remarks = remarks
    db.commit()
    return {"message": "Job plan returned successfully"}

def operate_job(id: UUID, db: Session, surat_tajak: SuratTajakSchema):
    db_job = db.query(Job).filter_by(id=id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_job.operation_status = OperationStatus.OPERATING
    db_job.date_started = datetime.now().date()

    db_job.actual_job.start_date = surat_tajak.tanggal_mulai
    db_surat_tajak_document = JobDocument(
        job_instance_id =  db_job.actual_job.id,
        file_id=surat_tajak.file_id,
        document_type=JobDocumentType.SURAT_TAJAK
    )
    
    db.add(db_surat_tajak_document)
    db.commit()

def view_job_plan(id: UUID, db: Session) -> dict:
    db_job = db.query(Job).get(id)

    if not db_job:
        raise HTTPException(status_code=404, detail="Job plan not found")

    db_plan = db_job.job_plan
    db_well = db_plan.well
    
    well_key_data = {
        "Nama Well": db_well.well_name,
        "Nomor Well": db_well.well_num,
        "Tipe Level Well": db_well.well_level_type,
        "Klasifikasi Well": db_well.well_class,
        "Tipe Profil Well": db_well.well_profile_type,
        "Tipe Lingkungan": db_well.environment_type,
        "Fase Well": db_well.well_phase,
        "Longitude Permukaan": db_well.surface_longitude,
        "Latitude Permukaan": db_well.surface_latitude,
        "Longitude Bottom Hole": db_well.bottom_hole_longitude,
        "Latitude Bottom Hole": db_well.bottom_hole_latitude,
        "Tanggal Tajak": db_well.spud_date,
        "Tanggal Selesai Drilling": db_well.final_drill_date,
        "Tanggal Komplesi": db_well.completion_date,
        "Tanggal Abandonment": db_well.abandonment_date,
        "Tanggal Rig On Site": db_well.rig_on_site_date,
        "Tanggal Rig Release": db_well.rig_release_date,
        "Elevasi Rotary Table": f'{db_well.rotary_table_elev} {db_well.rotary_table_elev_uom}',
        "Elevasi Kelly Bushing": f'{db_well.kb_elev} {db_well.kb_elev_uom}',
        "Elevasi Derrick Floor": f'{db_well.derrick_floor_elev} {db_well.derrick_floor_elev_uom}',
        "Elevasi Ground": f'{db_well.ground_elev} {db_well.ground_elev_uom} ({db_well.ground_elev_type})',
        "Mean Sea Level Difference": f'{db_well.difference_lat_msl} {db_well.elev_ref_datum}',
        "Maximum TVD": f'{db_well.maximum_tvd} {db_well.maximum_tvd_uom} from {db_well.depth_datum}',
        "Final MD": f'{db_well.final_md} {db_well.final_md_uom} from {db_well.depth_datum}',
        "Water Depth": f'{db_well.water_depth} {db_well.water_depth_uom} relative to {db_well.water_depth_datum}',
        "Top Depth": f'{db_well.top_depth} {db_well.top_depth_uom}',
        "Deepest Depth": f'{db_well.deepest_depth} {db_well.deepest_depth_uom}',
        "Plugback Depth": f'{db_well.plugback_depth} {db_well.plugback_depth_uom}',
        "Whipstock Depth": f'{db_well.whipstock_depth} {db_well.whipstock_depth_uom}',
        "Kick Off Point": f'{db_well.drill_td} {db_well.drill_td_uom}',
        "Water Acoustic Velocity": f'{db_well.water_acoustic_vel} {db_well.water_acoustic_vel_uom}',
        "Net Pay": f'{db_well.net_pay} {db_well.net_pay_uom}',
    }
    
    rig_data = {
        "Nama Rig": db_plan.rig_name,
        "Tipe Rig": db_plan.rig_type,
        "Rig HP": db_plan.rig_horse_power
    } if db_plan.rig else {}
    
    if db_job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:

        additional_operational_data = rig_data

        technical_data = well_key_data
        
    else:
        
        additional_operational_data = {
            **rig_data,
            "Peralatan": db_plan.equipment,
            "Spesifikasi Peralatan": db_plan.equipment_specifications,
        }
        
        technical_data = {
            "Production Plan": {
                'Onstream Oil': db_plan.onstream_oil,
                'Onstream Gas': db_plan.onstream_gas,
                'Onstream Water Cut': db_plan.onstream_water_cut,
                'Target Oil': db_plan.target_oil,
                'Target Gas': db_plan.target_gas,
                'Target Water Cut': db_plan.target_water_cut,
            },
            "Well Information": well_key_data
        }

    view_plan = {
        'header':{
            "well_name": db_well.well_name,
            "job_type": db_job.job_type.value,
            "planning_status": db_job.planning_status.value,
        },
        'job_summary':{
            "project":{
                "Tipe Pekerjaan": db_job.job_type.value,
                "KKKS": db_job.kkks.name,
                "Wilayah Kerja": db_job.area.name,
                "Field": db_job.field.name,
                "Jenis Kontrak": db_job.contract_type.value,
                "Nomor AFE": db_job.afe_number,
                "Tahun WP&B": db_job.wpb_year,
                'Tanggal Diajukan': db_job.date_proposed,
                "Tanggal Mulai": db_plan.start_date,
                "Tanggal Selesai": db_plan.end_date,
                "Total Budget": db_plan.total_budget,
                **additional_operational_data,
                "Planning Status": db_job.planning_status.value,
            },
            "technical": technical_data,
            "project_available_data": db_plan.available_data,
            **({"well_available_data": db_well.available_data} if db_job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT] else {}),
        },
        "location": f'/spatial/get/well-info/{db_job.job_plan.well.id}',
    }

    view_plan['job_operation_days'] = create_plan_time_depth_curve(
        db_job
    )

    view_plan['work_breakdown_structure'] = create_plan_gantt_chart(
        db_job
    )
    
    plan_project_management_team = db_job.job_plan.job_project_management_team
    
    view_plan['project_management_team'] = [
        JobProjectManagementTeamBase.model_validate(team).model_dump(by_alias=True) for team in plan_project_management_team
    ] if plan_project_management_team else None

    hse_aspect = db_job.job_plan.job_hse_aspect

    view_plan['job_hse'] = {
        'potential_hazard' : create_job_hazard_table(
            db_job.job_plan
        ),
        'hse_aspects' : JobHSEAspectBase.model_validate(hse_aspect).model_dump(by_alias=True)
    } if hse_aspect else None
    
    equipments = db_job.job_plan.job_equipments
    
    view_plan['job_equipment'] = [
        JobEquipmentBase.model_validate(equipment).model_dump(by_alias=True) for equipment in equipments
    ] if equipments else None
    
    view_plan['job_documents'] = create_job_documents_table(
        db_job.job_plan
    )

    if db_job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
            
        view_plan['well_casings'] = create_plan_casing(
            db_job
        )
        
        view_plan['well_schematic'] = create_plan_schematic(
            db_job
        )

        view_plan['well_trajectory'] = create_plan_trajectory(
            db_job
        )
        
        view_plan['well_ppfg'] = create_plan_ppfg(
            db_job
        )
    
        view_plan['well_log'] = create_logs(
            db_job.job_plan.well
        )
        
        view_plan['well_drilling_parameter_plan'] = create_data_table(
            db_job.job_plan.well.well_drilling_parameter_plan
        )
        
        view_plan['seismic_section'] = create_plan_seismic_section(
            db_job
        )
        
        view_plan['well_equipments'] = [WellEquipmentBase.model_validate(well_equipment) for well_equipment in db_job.job_plan.well.well_equipments] if db_job.job_plan.well.well_equipments else None
        
        view_plan['well_pressure'] = [WellPressureBase.model_validate(well_pressure) for well_pressure in db_job.job_plan.well.well_pressure] if db_job.job_plan.well.well_pressure else None
        
        view_plan['well_completion'] = [WellCompletionBase.model_validate(well_completion) for well_completion in db_job.job_plan.well.well_completion] if db_job.job_plan.well.well_completion else None
        
        view_plan['well_stratigraphy'] = create_well_stratigraphy_table(
            db_job.job_plan.well
        )
        
        if db_job.job_type == JobType.EXPLORATION:
            
            view_plan['well_tests'] = [WellTestBase.model_validate(well_test) for well_test in db_job.job_plan.well.well_tests] if db_job.job_plan.well.well_tests else None
            
            view_plan['well_cores'] = create_well_cores_table(db_job.job_plan.well)
    
    else:
        
        view_plan['well_schematic'] = create_wows_plan_schematic(
            db_job
        )

    return view_plan

def time_to_string(t: time) -> str:
    return t.strftime('%H:%M:%S')

def string_to_time(s: str) -> time:
    return datetime.strptime(s, '%H:%M:%S').time()

def save_daily_operations_report(db: Session, job_id: UUID, report: DailyOperationsReportCreate):
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    existing_dor = db.query(DailyOperationsReport).filter(DailyOperationsReport.job_id == job_id, DailyOperationsReport.report_date == report.report_date).first()
    if existing_dor:
        db_report = DailyOperationsReport(
            **parse_schema(report), job_id = job_id
        )

        db.delete(existing_dor)
        job.daily_operations_report.append(db_report)
        db.commit()
        db.refresh(db_report)

        return parse_schema(report)
    
    db_report = DailyOperationsReport(
        **parse_schema(report), job_id = job_id
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report.__dict__

#job issues
def get_job_issues(db: Session, job_id: UUID) -> List[JobIssueResponse]:
    return [JobIssueResponse.model_validate(issue).model_dump() for issue in db.query(JobIssue).filter(JobIssue.job_id == job_id).all()]

def view_job_issues(db: Session, job_id: UUID) -> List[JobIssueResponse]:
    return [JobIssueResponse.model_validate(issue).model_dump(by_alias=True) for issue in db.query(JobIssue).filter(JobIssue.job_id == job_id).all()]

def create_job_issue(db: Session, job_id: UUID, job_issue: JobIssueCreate) -> JobIssue:
    db_job_issue = JobIssue(
        **parse_schema(job_issue), job_id = job_id
    )
    db.add(db_job_issue)
    db.commit()

def edit_job_issue(db: Session, job_issue_id: UUID, job_issue_update: JobIssueEdit) -> Optional[JobIssue]:
    db_job_issue = db.query(JobIssue).filter(JobIssue.id == job_issue_id).first()
    if db_job_issue is None:
        return None
    
    update_data = job_issue_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job_issue, key, value)
    
    db.add(db_job_issue)
    db.commit()

def delete_job_issue(db: Session, job_issue_id: UUID) -> Optional[JobIssue]:
    db_job_issue = db.query(JobIssue).filter(JobIssue.id == job_issue_id).first()
    if db_job_issue is None:
        raise HTTPException(status_code=404, detail="Job issue not found")
    db.delete(db_job_issue)
    db.commit()

def resolve_job_issue(db: Session, job_issue_id: UUID) -> Optional[JobIssue]:
    db_job_issue = db.query(JobIssue).filter(JobIssue.id == job_issue_id).first()
    if db_job_issue is None:
        raise HTTPException(status_code=404, detail="Job issue not found")
    db_job_issue.resolved = True
    db_job_issue.resolved_date_time = datetime.now()
    db.commit()

def get_wrm_requirements(
    db: Session, 
    job_id: UUID
):
    job = db.query(Job).filter(Job.id == job_id).first()
    job_plan = job.job_plan
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    output = {}

    for wrm in list(job_schema_map[job.job_type]['wrm'].model_fields.keys()):
        output[wrm] = getattr(job_plan, wrm)
    
    return output

def get_wrm_progress(
    db: Session, 
    job_id: UUID
):
    job = db.query(Job).filter(Job.id == job_id).first()
    job_plan = job.job_plan
    actual_job = job.actual_job
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    output = {
        'header':{
            'well_name': job.well_name,
        },
        'wbs':{},
        'rig_id': job.job_plan.rig_id,
    }
    
    wbs = actual_job.work_breakdown_structure

    for wrm in list(job_schema_map[job.job_type]['wrm'].model_fields.keys()):
        if getattr(job_plan, wrm):
            output[wrm] = getattr(actual_job, wrm)
            output['wbs'][wrm] = {
                'start_date': getattr(getattr(wbs, wrm), "start_date"),
                'end_date': getattr(getattr(wbs, wrm), "end_date"),
            }
    
    return output

def view_wrm_progress(
    db: Session, 
    job_id: UUID
):
    job = db.query(Job).filter(Job.id == job_id).first()
    job_plan = job.job_plan
    actual_job = job.actual_job
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    output = {}

    for wrm in list(job_schema_map[job.job_type]['wrm'].model_fields.keys()):
        if getattr(job_plan, wrm):
            output[wrm_name_map.get(wrm, wrm)] = getattr(actual_job, wrm)
    
    return output
                
def update_wrm(
    db: Session, 
    job_id: UUID, 
    wrm_data: object
):
    job = db.query(Job).filter(Job.id == job_id).first()
    actual_job = job.actual_job
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    wbs = actual_job.work_breakdown_structure
    
    for wrm in list(job_schema_map[job.job_type]['wrm'].model_fields.keys()):
        setattr(actual_job, wrm, getattr(wrm_data, wrm))
        if getattr(wrm_data.wbs, wrm):
            setattr(getattr(wbs, wrm), "start_date", getattr(getattr(wrm_data.wbs, wrm), 'start_date', None))
            setattr(getattr(wbs, wrm), "end_date", getattr(getattr(wrm_data.wbs, wrm),'end_date', None))

    job.job_plan.rig_id = wrm_data.rig_id
    
    db.commit()

def get_dor_dates(db: Session, job_id: UUID):
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.operation_status not in [OperationStatus.OPERATING, OperationStatus.FINISHED]:
        raise HTTPException(status_code=400, detail="Job is not operating or finished")
    
    
    dor_dates = [date for (date,) in db.query(DailyOperationsReport.report_date).filter(DailyOperationsReport.job_id == job_id).all()]

    colored_dates = []

    actual_start_date = job.actual_start_date
    actual_end_date = job.actual_end_date if job.actual_end_date else date.today()
    date_range = daterange(actual_start_date, actual_end_date)

    combined_dates = sorted(set(dor_dates) | set(date_range))
    
    for _date in combined_dates:
        # if actual_start_date >= _date >= actual_end_date:
        if _date in dor_dates:
            color = 'green'
        elif _date == date.today():
            color = 'blue'
        else:
            color = 'red'
        colored_dates.append(
            ColoredDate(
                date=_date,
                color=color
            )
        )
    
    return colored_dates

def get_dor_by_date(db: Session, job_id: UUID, dor_date: date):
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    dor = db.query(DailyOperationsReport).filter(DailyOperationsReport.report_date == dor_date).first()
    
    return dor

def get_wrmissues_data_by_job_id(db: Session, job_id: UUID) -> List[JobIssueResponse]:
    wrm_data = db.query(JobIssue).filter(JobIssue.job_id == job_id).all()
    return wrm_data

def get_drilling_operation(value: str) -> DrillingOperation:
    for operation in DrillingOperation:
        if value.lower() in operation.value.lower():
            return operation
    raise ValueError(f"No matching DrillingOperation found for: {value}")

def get_BHA(value: str) -> BHAComponentType:
    for bhacomponent in BHAComponentType:
        if value.lower() in bhacomponent.value.lower():
            return bhacomponent
    raise ValueError(f"No matching DrillingOperation found for: {value}")

def get_job_instance(db: Session, job_instance_id: UUID):
    return db.query(JobInstance).filter(JobInstance.job_instance_id == job_instance_id).first()

def get_job_operation_validations(db: Session, job_id: UUID):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    actual_job = job.actual_job
    if not actual_job:
        raise HTTPException(status_code=404, detail="Job has not been operated yet")
    
    error_list = check_fields(
        job_schema_map[job.job_type]['validation'].model_validate(actual_job), skipkey=['parent_well_id']
    )
    
    return error_list

def finish_operation(
    db: Session, 
    job_id: UUID,
    finish_operation: FinishOperation
):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_job.operation_status = OperationStatus.FINISHED
    db_job.date_finished = finish_operation
    db_job.actual_job.well.well_status = finish_operation.well_status
    db_job.actual_job.well.remark = finish_operation.remarks
    db.commit()

def get_operation(db: Session, job_id: UUID):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if db_job.operation_status not in [OperationStatus.OPERATING, OperationStatus.FINISHED]:
        raise HTTPException(status_code=400, detail="Job is not in operating or finished")
    
    db_operation = db_job.actual_job
    job_plan = db_job.job_plan
    
    if not db_operation:
        raise HTTPException(status_code=404, detail="Job has not been operated yet")
    
    # actual_job_schema = job_schema_map[db_job.job_type]['schema']['update'].model_validate(db_operation)
    output_schema = job_schema_map[db_job.job_type]['schema']['get-update'].model_validate(db_job)
    
    for wrm in list(job_schema_map[db_job.job_type]['wrm'].model_fields.keys()):
        if getattr(job_plan, wrm):
            setattr(output_schema.actual_job, wrm, getattr(job_plan, wrm))
    
    return output_schema.model_dump()

def get_plan_vs_actual_job(db_job: Job, attribute: str):
    return {
        'plan': getattr(db_job.job_plan, attribute),
        'actual': getattr(db_job.actual_job, attribute)
    }

def get_plan_vs_actual_well(db_job: Job, attribute: str):
    return {
        'plan': getattr(db_job.job_plan.well, attribute),
        'actual': getattr(db_job.actual_job.well, attribute)
    }

def get_plan_vs_actual_well_elevation(db_job: Job, attribute: str, uom_attribute: str):
    return {
        'plan': f'{getattr(db_job.job_plan.well, attribute)} {getattr(db_job.job_plan.well, uom_attribute)}',
        'actual': f'{getattr(db_job.actual_job.well, attribute)} {getattr(db_job.actual_job.well, uom_attribute)}',
    }

def view_operation(db: Session, job_id: UUID):
    db_job = db.query(Job).get(job_id)

    if not db_job:
        raise HTTPException(status_code=404, detail="Job operation not found")
    if db_job.operation_status not in [OperationStatus.OPERATING, OperationStatus.FINISHED]:
        raise HTTPException(status_code=400, detail="Job is not in operating or finished")

    well_key_data = {
        'metadata':{
            'Parent Well': db_job.actual_job.well.parent_well.well_name if db_job.actual_job.well.parent_well else None,
        },
        'comparative_data':{
            "Nama Well": get_plan_vs_actual_well(db_job, 'well_name'),
            "Nomor Well": get_plan_vs_actual_well(db_job, 'well_num'),
            "Tipe Level Well": get_plan_vs_actual_well(db_job, 'well_level_type'),
            "Klasifikasi Well": get_plan_vs_actual_well(db_job, 'well_class'),
            "Tipe Profil Well": get_plan_vs_actual_well(db_job, 'well_profile_type'),
            "Tipe Lingkungan": get_plan_vs_actual_well(db_job, 'environment_type'),
            "Fase Well": get_plan_vs_actual_well(db_job, 'well_phase'),
            "Longitude Permukaan": get_plan_vs_actual_well(db_job, 'surface_longitude'),
            "Latitude Permukaan": get_plan_vs_actual_well(db_job, 'surface_latitude'),
            "Longitude Bottom Hole": get_plan_vs_actual_well(db_job, 'bottom_hole_longitude'),
            "Latitude Bottom Hole": get_plan_vs_actual_well(db_job, 'bottom_hole_latitude'),
            "Tanggal Tajak": get_plan_vs_actual_well(db_job, 'spud_date'),
            "Tanggal Selesai Drilling": get_plan_vs_actual_well(db_job, 'final_drill_date'),
            "Tanggal Komplesi": get_plan_vs_actual_well(db_job, 'completion_date'),
            "Tanggal Abandonment": get_plan_vs_actual_well(db_job, 'abandonment_date'),
            "Tanggal Rig On Site": get_plan_vs_actual_well(db_job, 'rig_on_site_date'),
            "Tanggal Rig Release": get_plan_vs_actual_well(db_job, 'rig_release_date'),
            "Elevasi Rotary Table": get_plan_vs_actual_well_elevation(db_job, "rotary_table_elev", "rotary_table_elev_uom"),
            "Elevasi Kelly Bushing": get_plan_vs_actual_well_elevation(db_job, "kb_elev", "kb_elev_uom"),
            "Elevasi Derrick Floor": get_plan_vs_actual_well_elevation(db_job, "derrick_floor_elev", "derrick_floor_elev_uom"),
            "Elevasi Ground": get_plan_vs_actual_well_elevation(db_job, "ground_elev", "ground_elev_uom"),
            "Ground Elevation Type": get_plan_vs_actual_well(db_job, "ground_elev_type"),
            "Mean Sea Level Difference": get_plan_vs_actual_well_elevation(db_job, "difference_lat_msl", "elev_ref_datum"),
            "Maximum TVD": get_plan_vs_actual_well_elevation(db_job, "maximum_tvd", "maximum_tvd_uom"),
            "Final MD": get_plan_vs_actual_well_elevation(db_job, "final_md", "final_md_uom"),
            "Depth Datum": get_plan_vs_actual_well(db_job, 'depth_datum'),
            "Water Depth": get_plan_vs_actual_well_elevation(db_job, "water_depth", "water_depth_uom"),
            "Water Depth Datum": get_plan_vs_actual_well(db_job, 'water_depth_datum'),
            "Top Depth": get_plan_vs_actual_well_elevation(db_job, "top_depth", "top_depth_uom"),
            "Deepest Depth": get_plan_vs_actual_well_elevation(db_job, "deepest_depth", "deepest_depth_uom"),
            "Plugback Depth": get_plan_vs_actual_well_elevation(db_job, "plugback_depth", "plugback_depth_uom"),
            "Whipstock Depth": get_plan_vs_actual_well_elevation(db_job, "whipstock_depth", "whipstock_depth_uom"),
            "Kick Off Point": get_plan_vs_actual_well_elevation(db_job, "drill_td", "drill_td_uom"),
            "Water Acoustic Velocity": get_plan_vs_actual_well_elevation(db_job, "water_acoustic_vel", "water_acoustic_vel_uom"),
            "Net Pay": get_plan_vs_actual_well_elevation(db_job, "net_pay", "net_pay_uom"),
        }
    }
    
    rig_data = {
        "Nama Rig": get_plan_vs_actual_job(db_job, 'rig_name'),
        "Tipe Rig": get_plan_vs_actual_job(db_job, 'rig_type'),
        "RIG HP": get_plan_vs_actual_job(db_job, 'rig_horse_power')
    } if db_job.actual_job.rig else {}
    
    if db_job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
        additional_operational_data = rig_data
        
        technical_data = well_key_data
        
    else:
        additional_operational_data = {
            **rig_data,
            "Peralatan": get_plan_vs_actual_job(db_job, 'equipment'),
            "Spesifikasi Peralatan": get_plan_vs_actual_job(db_job, 'equipment_specifications'),
        }
        
        technical_data = {
            "Production": {
                'Onstream Oil': get_plan_vs_actual_job(db_job, 'onstream_oil'),
                'Onstream Gas': get_plan_vs_actual_job(db_job, 'onstream_gas'),
                'Onstream Water Cut': get_plan_vs_actual_job(db_job, 'onstream_water_cut'),
                # 'Target Oil': get_plan_vs_actual_job(db_job, 'target_oil'),
                # 'Target Gas': get_plan_vs_actual_job(db_job, 'target_gas'),
                # 'Target Water Cut': get_plan_vs_actual_job(db_job, 'target_water_cut'),
            },
            "Well Information": well_key_data
        }
    view_actual = {
        'header':{
            "well_name": db_job.actual_job.well.well_name,
            "job_type": db_job.job_type.value,
            "operation_status": db_job.operation_status.value,
        },
        'job_summary':{
            "project":{
                "metadata":{
                    "Tipe Pekerjaan": db_job.job_type,
                    "KKKS": db_job.kkks.name,
                    "Wilayah Kerja": db_job.area.name,
                    "Field": db_job.field.name,
                    "Jenis Kontrak": db_job.contract_type.value,
                    "Nomor AFE": db_job.afe_number,
                    "Tahun WP&B": db_job.wpb_year,
                    'Tanggal Diajukan': db_job.date_proposed,
                    "Operation Status": db_job.operation_status,
                },
                "comparative_data":{
                    "Tanggal Mulai": get_plan_vs_actual_job(db_job, 'start_date'),
                    "Tanggal Selesai": get_plan_vs_actual_job(db_job, 'end_date'),
                    "Total Budget": get_plan_vs_actual_job(db_job, 'total_budget'),
                    **additional_operational_data,
                }
            },
            "technical": technical_data,
            "project_available_data": db_job.actual_job.available_data,
            **({"well_available_data": db_job.actual_job.well.available_data} if db_job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT] else {}),
        },
        "location": f'/spatial/get/well-info/{db_job.actual_job.well.id}',
    }

    view_actual['job_operation_days'] = create_actual_time_depth_curve(
        db_job
    )

    view_actual['work_breakdown_structure'] = create_actual_gantt_chart(
        db_job
    )
    
    plan_project_management_team = db_job.job_plan.job_project_management_team
    actual_project_management_team = db_job.actual_job.job_project_management_team
    
    view_actual['project_management_team'] = {
        'plan' : [
            JobProjectManagementTeamBase.model_validate(team).model_dump(by_alias=True) for team in plan_project_management_team
        ] if plan_project_management_team else None,
        'actual' : [
            JobProjectManagementTeamBase.model_validate(team).model_dump(by_alias=True) for team in actual_project_management_team
        ] if actual_project_management_team else None
    }
    
    plan_hse_aspect = db_job.job_plan.job_hse_aspect
    actual_hse_aspect = db_job.actual_job.job_hse_aspect

    view_actual['job_hse'] = {
        'hazard' : {
            'plan': create_job_hazard_table(
                db_job.job_plan
            ),
            'actual': create_job_hazard_table(
                db_job.actual_job
            ),
        },
        'hse_aspects' : {
            'plan': JobHSEAspectBase.model_validate(plan_hse_aspect).model_dump(by_alias=True) if plan_hse_aspect else None,
            'actual': JobHSEAspectBase.model_validate(actual_hse_aspect).model_dump(by_alias=True) if actual_hse_aspect else None
        }
    }
    
    plan_job_equipment = db_job.job_plan.job_equipments
    actual_job_equipment = db_job.actual_job.job_equipments
    
    view_actual['job_equipment'] = {
        'plan' : [
            JobEquipmentBase.model_validate(equipment).model_dump(by_alias=True) for equipment in plan_job_equipment
        ] if plan_job_equipment else None,
        'actual' : [
            JobEquipmentBase.model_validate(equipment).model_dump(by_alias=True) for equipment in actual_job_equipment
        ] if actual_job_equipment else None
    }
    
    view_actual['job_documents'] = create_job_documents_table(
        db_job.actual_job
    )
    
    if db_job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
            
        view_actual['well_casings'] = create_actual_casing(
            db_job
        )
        
        view_actual['well_schematic'] = create_actual_schematic(
            db_job
        )

        view_actual['well_trajectory'] = create_actual_trajectory(
            db_job
        )
        
        view_actual['well_ppfg'] = create_actual_ppfg(
            db_job
        )
    
        view_actual['well_log'] = create_logs(
            db_job.actual_job.well
        )
        
        view_actual['seismic_section'] = create_actual_seismic_section(
            db_job
        )
        
        view_actual['well_equipments'] = [WellEquipmentBase.model_validate(well_equipment) for well_equipment in db_job.actual_job.well.well_equipments] if db_job.actual_job.well.well_equipments else None
        
        view_actual['well_pressure'] = [WellPressureBase.model_validate(well_pressure) for well_pressure in db_job.actual_job.well.well_pressure] if db_job.actual_job.well.well_pressure else None
        
        view_actual['well_completion'] = [WellCompletionBase.model_validate(well_completion) for well_completion in db_job.actual_job.well.well_completion] if db_job.actual_job.well.well_completion else None
        
        view_actual['well_stratigraphy'] = create_well_stratigraphy_table(
            db_job.actual_job.well
        )
        
        view_actual['well_documents'] = create_well_documents_table(db_job.actual_job.well)
        
        if db_job.job_type == JobType.EXPLORATION:
            
            view_actual['well_tests'] = [WellTestBase.model_validate(well_test) for well_test in db_job.actual_job.well.well_tests] if db_job.actual_job.well.well_tests else None
            
            view_actual['well_cores'] = create_well_cores_table(db_job.actual_job.well)
    
    else:
        
        view_actual['well_schematic'] = create_wows_actual_schematic(
            db_job
        )
        
    return view_actual

def update_operation(
    db: Session, 
    job_id: UUID, 
    actual: Union[UpdateActualExploration, UpdateActualDevelopment, UpdateActualWorkover, UpdateActualWellService]
):
    db_job = db.query(Job).filter(Job.id ==job_id).first()
    if Job.operation_status is None or Job.actual_job is None:
        raise HTTPException(status_code=404, detail="Job has not started yet")
    
    db_actual_job_old = db_job.actual_job
    
    #find job_type
    actual_job_schema = job_schema_map[db_job.job_type]['model']['actual']
    db_actual_job_new = actual_job_schema(**parse_schema(actual, variables={'uwi':db_actual_job_old.well.id, 'unit_type':db_actual_job_old.well.unit_type}))
    
    #id
    db_actual_job_new.id = db_actual_job_old.id
    if Job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
        db_actual_job_new.well.field_id = db_actual_job_old.well.field_id
        db_actual_job_new.well.kkks_id = db_actual_job_old.well.kkks_id
        db_actual_job_new.well.seismic_line_id = db_actual_job_old.well.seismic_line_id
        db_actual_job_new.well.area_id = db_actual_job_old.well.area_id
    
    #wrm
    for wrm in list(job_schema_map[db_job.job_type]['wrm'].model_fields.keys()):
        setattr(db_actual_job_new, wrm, getattr(db_actual_job_old, wrm))
    
    # db_job.actual_job = db_actual_job_new
    if Job.job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
        update_object(db_actual_job_old.well, db_actual_job_new.well)
    update_object(db_actual_job_old, db_actual_job_new, exclude_fields=['well'])

    change_files_status_to_used(actual, db)
    db.commit()

def get_ppp_afe_info(db: Session, job_id: UUID):
    result = db.query(
        Job.afe_number.label('nomor_afe'),
        Job.plan_total_budget.label('total_anggaran'),
        Job.actual_total_budget.label('estimasi_realisasi_biaya'),
    ).filter(Job.id == job_id).first()
    
    return {
        'nomor_afe': result.nomor_afe,
        'total_budget': result.total_anggaran,
        'estimated_budget': result.estimasi_realisasi_biaya
    }

def propose_ppp(db: Session, job_id: UUID, ppp: ProposePPP):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    propose_ppp_model_fields = ProposePPP.model_fields.keys()
    
    syarat_ppp_fields = [x for x in propose_ppp_model_fields if x not in ["dokumen_lainnya"]]
    
    for syarat_ppp in syarat_ppp_fields:
        
        if isinstance(getattr(ppp, syarat_ppp), BaseModel):
            dokumen_syarat_obj = JobDocument(**getattr(ppp, syarat_ppp).model_dump(), job_instance_id = job.actual_job_id, document_type = JobDocumentType.PPP)
        
        setattr(job, syarat_ppp, dokumen_syarat_obj)
    
    documents = []
    job.nomor_surat_pengajuan_ppp = ppp.nomor_surat_pengajuan_ppp
    
    for dokumen in ppp.dokumen_lainnya:
        documents.append(
            JobDocument(
                **dokumen.model_dump(),
                job_instance_id = job.actual_job_id,
                document_type = JobDocumentType.PPP_OTHER
            )
        )
    
    db.add_all(documents)
    
    job.date_ppp_proposed = date.today()
    job.ppp_status = PPPStatus.PROPOSED
    
    db.commit()

def approve_ppp(db: Session, job_id: UUID):
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.date_ppp_approved = date.today()
    job.ppp_status = PPPStatus.APPROVED
    
    existing_well = ExistingWell(**parse_schema(CreateExistingWell.model_validate(job.actual_job.well), variables={"uwi": job.actual_job.well.id, "unit_type": job.actual_job.well.unit_type}))
    
    db.recursive_add(existing_well)
    
    db.commit()

def return_ppp(db: Session, job_id: UUID):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    job.date_ppp_approved = None
    job.ppp_status = PPPStatus.RETURNED

    db.commit()

def get_ppp(db: Session, job_id: UUID):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    propose_ppp_model_fields = ProposePPP.model_fields.keys()
    
    syarat_ppp_fields = [x for x in propose_ppp_model_fields if x not in ["dokumen_lainnya"]]
    
    output = {}
    
    for syarat_ppp in syarat_ppp_fields:
        
        document_obj = getattr(job, syarat_ppp)
        
        if not isinstance(document_obj, str):
        
            if document_obj:
                output[syarat_ppp] = {
                    'file_id': document_obj.file.id,
                    'filename': document_obj.file.filename,
                    'file_download_path': f"/utils/download/file/{document_obj.file.id}",
                    'file_remove_path': f"/utils/delete/file/{document_obj.file.id}"
                }
            
            else:
                output[syarat_ppp] = None
        else:
            output[syarat_ppp] = document_obj
    
    dokumen_lainnya = db.query(JobDocument).filter(JobDocument.job_instance_id == job.actual_job_id, JobDocument.document_type == JobDocumentType.PPP_OTHER).all()
    
    output["dokumen_lainnya"] = []
    
    for dokumen in dokumen_lainnya:
        output["dokumen_lainnya"].append(
            {
                'file_id': dokumen.file.id,
                'filename': dokumen.file.filename,
                'remark': dokumen.remark,
                'file_download_path': f"/utils/download/file/{dokumen.file.id}",
                'file_remove_path': f"/utils/delete/file/{dokumen.file.id}"
            }
        )
        
    output['status_ppp'] = job.ppp_status.value
    
    return output

def update_co(db: Session, job_id: UUID, co: UpdateCO):
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.final_budget = co.final_budget
    job.closeout_status = CloseOutStatus.APPROVED
    job.date_co_approved = datetime.now().date()
    
    documents = []

    for dokumen in co.dokumen_lainnya:
        documents.append(
            JobDocument(
                **dokumen.model_dump(),
                document_type = JobDocumentType.CO_OTHER
            )
        )
    
    db.add_all(documents)
    
    db.commit()

def get_co(db: Session, job_id: UUID):
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    co = {
        'final_budget' : job.final_budget,
    }
    
    dokumen_lainnya = db.query(JobDocument).filter(JobDocument.job_instance_id == job.actual_job_id, JobDocument.document_type == JobDocumentType.CO_OTHER).all()
    
    co["dokumen_lainnya"] = []
    
    for dokumen in dokumen_lainnya:
        co["dokumen_lainnya"].append(
            {
                'file_id': dokumen.file.id,
                'filename': dokumen.file.filename,
                'remark': dokumen.remark,
                'file_download_path': f"/utils/download/file/{dokumen.file.id}",
                'file_remove_path': f"/utils/delete/file/{dokumen.file.id}"
            }
        )
    
    return co

def export_to_ppdm(db: Session, job_type: JobType):
    
    wells = db.query(ActualWell).join(
        JobInstance, JobInstance.well_id == ActualWell.id
    ).join(
        Job, Job.actual_job_id == JobInstance.job_instance_id
    ).filter(Job.job_type == job_type, Job.operation_status == OperationStatus.FINISHED).all()
    
    well_list = []
    
    for well in wells:
        
        try:
            utm_coords = utm.from_latlon(well.surface_latitude, well.surface_longitude)
            easting = utm_coords[0]
            northing = utm_coords[1]
            zone_number = utm_coords[2]
            zone_letter = utm_coords[3]
            utm_quadrant = f'{zone_number}{zone_letter}'
        except:
            easting = None
            northing = None
            zone_number = None
            zone_letter = None
        
        well_data = {
            "BA_LONG_NAME": well.kkks.name,
            "BA_TYPE": None,
            "AREA_ID": well.area.label,
            "AREA_TYPE": well.area.type.value,
            "FIELD_NAME": well.field.name,
            "WELL_NAME": well.well_name,
            "ALIAS_LONG_NAME": well.alias_long_name,
            "UWI": well.uwi,
            "STATUS_TYPE": well.well_status.value,
            "WELL_CLASS": well.well_type.value,
            "WELL_LEVEL_TYPE": None,
            "PROFILE_TYPE": well.well_profile_type.value,
            "PROJECTED_STRAT_UNIT_ID": None,
            "SURFACE_LONGITUDE": well.surface_latitude,
            "SURFACE_LATITUDE": well.surface_longitude,
            "EASTING": easting,
            "EASTING_OUOM": 'M',
            "NORTHING": northing,
            "NORTHING_OUOM": 'M',
            "UTM_QUADRANT": utm_quadrant,
            "PROJECTION_TYPE": 'UTM',
            "GEODETIC_DATUM_NAME": 'WGS84',
            "ENVIRONMENT_TYPE": well.environment_type.value,
            "LINE_NAME": well.line_name,
            "SEIS_POINT_ID": None,
            "SPUD_DATE": well.spud_date,
            "FINAL_DRILL_DATE": well.final_drill_date,
            "COMPLETION_DATE": well.completion_date,
            "ROTARY_TABLE_ELEV": well.rotary_table_elev,
            "ROTARY_TABLE_ELEV_OUOM": well.rotary_table_elev_uom,
            "KB_ELEV": well.kb_elev,
            "KB_ELEV_OUOM": well.kb_elev_uom,
            "DERRICK_FLOOR_ELEV": well.derrick_floor_elev,
            "DERRICK_FLOOR_ELEV_OUOM": well.derrick_floor_elev_uom,
            "WATER_DEPTH": well.mean_sea_level,
            "WATER_DEPTH_OUOM": well.mean_sea_level_uom,
            "GROUND_ELEV": well.ground_elev,
            "GROUND_ELEV_OUOM": well.ground_elev_uom,
            "DEPTH_DATUM": well.depth_datum.value,
            "DRILL_TD": None,
            "DRILL_TD_OUOM": None,
            "LOG_TD": None,
            "LOG_TD_OUOM": None,
            "MAX_TVD": well.maximum_tvd,
            "MAX_TVD_OUOM": well.maximum_tvd_uom,
            "PROJECTED_DEPTH": None,
            "PROJECTED_DEPTH_OUOM": None,
            "FINAL_TD": well.final_md,
            "FINAL_TD_OUOM": well.final_md_uom,
            "OPERATOR_BA_ID": None,
            "RIG_NAME": None,
            "RIG_TYPE": None,
            "TEST_RESULT_CODE": None,
            "REMARK": None,
            "SOURCE": "ApDPS",
            "ROW_QUALITY": None,
            "CHECKED_BY_BA_ID": None,
            "QW_UNIQUE_WELL_IDENTIFIER_ORI": None,
            "QW_PROJECTTITLE": None,
            "QW_CATALOG_TIME": None,
            "QW_BANYAKOBJECT": None,
            "QW_BOREHOLE_WELLBORE": None,
            "QW_WELL_NAME_ORIGINAL": None,
            "QW_LOCATION": None,
            "QW_RIGHT_HOLDER": None,
            "QW_AREA": None,
            "QW_RKB_ELEVATION": None,
            "QW_GRID": None,
            "QW_CM_CENTRAL_MERIDIAN": None,
            "QW_SP_NAME": None,
            "QW_CATEGORYNAME": None,
            "QW_COUNTRY": None,
            "QW_TEST_RESULT": None,
            "QW_TOP_REFERENCE_POINT": None,
            "QW_RIG_REALEASED_DATE": None,
            "QW_ACTUAL_COST": None,
            "QW_ACTUAL_COST_UNITS": None,
            "QW_BOTT_LONGITUDE": None,
            "QW_BOTT_LATITUDE": None,
            "QW_GIS_QC_DATE": None,
            "QW_BOTT_OTHER_COOR_DIR_X": None,
            "QW_BOTT_OTHER_COORDINAT_X": None,
            "QW_BOTT_OTHER_COOR_DIR_Y": None,
            "QW_BOTT_OTHER_COORDINAT_Y": None,
            "QW_BOTT_REFERENCE_POINT": None,
            "QW_OTHER_COOR_UNIT_X": None,
            "QW_OTHER_COOR_UNIT_Y": None,
            "QW_BOTT_OTHER_COOR_UNIT_X": None,
            "QW_OTHER_COOR_DIR_X": None,
            "QW_OTHER_COOR_DIR_Y": None,
            "QW_BOTT_OTHER_COOR_UNIT_Y": None,
            "QW_ESTIMATE_COST": None,
            "QW_ESTIMATE_COST_UNITS": None,
            "QW_AFE": None,
            "QW_AFE_UNITS": None,
            "QW_MAX_DEVIATION": None,
            "DM_ROW_CREATED_BY": None,
            "DM_ROW_CREATED_DATE": None,
            "DM_ROW_APPROVED_BY": None,
            "DM_ROW_APPROVED_DATE": None,
            "DM_ROW_LOADED_BY": None,
            "DM_ROW_LOADED_DATE": None,
            "DM_ROW_QC_BY": None,
            "DM_ROW_QC_DATE": None,
            "QW_SPHEROID": None
        }
        
        well_list.append(well_data)
        
    df = pd.DataFrame(well_list)
    
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    headers = {
        'Content-Disposition': 'attachment; filename="PPDMExport.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }

    return Response(content=output.getvalue(), headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

def read_dor_from_witsml(job_id: UUID, db: Session, witsml_file: UploadFile):
    
    job = db.query(Job).get(job_id)
    
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.operation_status not in [OperationStatus.OPERATING, OperationStatus.FINISHED]:
        raise HTTPException(status_code=400, detail="Job is not in operating or finished")
    
    data = xmltodict.parse(witsml_file.file.read())
    
    ops_reports = data['opsReports']['opsReport']
    
    reports = []
    
    for ops_report in ops_reports:

        if ops_report.get('dTim', None) is not None:
            
            ops_report_activities = ops_report.get('activity', [])
            ops_report_personnels = ops_report.get('personnel', [])
            
            if isinstance(ops_report_activities, dict):
                ops_report_activities = [ops_report_activities]
            if isinstance(ops_report_personnels, dict):
                ops_report_personnels = [ops_report_personnels]
            
            dor_dict = {
                "daily_cost": ops_report.get('costDay', 0),
                "engineer": ops_report.get('engineer', None),
                "geologist": ops_report.get('geologist', None),
                "day_summary": ops_report.get('sum24Hr', None),
                "day_forecast": ops_report.get('forecast24Hr', None),
                "last_size": ops_report.get('diaCsgLast', {}).get('#text', None),
                "set_md": ops_report.get('mdCsgLast', {}).get('#text', None),
                "stop_cards": ops_report.get('hse', {}).get('numStopCards', 0),
                "personnel": [
                    {
                        "company": ops_report_personnel.get('company', None),
                        "people": ops_report_personnel.get('numPeople', 0)
                    } for ops_report_personnel in ops_report_personnels
                ],
                "time_breakdowns": [
                    {
                        "start_time": ops_report_activity.get('dTimStart', None),
                        "end_time": ops_report_activity.get('dTimEnd', None),
                        "start_measured_depth": ops_report_activity.get('mdHoleStart', {}).get('#text', None),
                        "end_measured_depth": ops_report_activity.get('mdHoleEnd', {}).get('#text', None),
                        "category": None,
                        "p": "Y" if ops_report_activity.get('typeActivityClass') == "P" else "N",
                        "npt": "P" if ops_report_activity.get('typeActivityClass') == "P" else "NP",
                        "code": None,
                        "operation": ops_report_activity.get('comments', None)
                    }   for ops_report_activity in ops_report_activities
                ],
                    "report_date": ops_report.get('dTim', None)
                }
        
        report = DailyOperationsReportCreate.model_validate(dor_dict)
        
        db_report = DailyOperationsReport(
            **parse_schema(report), job_id = job_id
        )
        
        reports.append(db_report)
    
    db.add_all(reports)
    db.commit()
    
# def get_job_sidebar(db: Session, job_type:str,status:str) -> Dict[str, bool]:
    
#     if(job_type == "EXPLORATION"):
#         if(status == "planning"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.planning_status == "APPROVED" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.planning_status == "PROPOSED" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.planning_status == "RETURNED" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "APPROVED": bool(approved_exists),
#                     "PROPOSED": bool(proposed_exists),
#                     "RETURNED": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "operational"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 proposed_exists = db.query(
#                     exists().where(Job.operation_status == "OPERATING" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.operation_status == "FINISHED" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "BEROPERASI": bool(proposed_exists),
#                     "SELESAI": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "ppp"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.ppp_status == "APPROVED" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.ppp_status == "PROPOSED" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
                
#                 returned_exists = db.query(
#                     exists().where(Job.ppp_status == "RETURNED" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "DISETUJUI": bool(approved_exists),
#                     "DIAJUKAN": bool(process_exists),
#                     "RETURNED": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "co"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.closeout_status == "APPROVED" , Job.job_type == "EXPLORATION")
#                 ).scalar()
                
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "DISETUJUI": bool(approved_exists),
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#     elif(job_type == "DEVELOPMENT"):
#         if(status == "planning"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.planning_status == "APPROVED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.planning_status == "PROCESS" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.planning_status == "PROPOSED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.planning_status == "RETURNED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "APPROVED": bool(approved_exists),
#                     "PROCESS": bool(process_exists),
#                     "PROPOSED": bool(proposed_exists),
#                     "RETURNED": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "operational"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.planning_status == "APPROVED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.operation_status == "PROCESS" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.operation_status == "OPERATING" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.operation_status == "FINISHED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "DISETUJUI": bool(approved_exists),
#                     "PERSIAPAN": bool(process_exists),
#                     "BEROPERASI": bool(proposed_exists),
#                     "SELESAI": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "ppp"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.operation_status == "FINISHED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.ppp_status == "PROPOSED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.ppp_status == "PROCESS" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.ppp_status == "FINISHED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "DISETUJUI": bool(approved_exists),
#                     "DIAJUKAN": bool(process_exists),
#                     "DIPROSES": bool(proposed_exists),
#                     "SELESAI": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "co"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.ppp_status == "FINISHED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.closeout_status == "PROPOSED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.closeout_status == "PROCESS" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.closeout_status == "FINISHED" , Job.job_type == "DEVELOPMENT")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "SELESAI": bool(approved_exists),
#                     "DIAJUKAN": bool(process_exists),
#                     "DIPROSES": bool(proposed_exists),
#                     "DISETUJUI": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#     elif(job_type == "WORKOVER"):
#         if(status == "planning"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.planning_status == "APPROVED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.planning_status == "PROCESS" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.planning_status == "PROPOSED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.planning_status == "RETURNED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "APPROVED": bool(approved_exists),
#                     "PROCESS": bool(process_exists),
#                     "PROPOSED": bool(proposed_exists),
#                     "RETURNED": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "operational"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.planning_status == "APPROVED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.operation_status == "PROCESS" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.operation_status == "OPERATING" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.operation_status == "FINISHED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "DISETUJUI": bool(approved_exists),
#                     "PERSIAPAN": bool(process_exists),
#                     "BEROPERASI": bool(proposed_exists),
#                     "SELESAI": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "ppp"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.operation_status == "FINISHED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.ppp_status == "PROPOSED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.ppp_status == "PROCESS" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.ppp_status == "FINISHED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "DISETUJUI": bool(approved_exists),
#                     "DIAJUKAN": bool(process_exists),
#                     "DIPROSES": bool(proposed_exists),
#                     "SELESAI": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#         elif(status == "co"):
#             try:
#                 # Dictionary untuk menyimpan hasil pengecekan status
#                 status_exists = {}
                
#                 # Cek keberadaan setiap status
#                 approved_exists = db.query(
#                     exists().where(Job.ppp_status == "FINISHED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
                
#                 process_exists = db.query(
#                     exists().where(Job.closeout_status == "PROPOSED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 proposed_exists = db.query(
#                     exists().where(Job.closeout_status == "PROCESS" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 returned_exists = db.query(
#                     exists().where(Job.closeout_status == "FINISHED" , Job.job_type == "WORKOVER")
#                 ).scalar()
                
#                 # Masukkan hasil ke dictionary
#                 status_exists = {
#                     "SELESAI": bool(approved_exists),
#                     "DIAJUKAN": bool(process_exists),
#                     "DIPROSES": bool(proposed_exists),
#                     "DISETUJUI": bool(returned_exists)
#                 }
                
#                 return status_exists
                
#             except Exception as e:
#                 print(f"Error in get_job_sidebar: {str(e)}")
#                 raise
#     elif(job_type == "WELLSERVICE"):
        # if(status == "planning"):
        #     try:
        #         # Dictionary untuk menyimpan hasil pengecekan status
        #         status_exists = {}
                
        #         # Cek keberadaan setiap status
        #         approved_exists = db.query(
        #             exists().where(Job.planning_status == "APPROVED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
                
        #         process_exists = db.query(
        #             exists().where(Job.planning_status == "PROCESS" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         proposed_exists = db.query(
        #             exists().where(Job.planning_status == "PROPOSED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         returned_exists = db.query(
        #             exists().where(Job.planning_status == "RETURNED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         # Masukkan hasil ke dictionary
        #         status_exists = {
        #             "APPROVED": bool(approved_exists),
        #             "PROCESS": bool(process_exists),
        #             "PROPOSED": bool(proposed_exists),
        #             "RETURNED": bool(returned_exists)
        #         }
                
        #         return status_exists
                
        #     except Exception as e:
        #         print(f"Error in get_job_sidebar: {str(e)}")
        #         raise
        # elif(status == "operational"):
        #     try:
        #         # Dictionary untuk menyimpan hasil pengecekan status
        #         status_exists = {}
                
        #         # Cek keberadaan setiap status
        #         approved_exists = db.query(
        #             exists().where(Job.planning_status == "APPROVED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
                
        #         process_exists = db.query(
        #             exists().where(Job.operation_status == "PROCESS" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         proposed_exists = db.query(
        #             exists().where(Job.operation_status == "OPERATING" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         returned_exists = db.query(
        #             exists().where(Job.operation_status == "FINISHED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         # Masukkan hasil ke dictionary
        #         status_exists = {
        #             "DISETUJUI": bool(approved_exists),
        #             "PERSIAPAN": bool(process_exists),
        #             "BEROPERASI": bool(proposed_exists),
        #             "SELESAI": bool(returned_exists)
        #         }
                
        #         return status_exists
                
        #     except Exception as e:
        #         print(f"Error in get_job_sidebar: {str(e)}")
        #         raise
        # elif(status == "ppp"):
        #     try:
        #         # Dictionary untuk menyimpan hasil pengecekan status
        #         status_exists = {}
                
        #         # Cek keberadaan setiap status
        #         approved_exists = db.query(
        #             exists().where(Job.operation_status == "FINISHED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
                
        #         process_exists = db.query(
        #             exists().where(Job.ppp_status == "PROPOSED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         proposed_exists = db.query(
        #             exists().where(Job.ppp_status == "PROCESS" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         returned_exists = db.query(
        #             exists().where(Job.ppp_status == "FINISHED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         # Masukkan hasil ke dictionary
        #         status_exists = {
        #             "DISETUJUI": bool(approved_exists),
        #             "DIAJUKAN": bool(process_exists),
        #             "DIPROSES": bool(proposed_exists),
        #             "SELESAI": bool(returned_exists)
        #         }
                
        #         return status_exists
                
        #     except Exception as e:
        #         print(f"Error in get_job_sidebar: {str(e)}")
        #         raise
        # elif(status == "co"):
        #     try:
        #         # Dictionary untuk menyimpan hasil pengecekan status
        #         status_exists = {}
                
        #         # Cek keberadaan setiap status
        #         approved_exists = db.query(
        #             exists().where(Job.ppp_status == "FINISHED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
                
        #         process_exists = db.query(
        #             exists().where(Job.closeout_status == "PROPOSED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         proposed_exists = db.query(
        #             exists().where(Job.closeout_status == "PROCESS" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         returned_exists = db.query(
        #             exists().where(Job.closeout_status == "FINISHED" , Job.job_type == "WELLSERVICE")
        #         ).scalar()
                
        #         # Masukkan hasil ke dictionary
        #         status_exists = {
        #             "SELESAI": bool(approved_exists),
        #             "DIAJUKAN": bool(process_exists),
        #             "DIPROSES": bool(proposed_exists),
        #             "DISETUJUI": bool(returned_exists)
        #         }
                
        #         return status_exists
                
        #     except Exception as e:
        #         print(f"Error in get_job_sidebar: {str(e)}")
        #         raise

def get_job_sidebar(db: Session, job_type: str, status: str) -> Dict[str, bool]:
    try:
        # Dictionary untuk menyimpan hasil pengecekan status
        status_exists = {}
        
        if status == "planning":
            # Cek keberadaan setiap status
            approved_exists = db.query(
                exists().where(Job.planning_status == "APPROVED", Job.job_type == job_type)
            ).scalar()
            
            proposed_exists = db.query(
                exists().where(Job.planning_status == "PROPOSED", Job.job_type == job_type)
            ).scalar()
            
            returned_exists = db.query(
                exists().where(Job.planning_status == "RETURNED", Job.job_type == job_type)
            ).scalar()
            
            # Masukkan hasil ke dictionary
            status_exists = {
                "APPROVED": bool(approved_exists),
                "PROPOSED": bool(proposed_exists),
                "RETURNED": bool(returned_exists)
            }
            
        elif status == "operational":
            # Cek keberadaan setiap status
            operating_exists = db.query(
                exists().where(Job.operation_status == "OPERATING", Job.job_type == job_type)
            ).scalar()
            
            finished_exists = db.query(
                exists().where(Job.operation_status == "FINISHED", Job.job_type == job_type)
            ).scalar()
            
            # Masukkan hasil ke dictionary
            status_exists = {
                "OPERATING": bool(operating_exists),
                "FINISHED": bool(finished_exists)
            }
            
        elif status == "ppp":
            # Cek keberadaan setiap status
            approved_exists = db.query(
                exists().where(Job.ppp_status == "APPROVED", Job.job_type == job_type)
            ).scalar()
            
            proposed_exists = db.query(
                exists().where(Job.ppp_status == "PROPOSED", Job.job_type == job_type)
            ).scalar()
            
            returned_exists = db.query(
                exists().where(Job.ppp_status == "RETURNED", Job.job_type == job_type)
            ).scalar()
            
            # Masukkan hasil ke dictionary
            status_exists = {
                "APPROVED": bool(approved_exists),
                "PROPOSED": bool(proposed_exists),
                "RETURNED": bool(returned_exists)
            }
            
        elif status == "co":
            # Cek keberadaan setiap status
            approved_exists = db.query(
                exists().where(Job.closeout_status == "APPROVED", Job.job_type == job_type)
            ).scalar()
            
            # Masukkan hasil ke dictionary
            status_exists = {
                "APPROVED": bool(approved_exists)
            }
            
        return status_exists
        
    except Exception as e:
        print(f"Error in get_job_sidebar: {str(e)}")
        raise
    
def get_job_sidebar_by_kkks(db: Session, job_type: str, status: str, kkks_id: str) -> Dict[str, bool]:
    try:
        status_exists = {}
        
        if status == "planning":
            approved_exists = db.query(
                exists().where(
                    Job.planning_status == "APPROVED", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            proposed_exists = db.query(
                exists().where(
                    Job.planning_status == "PROPOSED", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            returned_exists = db.query(
                exists().where(
                    Job.planning_status == "RETURNED", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            status_exists = {
                "APPROVED": bool(approved_exists),
                "PROPOSED": bool(proposed_exists),
                "RETURNED": bool(returned_exists)
            }
            
        elif status == "operational":
            operating_exists = db.query(
                exists().where(
                    Job.operation_status == "OPERATING", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            finished_exists = db.query(
                exists().where(
                    Job.operation_status == "FINISHED", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            status_exists = {
                "OPERATING": bool(operating_exists),
                "FINISHED": bool(finished_exists)
            }
            
        elif status == "ppp":
            approved_exists = db.query(
                exists().where(
                    Job.ppp_status == "APPROVED", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            proposed_exists = db.query(
                exists().where(
                    Job.ppp_status == "PROPOSED", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            returned_exists = db.query(
                exists().where(
                    Job.ppp_status == "RETURNED", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            status_exists = {
                "APPROVED": bool(approved_exists),
                "PROPOSED": bool(proposed_exists),
                "RETURNED": bool(returned_exists)
            }
            
        elif status == "co":
            approved_exists = db.query(
                exists().where(
                    Job.closeout_status == "APPROVED", 
                    Job.job_type == job_type,
                    Job.kkks_id == kkks_id
                )
            ).scalar()
            
            status_exists = {
                "APPROVED": bool(approved_exists)
            }
            
        return status_exists
        
    except Exception as e:
        print(f"Error in get_job_sidebar_by_kkks: {str(e)}")
        raise

def get_planning_phase_by_kkks(db: Session, job_type: str, planning_status: str, kkks_id: str):
    try:
        query = db.query(Job).filter(
            Job.job_type == job_type,
            Job.planning_status == planning_status,
            Job.kkks_id == kkks_id
        )
        
        output = []
        for job in query:
            _output = {
                "job_id": job.id,
                "NAMA_SUMUR": job.well_name if job.well_name else "N/A",
            }
            output.append(_output)
            
        return {
            "jobs": output
        }
        
    except Exception as e:
        print(f"Error in get_planning_phase_by_kkks: {str(e)}")
        raise

def get_operasi_phase_by_kkks(db: Session, job_type: str, operation_status: str, kkks_id: str):
    try:
        query = db.query(Job).filter(
            Job.job_type == job_type,
            Job.operation_status == operation_status,
            Job.kkks_id == kkks_id
        )
        
        output = []
        for job in query:
            _output = {
                "job_id": job.id,
                "NAMA_SUMUR": job.well_name if job.well_name else "N/A",
            }
            output.append(_output)
            
        return {
            "jobs": output
        }
        
    except Exception as e:
        print(f"Error in get_operasi_phase_by_kkks: {str(e)}")
        raise

def get_ppp_phase_by_kkks(db: Session, job_type: str, ppp_status: str, kkks_id: str):
    try:
        query = db.query(Job).filter(
            Job.job_type == job_type,
            Job.operation_status == "FINISHED",
            Job.ppp_status == ppp_status,
            Job.kkks_id == kkks_id
        )
        
        output = []
        for job in query:
            _output = {
                "job_id": job.id,
                "NAMA_SUMUR": job.well_name if job.well_name else "N/A",
            }
            output.append(_output)
            
        return {
            "jobs": output
        }
        
    except Exception as e:
        print(f"Error in get_ppp_phase_by_kkks: {str(e)}")
        raise

def get_co_phase_by_kkks(db: Session, job_type: str, closeout_status: str, kkks_id: str):
    try:
        query = db.query(Job).filter(
            Job.job_type == job_type,
            Job.ppp_status == "APPROVED",
            Job.closeout_status == closeout_status,
            Job.kkks_id == kkks_id
        )
        
        output = []
        for job in query:
            _output = {
                "job_id": job.id,
                "NAMA_SUMUR": job.well_name if job.well_name else "N/A",
            }
            output.append(_output)
            
        return {
            "jobs": output
        }
        
    except Exception as e:
        print(f"Error in get_co_phase_by_kkks: {str(e)}")
        raise
    
def get_planning_phase(db: Session,job_type: str,planning_status:str):
    try:
        # Query jobs
        query = db.query(Job).filter(
            Job.job_type == job_type,
            Job.planning_status == planning_status
        )
        
        output = []
        
        # Process jobs
        for job in query:
            _output = {
                "job_id": job.id,
                "NAMA_SUMUR": job.well_name if job.well_name else "N/A",
            }
            output.append(_output)
            
        # Return dengan format yang benar
        return {
            "jobs": output
        }
        
    except Exception as e:
        print(f"Error in get_exploration_proposed: {str(e)}")
        # Re-raise exception agar bisa ditangkap oleh route
        raise
    
def get_operasi_phase(db: Session,job_type: str,operation_status:str):
    try:
        # Query jobs
        query = db.query(Job).filter(
            Job.job_type == job_type,
            Job.operation_status == operation_status
            
        )
        output = []
        
        # Process jobs
        for job in query:
            _output = {
                "job_id": job.id,
                "NAMA_SUMUR": job.well_name if job.well_name else "N/A",
            }
            output.append(_output)
            
        # print (output)
            
        # Return dengan format yang benar
        return {
            "jobs": output
        }
        
    except Exception as e:
        print(f"Error in get_exploration_proposed: {str(e)}")
        # Re-raise exception agar bisa ditangkap oleh route
        raise
def get_ppp_phase(db: Session,job_type: str,ppp_status:str):
    try:
        # Query jobs
        query = db.query(Job).filter(
            Job.job_type == job_type,
            Job.operation_status == "FINISHED",
            Job.ppp_status == ppp_status
            
        )
        output = []
        
        # Process jobs
        for job in query:
            _output = {
                "job_id": job.id,
                "NAMA_SUMUR": job.well_name if job.well_name else "N/A",
            }
            output.append(_output)
            
        # print (output)
            
        # Return dengan format yang benar
        return {
            "jobs": output
        }
        
    except Exception as e:
        print(f"Error in get_exploration_proposed: {str(e)}")
        # Re-raise exception agar bisa ditangkap oleh route
        raise
def get_co_phase(db: Session,job_type: str,closeout_status:str):
    try:
        # Query jobs
        query = db.query(Job).filter(
            Job.job_type == job_type,
            Job.ppp_status == "APPROVED",
            Job.closeout_status == closeout_status
            
        )
        output = []
        
        # Process jobs
        for job in query:
            _output = {
                "job_id": job.id,
                "NAMA_SUMUR": job.well_name if job.well_name else "N/A",
            }
            output.append(_output)
            
        # print (output)
            
        # Return dengan format yang benar
        return {
            "jobs": output
        }
        
    except Exception as e:
        print(f"Error in get_exploration_proposed: {str(e)}")
        # Re-raise exception agar bisa ditangkap oleh route
        raise



def render_dor(db: Session, job_id: UUID, date: date):
    
    job = db.query(Job).filter(Job.id == job_id).first()
    dor = db.query(DailyOperationsReport).filter(DailyOperationsReport.job_id == job_id, DailyOperationsReport.report_date == date).first()

    if dor is None:
        raise HTTPException(status_code=404, detail="Daily Operations Report not found")

    with open("app/api/job/DOR-format.htm", "r") as file:
        html_template = file.read()
    
    dor_output = DailyOperationsReportCreate.model_validate(dor).model_dump()
    
    result = db.execute(
        select(
            func.sum(DailyOperationsReport.daily_cost).label("cost"),
            func.sum(DailyOperationsReport.daily_mud_cost).label("mud_cost"),
            func.sum(DailyOperationsReport.current_md).label("md"),
            func.count().label("report_count")
        ).where(DailyOperationsReport.report_date <= date)
    ).one_or_none()

    dict_1 = {'operator':job.kkks.name,
              'contractor': dor.contractor, #dummy
              'rpt': result.report_count, #dummy
              'wd':job.actual_job.well.water_depth, #dummy
              'wd_uom':job.actual_job.well.water_depth_uom,
              'rig_name': job.actual_job.rig.rig_name if job.actual_job.rig else None,
              'rig_type': job.actual_job.rig.rig_type if job.actual_job.rig else None,
              'rig_power': job.actual_job.rig.rig_horse_power if job.actual_job.rig else None,
              'current_md': dor_output.get("current_md", None),
              'progress_md': result.md,
              'ptmd':job.job_plan.well.final_md, #dummy
              'release_date': job.actual_job.well.rig_release_date,
              'afe_cost': job.job_plan.total_budget, #dummy
              'cum_cost': result.cost,
              'cum_mud_cost': result.mud_cost,
              'well_name':job.well_name,
              'job_type':job.job_type.value,
              'field':job.field.name,
              'latitude':float(job.job_plan.well.surface_latitude),
              'longitude':float(job.job_plan.well.surface_longitude),
              'environment':job.job_plan.well.environment_type,
              'spud_date':job.job_plan.well.spud_date if job.job_plan.well.spud_date is not None else job.job_plan.start_date,
              'kb_elev': float(job.job_plan.well.kb_elev),
              'afe_number':job.afe_number,
              'planned_days':(job.job_plan.end_date - job.job_plan.well.spud_date.date()).days if job.job_plan.well.spud_date is not None else (job.job_plan.end_date - job.job_plan.start_date).days,
              'days_from_spud':(dor_output['report_date'] - job.job_plan.well.spud_date.date()).days if job.job_plan.well.spud_date is not None else (dor_output['report_date'] - job.job_plan.well.start_date).days
              }
    
    #buat dor output di pumps kurang time sama pump_name ngga kubikin dummy karena dia jumlahnya ngikutin pumps
    merged_data = {**dor_output, **dict_1}

    for key, value in merged_data.items():
        merged_data[key] = process_value(value)
    
    merged_data = time_breakdown_elapsed(merged_data)

    template = Template(html_template)
    html_output = template.render(merged_data)

    
    return html_output
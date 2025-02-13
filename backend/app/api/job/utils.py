import pandas as pd
import json
from .schemas.dor import *
from .schemas.job import *
from .models import *
from datetime import timedelta
from app.api.well.utils import well_headers
from datetime import datetime, date, time
from enum import Enum

def to_date(value):
    return pd.to_datetime(value).date()

meta_headers = {
    "AREA_NAME": str,
    "FIELD_NAME": str,
    "CONTRACT_TYPE": str,
    "AFE_NUMBER": str,
    "WPB_YEAR": int,
    "START_DATE": to_date,
    "END_DATE": to_date,
    "TOTAL_BUDGET": float,
}

# well_headers = {
#     "Unit Type": str,
#     "UWI": str,
#     "Well Name": str,
#     "Alias Long Name": str,
#     "Well Type": str,
#     "Well Profile Type": str,
#     "Well Directional Type": str,
#     "Hydrocarbon Target": str,
#     "Environment Type": str,
#     "Surface Longitude": float,
#     "Surface Latitude": float,
#     "Bottom Hole Longitude": float,
#     "Bottom Hole Latitude": float,
#     "Maximum Inclination": float,
#     "Azimuth": float,
#     "Line Name": str,
#     "Rotary Table Elev": float,
#     "Kb Elev": float,
#     "Derrick Floor Elev": float,
#     "Ground Elev": float,
#     "Mean Sea Level": float,
#     "Depth Datum": str,
#     "Kick Off Point": float,
#     "Maximum TVD": float,
#     "Final MD": float,
#     "Remark": str,
# }

exploration_headers = {
    "RIG_NAME": str,
    "RIG_TYPE": str,
    "RIG_HORSE_POWER": float,
}

exploration_wrm_headers = {
    "WRM_PEMBEBASAN_LAHAN:START_DATE": to_date,
    "WRM_PEMBEBASAN_LAHAN:END_DATE": to_date,
    "WRM_IPPKH:START_DATE": to_date,
    "WRM_IPPKH:END_DATE": to_date,
    "WRM_UKL_UPL:START_DATE": to_date,
    "WRM_UKL_UPL:END_DATE": to_date,
    "WRM_AMDAL:START_DATE": to_date,
    "WRM_AMDAL:END_DATE": to_date,
    "WRM_PENGADAAN_RIG:START_DATE": to_date,
    "WRM_PENGADAAN_RIG:END_DATE": to_date,
    "WRM_PENGADAAN_DRILLING_SERVICES:START_DATE": to_date,
    "WRM_PENGADAAN_DRILLING_SERVICES:END_DATE": to_date,
    "WRM_PENGADAAN_LLI:START_DATE": to_date,
    "WRM_PENGADAAN_LLI:END_DATE": to_date,
    "WRM_PERSIAPAN_LOKASI:START_DATE": to_date,
    "WRM_PERSIAPAN_LOKASI:END_DATE": to_date,
    "WRM_INTERNAL_KKKS:START_DATE": to_date,
    "WRM_INTERNAL_KKKS:END_DATE": to_date,
    "WRM_EVALUASI_SUBSURFACE:START_DATE": to_date,
    "WRM_EVALUASI_SUBSURFACE:END_DATE": to_date,
}

# exploration_headers = {
#     "Area": str,
#     "Field": str,
#     "Contract Type": str,
#     "Afe Number": str,
#     "WP&B Year": int,
#     "Start Date": to_date,
#     "End Date": to_date,
#     "Total Budget": float,
#     "Rig Name": str,
#     "Rig Type": str,
#     "Rig Horse Power": float,
#     "Pembebasan Lahan": bool,
#     "IPPKH": bool,
#     "UKL UPL": bool,
#     "Amdal": bool,
#     "Pengadaan Rig": bool,
#     "Pengadaan Drilling Services": bool,
#     "Pengadaan LLI": bool,
#     "Persiapan Lokasi": bool,
#     "Internal KKKS": bool,
#     "Evaluasi Subsurface": bool
# }

development_headers = {
    "RIG_NAME": str,
    "RIG_TYPE": str,
    "RIG_HORSE_POWER": float,
}

development_wrm_headers = {
    **exploration_headers,
    "WRM_CUTTING_DUMPING:START_DATE": to_date,
    "WRM_CUTTING_DUMPING:END_DATE": to_date,
}

# development_headers = {
#     "Area": str,
#     "Field": str,
#     "Contract Type": str,
#     "Afe Number": str,
#     "WP&B Year": int,
#     "Start Date": to_date,
#     "End Date": to_date,
#     "Total Budget": float,
#     "Rig Name": str,
#     "Rig Type": str,
#     "Rig Horse Power": float,
#     "Pembebasan Lahan": bool,
#     "IPPKH": bool,
#     "UKL UPL": bool,
#     "Amdal": bool,
#     "Cutting Dumping":bool,
#     "Pengadaan Rig": bool,
#     "Pengadaan Drilling Services": bool,
#     "Pengadaan LLI": bool,
#     "Persiapan Lokasi": bool,
#     "Internal KKKS": bool,
#     "Evaluasi Subsurface": bool,
# }

wows_headers = {
    "EQUIPMENT": str,
    "EQUIPMENT_SPECIFICATIONS": str,
    "JOB_CATEGORY": str,
    "JOB_DESCRIPTION": str,
    "WELL_NAME": str,
    "ONSTREAM_OIL": float,
    "ONSTREAM_GAS": float,
    "ONSTREAM_WATER_CUT": float,
    "TARGET_OIL": float,
    "TARGET_GAS": float,
    "TARGET_WATER_CUT": float,
}

wows_wrm_headers = {
    "WRM_INTERNAL_KKKS:START_DATE": to_date,
    "WRM_INTERNAL_KKKS:END_DATE": to_date,
    "WRM_PERSIAPAN_LOKASI:START_DATE": to_date,
    "WRM_PERSIAPAN_LOKASI:END_DATE": to_date,
    "WRM_PENGADAAN_EQUIPMENT:START_DATE": to_date,
    "WRM_PENGADAAN_EQUIPMENT:END_DATE": to_date,
    "WRM_PENGADAAN_SERVICES:START_DATE": to_date,
    "WRM_PENGADAAN_SERVICES:END_DATE": to_date,
    "WRM_PENGADAAN_HANDAK:START_DATE": to_date,
    "WRM_PENGADAAN_HANDAK:END_DATE": to_date,
    "WRM_PENGADAAN_OCTG:START_DATE": to_date,
    "WRM_PENGADAAN_OCTG:END_DATE": to_date,
    "WRM_PENGADAAN_ARTIFICIAL_LIFT:START_DATE": to_date,
    "WRM_PENGADAAN_ARTIFICIAL_LIFT:END_DATE": to_date,
    "WRM_SUMUR_BERPRODUKSI:START_DATE": to_date,
    "WRM_SUMUR_BERPRODUKSI:END_DATE": to_date,
    "WRM_FASILITAS_PRODUKSI:START_DATE": to_date,
    "WRM_FASILITAS_PRODUKSI:END_DATE": to_date,
    "WRM_PERSIAPAN_LOKASI:START_DATE": to_date,
    "WRM_PERSIAPAN_LOKASI:END_DATE": to_date,
    "WRM_WELL_INTEGRITY:START_DATE": to_date,
    "WRM_WELL_INTEGRITY:END_DATE": to_date,
}

# wows_headers = {
#     "Start Date": to_date,
#     "End Date": to_date,
#     "Total Budget": float,
#     "Equipment": str,
#     "Equipment Specifications": str,
#     "Job Category": str,
#     "Job Description": str,
#     "Well Name": str,
#     "Onstream Oil": float,
#     "Onstream Gas": float,
#     "Onstream Water Cut": float,
#     "Target Oil": float,
#     "Target Gas": float,
#     "Target Water Cut": float,
# }

plan_label_key_mapping = {
    "Area": "area_name",
    "Field": "field_name",
    "Contract Type": "contract_type",
    "Afe Number": "afe_number",
    "WP&B Year": "wpb_year",
    "Start Date": "start_date",
    "End Date": "end_date",
    "Total Budget": "total_budget",
    "Job Category": "job_category",
    "Job Description": "job_description",
    "Rig Name": "rig_name",
    "Rig Type": "rig_type",
    "Rig Horse Power": "rig_horse_power",
    "Equipment": "equipment",
    "Equipment Specifications": "equipment_specifications",
    "Well Name": "well_name",
    "Onstream Oil": "onstream_oil",
    "Onstream Gas": "onstream_gas",
    "Onstream Water Cut": "onstream_water_cut",
    "Target Oil": "target_oil",
    "Target Gas": "target_gas",
    "Target Water Cut": "target_water_cut",
    "Unit Type": "unit_type",
    "UWI": "uwi",
    "Well Name": "well_name",
    "Alias Long Name": "alias_long_name",
    "Well Type": "well_type",
    "Well Profile Type": "well_profile_type",
    "Well Directional Type": "well_directional_type",
    "Hydrocarbon Target": "hydrocarbon_target",
    "Environment Type": "environment_type",
    "Surface Longitude": "surface_longitude",
    "Surface Latitude": "surface_latitude",
    "Bottom Hole Longitude": "bottom_hole_longitude",
    "Bottom Hole Latitude": "bottom_hole_latitude",
    "Maximum Inclination": "maximum_inclination",
    "Azimuth": "azimuth",
    "Line Name": "line_name",
    "Spud Date": "spud_date",
    "Final Drill Date": "final_drill_date",
    "Completion Date": "completion_date",
    "Rotary Table Elev": "rotary_table_elev",
    "Kb Elev": "kb_elev",
    "Derrick Floor Elev": "derrick_floor_elev",
    "Ground Elev": "ground_elev",
    "Mean Sea Level": "mean_sea_level",
    "Depth Datum": "depth_datum",
    "Kick Off Point": "kick_off_point",
    "Maximum TVD": "maximum_tvd",
    "Final MD": "final_md",
    "Remark": "remark",
    "Pembebasan Lahan": "wrm_pembebasan_lahan",
    "IPPKH": "wrm_ippkh",
    "UKL UPL": "wrm_ukl_upl",
    "Amdal": "wrm_amdal",
    "Pengadaan Rig": "wrm_pengadaan_rig",
    "Pengadaan Drilling Services": "wrm_pengadaan_drilling_services",
    "Pengadaan LLI": "wrm_pengadaan_lli",
    "Persiapan Lokasi": "wrm_persiapan_lokasi",
    "Internal KKKS": "wrm_internal_kkks",
    "Evaluasi Subsurface": "wrm_evaluasi_subsurface",
    "Cutting Dumping": "wrm_cutting_dumping",
    "Pengadaan Equipment": "wrm_pengadaan_equipment",
    "Pengadaan Services": "wrm_pengadaan_services",
    "Pengadaan Handak": "wrm_pengadaan_handak",
    "Pengadaan Octg": "wrm_pengadaan_octg",
    "Pengadaan Artificial Lift": "wrm_pengadaan_artificial_lift",
    "Sumur Berproduksi": "wrm_sumur_berproduksi",
    "Fasilitas Produksi": "wrm_fasilitas_produksi",
    "Persiapan Lokasi": "wrm_persiapan_lokasi",
    "Well Integrity": "wrm_well_integrity",
}

plan_key_label_mapping = {v: k for k, v in plan_label_key_mapping.items()}

job_schema_map = {
    JobType.EXPLORATION:{
        'upload_headers':{
            'plan':{
                **meta_headers,
                **well_headers,
                **exploration_headers
            },
            'wrm': exploration_wrm_headers
        },
        'job':CreateExplorationJob,
        'get-job-plan': GetExplorationJob,
        'schema':{
            'plan': CreatePlanExploration,
            'actual': CreateActualExploration,
            'get-update': GetUpdateActualExplorationJob,
            'update': UpdateActualExploration,
        },
        'model':{
            'plan': PlanExploration,
            'actual': ActualExploration
        },
        'wrm': ExplorationWRM,
        'validation': ValidateActualExploration
    },
    JobType.DEVELOPMENT:{
        'upload_headers':{
            'plan':{
                **meta_headers,
                **well_headers,
                **development_headers
            },
            "wrm": development_wrm_headers
        },
        'job':CreateDevelopmentJob,
        'get-job-plan': GetDevelopmentJob,
        'schema':{
            'plan': CreatePlanDevelopment,
            'actual': CreateActualDevelopment,
            'get-update': GetUpdateActualDevelopmentJob,
            'update': UpdateActualDevelopment
        },
        'model':{
            'plan': PlanDevelopment,
            'actual': ActualDevelopment
        },
        'wrm': DevelopmentWRM,
        'validation': ValidateActualDevelopment
    },
    JobType.WORKOVER:{  
        'upload_headers':{
            'plan':{
                **meta_headers,
                **wows_headers
            },
            "wrm": wows_wrm_headers
        },
        'job':CreateWorkoverJob,
        'get-job-plan': CreateWorkoverJob,
        'schema':{
            'plan': CreatePlanWorkover,
            'actual': CreateActualWorkover,
            'get-update': GetUpdateActualWorkoverJob,
            'update': UpdateActualWorkover
        },
        'model':{
            'plan': PlanWorkover,
            'actual': ActualWorkover,
            'update': UpdateActualWorkover
        },
        'wrm': WorkoverWRM,
        'validation': ValidateActualWorkover
    },
    JobType.WELLSERVICE:{  
        'upload_headers':{
            'plan':{
                **meta_headers,
                **wows_headers
            },
            "wrm": wows_wrm_headers
        },
        'job':CreateWellServiceJob,
        'get-job-plan': CreateWellServiceJob,
        'schema':{
            'plan': CreatePlanWellService,
            'actual': CreateActualWellService,
            'get-update': GetUpdateActualWellServiceJob,
            'update': UpdateActualWellService
        },
        'model':{
            'plan': PlanWellService,
            'actual': ActualWellService
        },
        'wrm': WellServiceWRM,
        'validation': ValidateActualWellService
    }
}

wrm_name_map = {
    'wrm_pembebasan_lahan': 'Pembebasan Lahan',
    'wrm_ippkh': 'IPPKH',
    'wrm_ukl_upl': 'UKL UPL',
    'wrm_amdal': 'Amdal',
    'wrm_pengadaan_rig': 'Pengadaan Rig',
    'wrm_pengadaan_drilling_services': 'Pengadaan Drilling Services',
    'wrm_pengadaan_lli': 'Pengadaan LLI',
    'wrm_persiapan_lokasi': 'Persiapan Lokasi',
    'wrm_internal_kkks': 'Internal KKKS',
    'wrm_evaluasi_subsurface': 'Evaluasi Subsurface',
    'wrm_cutting_dumping': 'Cutting Dumping',
    'wrm_pengadaan_equipment': 'Pengadaan Equipment',
    'wrm_pengadaan_services': 'Pengadaan Services',
    'wrm_pengadaan_handak': 'Pengadaan Handak',
    'wrm_pengadaan_octg': 'Pengadaan Octg',
    'wrm_pengadaan_artificial_lift': 'Pengadaan Artificial Lift',
    'wrm_sumur_berproduksi': 'Sumur Berproduksi',
    'wrm_fasilitas_produksi': 'Fasilitas Produksi',
    'wrm_persiapan_lokasi': 'Persiapan Lokasi',
    'wrm_well_integrity': 'Well Integrity',
}

def check_fields(value, key=None, skipkey=[]):
    validations = []
    if isinstance(value, dict):
        for key, value in value.items():
            _validations = check_fields(value, key, skipkey)
            validations += _validations
    if isinstance(value, BaseModel):
        schema_fields = value.model_dump()
        for key, value in schema_fields.items():
            _validations = check_fields(value, key, skipkey)
            validations += _validations
    elif (value is None or value == "" or value == []) and (key not in skipkey):
        validations.append(
            f"{plan_key_label_mapping.get(key, key)}"
        )
    return validations

def daterange(date1, date2):
    for n in range(int((date2 - date1).days) + 1):
        yield date1 + timedelta(n)

def create_plan_gantt_chart(
    job: Job,
):
    if job.job_plan.work_breakdown_structure:
        return {
            'plot': {
                "type":"svg",
                "path":f"/visualize/wbs/plan/{job.id}"
            }
        }
    else:
        return None

def create_actual_gantt_chart(
    job: Job,
):
    if job.actual_job.work_breakdown_structure:
        return {
            'plot': {
                "type":"svg",
                "path":f"/visualize/wbs/actual/{job.id}"
            }
        }
    else:
        return None

def create_plan_time_depth_curve(
    job: Job,
):
    
    job_operation_days = job.job_plan.job_operation_days
    
    if job_operation_days:
        
        df = pd.DataFrame(
            dict(
                Event=[od.phase for od in job_operation_days],
                Days=[od.operation_days for od in job_operation_days],
                Start=[od.depth_in for od in job_operation_days],
                End=[od.depth_out for od in job_operation_days],
                Cost=[(job.job_plan.total_budget / len(job_operation_days)) for _ in job_operation_days]
            )
        )
        
        return {
            'table': df.to_dict(orient='records'),
            'plot': {
                "type":"plotly",
                "path":f"/visualize/tdc/plan/{job.id}"
            }
        }
    else:
        return None
    
def create_actual_time_depth_curve(
    job: Job,
):
    
    plan_job_operation_days = job.job_plan.job_operation_days
    actual_job_operation_days = job.actual_job.job_operation_days
    
    if plan_job_operation_days and actual_job_operation_days:
    
        plan_df = pd.DataFrame(
            dict(
                Event=[od.phase for od in plan_job_operation_days],
                Days=[od.operation_days for od in plan_job_operation_days],
                Start=[od.depth_in for od in plan_job_operation_days],
                End=[od.depth_out for od in plan_job_operation_days],
                Cost=[(job.job_plan.total_budget / len(plan_job_operation_days)) for _ in plan_job_operation_days]
            )
        )
        
        
        
        actual_df = pd.DataFrame(
            dict(
                Event=[od.phase for od in actual_job_operation_days],
                Days=[od.operation_days for od in actual_job_operation_days],
                Start=[od.depth_in for od in actual_job_operation_days],
                End=[od.depth_out for od in actual_job_operation_days],
                Cost=[(job.job_plan.total_budget / len(actual_job_operation_days)) for _ in actual_job_operation_days]
            )
        )
        
        return {
            'table': {
                'plan': json.loads(plan_df.to_json(orient='records')),
                'actual': json.loads(actual_df.to_json(orient='records'))
            },
            'plot': {
                "type":"plotly",
                "path":f"/visualize/tdc/actual/{job.id}"
            }
        }
    
    else:
        return None

def create_plan_trajectory(
    job: Job,
):
    well_trajectory = job.job_plan.well.well_trajectory
    if well_trajectory:
        return {
            'metadata': WellTrajectoryBase.model_validate(well_trajectory).model_dump(by_alias=True),
            'file': {
                'file_id' : well_trajectory.file.id,
                'filename' : well_trajectory.filename,
                'file_download_path' : f"/utils/download/file/{well_trajectory.file.id}"
            },
            'path': f"/visualize/trajectory/plan/{job.id}"
        }
    else:
        return None

def create_actual_trajectory(
    job: Job,
):
    plan_well_trajectory = job.job_plan.well.well_trajectory
    actual_well_trajectory = job.actual_job.well.well_trajectory
    return {
        'file': {
            'plan':  {
                'metadata': WellTrajectoryBase.model_validate(plan_well_trajectory).model_dump(by_alias=True),
                'file_id' : job.job_plan.well.well_trajectory.file.id,
                'filename' : job.job_plan.well.well_trajectory.filename,
                'file_download_path' : f"/utils/download/file/{job.job_plan.well.well_trajectory.file.id}"
            } if plan_well_trajectory else None,
            'actual': {
                'metadata': WellTrajectoryBase.model_validate(actual_well_trajectory).model_dump(by_alias=True),
                'file_id' : job.actual_job.well.well_trajectory.file.id,
                'filename' : job.actual_job.well.well_trajectory.filename,
                'file_download_path' : f"/utils/download/file/{job.actual_job.well.well_trajectory.file.id}"
            } if actual_well_trajectory else None
        },
        'path': f"/visualize/trajectory/actual/{job.id}"
    }

def create_plan_casing(
    job: Job,
):
    db_well = job.job_plan.well
    
    if db_well.well_casings:
    
        table = [WellCasingBase.model_validate(casing).model_dump(by_alias=True) for casing in db_well.well_casings]
        
        return {
            'table': table,
            'plot': {
                "type":"bar",
                "path":f"/visualize/casing/plan/{job.id}"
            }
        }
    else:
        return None

def create_actual_casing(
    job: Job,
):
    db_plan_well = job.job_plan.well
    db_actual_well = job.actual_job.well
    
    if db_plan_well.well_casings:
        plan_table = [WellCasingBase.model_validate(casing).model_dump(by_alias=True) for casing in db_plan_well.well_casings]
    else:
        plan_table = None
    if db_actual_well.well_casings:
        actual_table = [WellCasingBase.model_validate(casing).model_dump(by_alias=True) for casing in db_actual_well.well_casings]
    else:
        actual_table = None
    
    return {
        'table': {
            'plan': plan_table,
            'actual': actual_table
        },
        'plot': {
            'plan': {
                "type":"image",
                "path":f"/visualize/casing/plan/{job.id}"
            } if plan_table else None,
            'actual': {
                "type":"image",
                "path":f"/visualize/casing/actual/{job.id}"
            }
        }
    } if actual_table else None

def create_job_hazard_table(job_instance: JobInstance):
    
    hazards = job_instance.job_hazards
    
    if hazards:
    
        df = pd.DataFrame(
            {
                "Hazard Type": [hazard.hazard_type for hazard in hazards],
                "Description": [hazard.hazard_description for hazard in hazards],
                "Severity": [hazard.severity for hazard in hazards],
                "Mitigation": [hazard.mitigation for hazard in hazards],
                "Remark": [hazard.remark for hazard in hazards],
            }
        )
        
        return df.to_dict(orient='records')

    else:
        
        return None

def create_job_documents_table(job_instance: JobInstance):
    
    documents = job_instance.job_documents
    
    if documents:
        df = pd.DataFrame(
            [
                {
                    "Filename": document.filename,
                    "Document Type": document.document_type ,
                    "Remark": document.remark,
                    "Download": f"/utils/download/file/{document.file.id}",
                } for document in documents
            ] 
        ) 
        
        return df.to_dict(orient='records')
    else:
        return None

def create_well_documents_table(well: Union[ActualWell, ExistingWell]):
    documents = well.well_documents
    
    if documents:
        df = pd.DataFrame(
            [
                {
                    "Filename": document.filename,
                    "Document Type": document.document_type ,
                    "Remark": document.remark,
                    "Download": f"/utils/download/file/{document.file.id}",
                } for document in documents
            ] 
        ) 
        
        return df.to_dict(orient='records')
    else:
        return None

def create_well_stratigraphy_table(well: WellInstance):
    
    well_stratigraphy = well.well_stratigraphy
    
    if well_stratigraphy:
    
        df = pd.DataFrame(
            {
                "Top Depth": [ well_section.top_depth for well_section in well_stratigraphy],
                "Bottom Depth": [ well_section.bottom_depth for well_section in well_stratigraphy],
                "Depth UOM": [ well_section.depth_uom for well_section in well_stratigraphy],
                "Formation Name": [ well_section.formation_name for well_section in well_stratigraphy],
                "Lithology": [ well_section.lithology for well_section in well_stratigraphy],
            }
        )
        
        return df.to_dict(orient='records')
    else:
        return None

def create_data_table(tabular_data):
    
    if tabular_data:
    
        file = tabular_data.file
        
        data = tabular_data.data
        
        return {
            'file': {
                'file_id' : file.id,
                'filename' : file.filename,
                'file_download_path' : f"/utils/download/file/{file.id}"
            },
            "data": data
        }
    else:
        return None

def create_plan_ppfg(job: Job):
    return {
        'file': {
            'file_id' : job.job_plan.well.well_ppfg.file_id,
            'filename' : job.job_plan.well.well_ppfg.filename,
            'file_download_path' : f"/utils/download/file/{job.job_plan.well.well_ppfg.file_id}"
        },
        'path': f"/visualize/pore-pressure/plan/{job.id}"
    } if job.job_plan.well.well_ppfg else None

def create_actual_ppfg(job: Job):
    return {
        'file': {
            'plan':  {
                'file_id' : job.job_plan.well.well_ppfg.file_id,
                'filename' : job.job_plan.well.well_ppfg.filename,
                'file_download_path' : f"/utils/download/file/{job.job_plan.well.well_ppfg.file_id}"
            },
            'actual': {
                'file_id' : job.actual_job.well.well_ppfg.file_id,
                'filename' : job.actual_job.well.well_ppfg.filename,
                'file_download_path' : f"/utils/download/file/{job.actual_job.well.well_ppfg.file_id}"
            }
        },
        'path': f"/visualize/pore-pressure/actual/{job.id}"
    } if job.actual_job.well.well_ppfg else None

def create_logs(well: WellInstance):
    return [
        {
            'metadata': WellLogBase.model_validate(well_log).model_dump(by_alias=True),
            **({
                'file': {
                    'file_id' : well_log.file_id,
                    'file_name' : well_log.filename,
                    'file_download_path' : f"/utils/download/file/{well_log.file_id}"
                },
                'path': f"/visualize/log/{well_log.file_id}"
            } if well_log.file else {})
        } for well_log in well.well_logs
    ] if well.well_logs else None

def create_well_drilling_parameter(well: WellInstance):
    return {
        'file': {
            'file_id' :well.well_drilling_parameter.file_id,
            'filename' : well.well_drilling_parameter.filename,
            'file_download_path' : f"/utils/download/file/{well.well_drilling_parameter.file_id}"
        },
        'path': f"/visualize/log/{well.well_drilling_parameter.file_id}"
    } if well.well_drilling_parameter else None

def create_well_cores_table(well: WellInstance):
    return [
        {
            **({'image_path': f"/utils/view-image/file/{well_core.image_file_id}"} if well_core.image_file else {}),
            **WellCoreBase.model_validate(well_core).model_dump(by_alias=True),
        } for well_core in well.well_cores
    ] if well.well_cores else None

def create_plan_seismic_section(job: Job):
    try:
        return {
            "metadata": SeismicLineBase.model_validate(job.job_plan.well.seismic_line).model_dump(by_alias=True),
            'file': {
                'file_id': job.job_plan.well.seismic_line.file_id,
                'file_name': job.job_plan.well.seismic_line.filename,
                'file_download_path': f"/utils/download/file/{job.job_plan.well.seismic_line.file_id}",
            },
            "path": f"/visualize/seismic/plan/{job.id}"
        } if job.job_plan.well.seismic_line else None
    except:
        return None

def create_actual_seismic_section(job: Job):
    try:
        return {
            "metadata": SeismicLineBase.model_validate(job.actual_job.well.seismic_line).model_dump(by_alias=True),
            'file': {
                'file_id': job.actual_job.well.seismic_line.file_id,
                'file_name': job.actual_job.well.seismic_line.filename,
                'file_download_path': f"/utils/download/file/{job.actual_job.well.seismic_line.file_id}",
            },
            "path": f"/visualize/seismic/actual/{job.id}"
        } if job.actual_job.well.seismic_line else None
    except:
        return None
    
def create_plan_schematic(job: Job):
    return {
        'file': {
            'file_id': job.job_plan.well.well_schematic.file_id,
            'file_name': job.job_plan.well.well_schematic.filename,
            'file_download_path': f"/utils/download/file/{job.job_plan.well.well_schematic.file_id}",
        },
        "path": f"/visualize/schematic/plan/{job.id}"
    } if job.job_plan.well.well_schematic else None

def create_actual_schematic(job: Job):
    return {
        'file': {
            'plan': {
                'file_id': job.job_plan.well.well_schematic.file_id,
                'file_name': job.job_plan.well.well_schematic.filename,
                'file_download_path': f"/utils/download/file/{job.job_plan.well.well_schematic.file_id}",
            },
            'actual': {
                'file_id': job.actual_job.well.well_schematic.file_id,
                'file_name': job.actual_job.well.well_schematic.filename,
                'file_download_path': f"/utils/download/file/{job.actual_job.well.well_schematic.file_id}",
            }
        },
        "path": {
            'plan' : f"/visualize/schematic/plan/{job.id}",
            'actual' : f"/visualize/schematic/actual/{job.id}"
        }
    } if job.actual_job.well.well_schematic else None

def create_wows_plan_schematic(job: Job):
    return {
        'file': {
            'file_id': job.job_plan.well_schematic.file_id,
            'file_name': job.job_plan.well_schematic.filename,
            'file_download_path': f"/utils/download/file/{job.job_plan.well_schematic.file_id}",
        },
        "path": f"/utils/view-image/file/{job.job_plan.well_schematic.file_id}"
    } if job.job_plan.well_schematic else None

def create_wows_actual_schematic(job: Job):
    return {
        'file': {
            'plan': {
                'file_id': job.job_plan.well.well_schematic.file_id,
                'file_name': job.job_plan.well.well_schematic.filename,
                'file_download_path': f"/utils/download/file/{job.job_plan.well.well_schematic.file_id}",
            },
            'actual': {
                'file_id': job.actual_job.well.well_schematic.file_id,
                'file_name': job.actual_job.well.well_schematic.filename,
                'file_download_path': f"/utils/download/file/{job.actual_job.well.well_schematic.file_id}",
            }
        },
        "path": {
            'plan' : f"/utils/view-image/file/{job.job_plan.well.well_schematic.file_id}",
            'actual' : f"/utils/view-image/file/{job.actual_job.well.well_schematic.file_id}"
        }
    } if job.actual_job.well.well_schematic else None

def process_value(value):
    if isinstance(value, Enum):
        return value.value
    elif isinstance(value, datetime):
        return value.date()
    elif isinstance(value, time):
        return time(value.hour, value.minute)
    elif isinstance(value, list):
        return [process_value(item) for item in value]
    elif isinstance(value, dict):
        return {key: process_value(val) for key, val in value.items()}
    else:
        return value

def time_breakdown_elapsed(data):
    if 'time_breakdowns' in data.keys() and data['time_breakdowns'] != None:
        for dict_ in data['time_breakdowns']:

            datetime1 = datetime.combine(date.min, dict_['start_time'])
            datetime2 = datetime.combine(date.min, dict_['end_time'])

            # Calculate the difference
            time_difference = datetime2 - datetime1

            # Convert the difference to total seconds
            total_seconds = time_difference.total_seconds()


            hours = int(total_seconds // 3600)
            minutes = int((total_seconds % 3600) // 60)

            # Create a time object for the difference
            time_difference_obj = time(hours, minutes)

            dict_['elapsed'] = time_difference_obj.strftime("%H:%M")
            dict_['start_time'] = dict_['start_time'].strftime("%H:%M")
            dict_['end_time'] = dict_['end_time'].strftime("%H:%M")
    
    return data
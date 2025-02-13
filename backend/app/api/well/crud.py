from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.well.models import *
from app.api.well.schemas import *
from app.api.job.models import *
from app.api.job.schemas import *
from app.api.utils.models import *
from app.api.utils.schemas import *
from app.api.well.utils import *
from app.api.spatial.models import *
from app.core.error_handlers import AreaDoesntExist, FieldDoesntExist
import pandas as pd
from fastapi import Response
import io
from pydantic import ValidationError
from sqlalchemy import case
import utm
from datetime import datetime

from app.core.schema_operations import parse_schema
from app.core.database_functions import update_object

def create_existing_well(db: Session, well: CreateExistingWell, user):
    
    uwi = str(uuid.uuid4())
    unit_type = well.unit_type

    db_well = ExistingWell(
        uwi=uwi,
        **parse_schema(well, variables={"uwi": uwi, "unit_type": unit_type})
    )
    # print(db_well.id)
    # print('bruh')
    # recursive_add(db, db_well)
    
    db.recursive_add(db_well)
    db_well.kkks_id = user.kkks_id
    db.commit()
    db.refresh(db_well)
    
    # db_well.well_trajectory = WellTrajectory(
    #     uwi = db_well.id,
    #     unit_type = well.unit_type,
    #     survey_start_date = schema.well_trajectory.survey_start_date,
    #     survey_end_date = schema.well_trajectory.survey_end_date,
    #     top_depth = schema.well_trajectory.top_depth,
    #     base_depth = schema.well_trajectory.base_depth,
    #     survey_type = schema.well_trajectory.survey_type,
    #     physical_item_id = schema.well_trajectory.physical_item_id
    # )
    
    # db_well.well_log = WellLog(
    #     uwi = db_well.id,
    #     unit_type = well.unit_type,
    #     top_depth = schema.well_log.top_depth,
    #     base_depth = schema.well_log.base_depth,
    #     logs = schema.well_log.logs,
    #     physical_item_id = schema.well_log.physical_item_id
    # )
    
    # db_well.well_cores = [
    #     WellCore(
    #         uwi = db_well.id,
    #         unit_type = well.unit_type,
    #         top_depth = core.top_depth,
    #         base_depth = core.base_depth,
    #         core_diameter = core.core_diameter,
    #         core_type = core.core_type,
    #         core_show_type = core.core_show_type,
    #         remark = core.remark,
    #         physical_item_id = core.physical_item_id
    #     )
    #     for core in schema.well_cores
    # ]
    
    # db_well.well_tests = [
    #     WellTest(
    #         **test.model_dump()
    #     )
    #     for test in schema.well_tests
    # ]
    
    # db_well.seismic_line = SeismicLine(
    #     uwi = db_well.id,
    #     **schema.seismic_line.model_dump()
    # )
    
    # db_well.well_casings = [
    #     PPDMWellTubular(
    #         tubing_obs_no = i,
    #         uwi = db_well.id,
    #         **casing.model_dump()
    #     )
    #     for i, casing in enumerate(schema.well_casings)
    # ]
    
    # db_well.well_completion = [
    #     WellCompletion(
    #         **completion.model_dump()
    #     )
    #     for completion in schema.well_completion
    # ]
    
    # db_well.well_pressure = [
    #     WellPressure(
    #         **pressure.model_dump()
    #     )
    #     for pressure in schema.well_pressure
    # ]
    
    # db_well.well_equipments = [
    #     PPDMWellEquipment(
    #         equip_obs_no=i,
    #         **equipment.model_dump()
    #     ) for i, equipment in enumerate(schema.well_equipments)
    # ]

    db.commit()
    
    return db_well.id

def get_existing_wells_list_by_kkks_id(
    db: Session,
    kkks_id: str,
):
    result = db.query(ExistingWell.id.label('value'), ExistingWell.well_name.label('name'), ).filter(ExistingWell.kkks_id == kkks_id).all()
    return result

def get_existing_wells_by_kkks_id(
    db: Session,
    kkks_id: str,
):
    # Query for total count first
    total_count = db.query(func.count(ExistingWell.id)).filter(ExistingWell.kkks_id == kkks_id).scalar()

    # Query for paginated results
    get_wells = (
        db.query(ExistingWell)
        .filter(ExistingWell.kkks_id == kkks_id)
        .all()
    )

    wells_with_relations = [
        {
            "well_id": well.id,
            "well_name": well.well_name,
            "kkks_id": well.kkks_id,
            "area": well.area.name if well.area else None,
            "field": well.field.name if well.field else None,
            "well_status": well.well_status
        }
        for well in get_wells
    ]

    return wells_with_relations

def get_existing_wells(
    db: Session,
):
    # Query for total count first
    total_count = db.query(func.count(ExistingWell.id)).scalar()

    # Query for paginated results
    get_wells = (
        db.query(ExistingWell)
        .all()
    )

    wells_with_relations = [
        {
            "well_id": well.id,
            "well_name": well.well_name,
            "kkks_id": well.kkks_id,
            "area": well.area.name if well.area else None,
            "field": well.field.name if well.field else None,
            "well_status": well.well_status
        }
        for well in get_wells
    ]


    return wells_with_relations

def get_existing_wells_summary_by_kkks_id(db: Session, kkks_id: str):

    query = db.query(
        func.count(ExistingWell.id).label('total'),
        func.sum(case(
            (ExistingWell.well_status == "ACTIVE", 1),
            else_=0
        )).label('aktif'),
        func.sum(case(
            (ExistingWell.well_status.in_(["ABANDONED", "SUSPENDED", "TPA", "PA"]), 1),
            else_=0
        )).label('tidak_aktif'),
    )
    
    result = query.filter(ExistingWell.kkks_id == kkks_id).first()
    
    return {
        'total': result.total,
        'aktif': result.aktif,
        'tidak_aktif': result.tidak_aktif,
    }

def get_existing_wells_summary(db: Session):

    query = db.query(
        func.count(ExistingWell.id).label('total'),
        func.sum(case(
            (ExistingWell.well_status == "ACTIVE", 1),
            else_=0
        )).label('aktif'),
        func.sum(case(
            (ExistingWell.well_status.in_(["ABANDONED", "SUSPENDED", "TPA", "PA"]), 1),
            else_=0
        )).label('tidak_aktif'),
    )
    
    result = query.first()
    
    return {
        'total': result.total,
        'aktif': result.aktif,
        'tidak_aktif': result.tidak_aktif,
    }

def delete_existing_well(db:Session, id: str):
    
    if db.query(ExistingWell).filter(ExistingWell.id==id).first() is None:
        raise HTTPException(status_code=404, detail="Well not found")
    
    get_well=db.query(ExistingWell).filter(ExistingWell.id==id).first()
    
    for plan_workover in get_well.plan_workover:
        plan_workover.well_id = None
    for plan_well_service in get_well.plan_well_service:
        plan_well_service.well_id = None
    for actual_workover in get_well.actual_workover:
        actual_workover.well_id = None
    for actual_well_service in get_well.actual_well_service:
        actual_well_service.well_id = None
    for children in get_well.children:
        children.parent_well_id = None
    
    db.delete(get_well) 
    db.commit()

def edit_well(db:Session, id: str, existing: UpdateExistingWell, user):
    old_well = db.query(ExistingWell).filter(ExistingWell.id==id).first()
    if old_well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    new_well = ExistingWell(**parse_schema(existing))
    new_well.id = old_well.id
    new_well.created_by_id = old_well.created_by_id
    new_well.kkks_id = user.kkks_id
    new_well.last_edited_by_id = user.id
    update_object(old_well, new_well)
    db.commit()

def get_existing_well(db: Session, id: str):
    
    well = db.query(ExistingWell).filter(ExistingWell.id == id).first()
    
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    
    return CreateExistingWell.model_validate(well).model_dump()

def upload_batch_well(db: Session, content: bytes, user):

    error_list = []
    validated_data = []
    
    dtype_map = {
        **existing_well_headers
    }

    try:
        df = pd.read_excel(io.BytesIO(content))
        df = df.iloc[1:]
        
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

        df.columns = df.columns.str.lower()
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
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
                        
            row['field_id'] = db.query(Field).filter(Field.area_id == row['area_id'], Field.name == row['field_name']).first().id
            
        except AreaDoesntExist:
            error_list.append(f'Row {index + 2} in Area: Area does not exist in the database')
            
        except FieldDoesntExist:
            error_list.append(f'Row {index + 2} in Field: Field does not exist in the database')
            
        try:

            db_well = ExistingWell(**parse_schema(CreateExistingWell(**row.to_dict())))
            db_well.kkks_id = user.kkks_id

            db_well.created_by_id = user.id
            db_well.time_created = datetime.now()
            
            validated_data.append(db_well)
            
        except ValidationError as e:
            
            for error in e.errors():
                
                error_list.append(f'Row {index + 2} in {error["loc"][-1].upper()}: {error["msg"]}. Your input was {error['input']}')
            
    if error_list:
        raise HTTPException(status_code=400, detail={"errors": error_list})
    
    db.add_all(validated_data)
    db.commit()

def export_to_ppdm(db: Session):
    
    wells = db.query(ExistingWell).all()
    
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
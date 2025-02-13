from sqlalchemy.orm import Session

from app.api.spatial.models import *
from app.api.spatial.schemas import *
from app.api.auth.schemas import GetUser
from app.api.auth.models import *
from app.api.job.models import *
import geopandas as gpd
from shapely.geometry import Point
from fastapi import HTTPException
import json
from app.api.well.models import WellInstance
import pandas as pd

from app.api.visualize.lib.well_profile import well

def create_area(db: Session, wk: CreateAreaSchema, user):
    
    db_area = Area(
        **wk.model_dump(), kkks_id = user.kkks_id
    )
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area

def create_field(db: Session, field: CreateFieldSchema):
    
    db_field = Field(
        **field.model_dump()
    )
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field

def get_areas(db: Session):
    return db.query(Area.id.label('value'), Area.name.label('name')).all()

def get_fields(db: Session, area_id: str):
    area = db.query(Area).filter(Area.id == area_id).first()
    
    return [{
        'name': field.name,
        'value': field.id
    } for field in area.fields ]

def create_geojson_view_kkks(db: Session, kkks_id: str):
    
    kkks = db.query(KKKS).filter(KKKS.id == kkks_id).first()
    
    if kkks is None:
        raise HTTPException(status_code=404, detail="KKKS not found")
    
    area = kkks.area
    fields = area.fields
    
    area_geojson = json.loads(area.geojson)
    
    all_gdf = gpd.GeoDataFrame.from_features(area_geojson['features'])
    
    for field in fields:
        field_geojson = json.loads(field.geojson)
        field_gdf = gpd.GeoDataFrame.from_features(field_geojson['features'])
        all_gdf = all_gdf._append(field_gdf, ignore_index=True)
    
    jobs = kkks.jobs
    
    for job in jobs:
        
        if job.actual_job is not None:
            
            well_longitude = job.actual_job.well.surface_longitude
            well_latitude = job.actual_job.well.surface_latitude
        
        else:
            
            well_longitude = job.job_plan.well.surface_longitude
            well_latitude = job.job_plan.well.surface_latitude
        
        if well_longitude is not None and well_latitude is not None:
            well_loc = Point(well_longitude, well_latitude)

            new_point_gdf = gpd.GeoDataFrame([{
                'geometry': well_loc,
            }])

            all_gdf = all_gdf._append(new_point_gdf, ignore_index=True)
    
    bounds = all_gdf.total_bounds
    x = (bounds[0] + bounds[2]) / 2
    y = (bounds[1] + bounds[3]) / 2

    return {
        'geojson':all_gdf.to_geo_dict(),
        'center': {'x': x, 'y': y}
    }

def create_seperated_geojson_view_kkks(db: Session, kkks_id: str):
    
    kkks = db.query(KKKS).filter(KKKS.id == kkks_id).first()
    
    if kkks is None:
        raise HTTPException(status_code=404, detail="KKKS not found")
    
    area = kkks.area
    fields = area.fields
    
    area_geojson = json.loads(area.geojson)

    fields_gdf = []
    
    for field in fields:
        field_geojson = json.loads(field.geojson)
        field_gdf = gpd.GeoDataFrame.from_features(field_geojson['features'])
        fields_gdf.append(field_gdf)
    
    if not fields_gdf == []:
        fields_gdf = pd.concat(fields_gdf, ignore_index=True)
        fields_geojson = fields_gdf.to_geo_dict()
    else:
        fields_geojson = None
    
    jobs = kkks.jobs
    
    jobs_gdf = []
    
    for job in jobs:
        
        if job.actual_job is not None:
            
            well_longitude = job.actual_job.well.surface_longitude
            well_latitude = job.actual_job.well.surface_latitude
        
        else:
            
            well_longitude = job.job_plan.well.surface_longitude
            well_latitude = job.job_plan.well.surface_latitude
        
        if well_longitude is not None and well_latitude is not None:
            well_loc = Point(well_longitude, well_latitude)

            new_point_gdf = gpd.GeoDataFrame([{
                'geometry': well_loc,
            }])

            jobs_gdf.append(new_point_gdf)
    
    if jobs_gdf:
        jobs_gdf = pd.concat(jobs_gdf, ignore_index=True)
        jobs_geojson = jobs_gdf.to_geo_dict()
    else:
        jobs_geojson = None
        
    return {
        'area': area_geojson,
        'fields': fields_geojson,
        'jobs': jobs_geojson
    }

def create_geojson_view_well(db: Session, well_id: str):

    well = db.query(WellInstance).filter(WellInstance.id == well_id).first()
    
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    
    all_gdf = gpd.GeoDataFrame.from_features(json.loads(well.area.geojson)['features'])
    all_gdf = all_gdf._append(gpd.GeoDataFrame.from_features(json.loads(well.field.geojson)['features']), ignore_index=True)
    
    well_loc = Point(well.surface_longitude, well.surface_latitude)
    
    new_point_gdf = gpd.GeoDataFrame([{
        'geometry': well_loc,
    }])

    all_gdf = all_gdf._append(new_point_gdf, ignore_index=True)
    
    bounds = all_gdf.total_bounds
    x = (bounds[0] + bounds[2]) / 2
    y = (bounds[1] + bounds[3]) / 2

    return {
        'geojson':all_gdf.to_geo_dict(),
        'center': {'x': x, 'y': y}
    }
    
# def create_strat_unit(db: Session, strat_unit: CreateStratUnitSchema):
    
#     db_strat_unit = StratUnit(
#         **strat_unit.model_dump()
#     )
#     db.add(db_strat_unit)
#     db.commit()
#     db.refresh(db_strat_unit)
#     return db_strat_unit

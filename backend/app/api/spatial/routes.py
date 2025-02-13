from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.auth.schemas import Role
from app.core.security import authorize, get_current_user
from app.api.spatial import crud, schemas
from app.core.schema_operations import create_api_response
from typing import List
from .schemas import FieldResponse, AreaResponse
from uuid import UUID
from app.core.database import get_sync_db_session
from fastapi_limiter.depends import RateLimiter
from fastapi_cache.decorator import cache
from app.core.config import  settings

router = APIRouter(prefix="/spatial", tags=["Spatial"])

@router.post("/area/create", summary="Create Area", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def create_area(area: schemas.CreateAreaSchema, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    created_area = crud.create_area(db, area, user)
    if not created_area:
        return create_api_response(success=False, message="Failed to create area", status_code=400)
    return create_api_response(success=True, message="Area created successfully", data=created_area)

@router.post("/field/create", summary="Create Field", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def create_field(field: schemas.CreateFieldSchema, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    created_field = crud.create_field(db, field)
    if not created_field:
        return create_api_response(success=False, message="Failed to create field", status_code=400)
    return create_api_response(success=True, message="Field created successfully", data=created_field)

# @router.post("/strat-unit/create")
# @authorize(role=[Role.KKKS])
# async def create_strat_unit(strat_unit: schemas.CreateStratUnitSchema, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
#     created_strat_unit = crud.create_strat_unit(db, strat_unit)
#     if not created_strat_unit:
#         return create_api_response(success=False, message="Failed to create stratigraphic unit", status_code=400)
#     return create_api_response(success=True, message="Stratigraphic unit created successfully", data=created_strat_unit)

@router.get("/get/areas", response_model=List[AreaResponse], summary="Get Areas", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_areas(db: Session = Depends(get_sync_db_session)):
    areas = crud.get_areas(db)
    return areas

@router.get("/get/fields/{area_id}", response_model=List[FieldResponse], summary="Get Fields based on Area", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_fields(area_id: str, db: Session = Depends(get_sync_db_session)):
    field = crud.get_fields(db, area_id)
    return field

@router.get("/get/kkks-info/{kkks_id}", summary="Get GeoJSON based on KKKS ID", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def get_kkks_info(kkks_id: str, db: Session = Depends(get_sync_db_session)):
    geojson = crud.create_geojson_view_kkks(db, kkks_id)
    return create_api_response(
        success=True,
        message="GeoJSON retrieved successfully",
        data=geojson
    )

@router.get("/get/well-info/{well_id}", summary="Get GeoJSON based on Well ID", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def get_well_info(well_id: str, db: Session = Depends(get_sync_db_session)):
    geojson = crud.create_geojson_view_well(db, well_id)
    return create_api_response(
        success=True,
        message="GeoJSON retrieved successfully",
        data=geojson
    )

# @router.get("/api/well-instance", response_model=List[WellInstanceResponse])
# def get_well_instances(db: Session = Depends(get_sync_db_session)):
#     well_instances = (
#         db.query(WellInstance.id, WellInstance.well_name)
#         .filter(WellInstance.well_phase == "actual")
#         .all()
#     )
#     return [
#         WellInstanceResponse(id=id, well_name=well_name)
#         for id, well_name in well_instances
#     ]

# @router.get("/api/strat-units/{area_id}", response_model=List[StratUnitResponse])
# def get_strat_units_by_area(area_id: str, db: Session = Depends(get_sync_db_session)):
#     strat_units = (
#         db.query(StratUnit)
#         .filter(StratUnit.area_id == area_id)
#         .all()
#     )
    
#     if not strat_units:
#         raise HTTPException(status_code=404, detail="No strat units found for this area")
    
#     return [
#         StratUnitResponse(
#             id=unit.id,
#             strat_unit_info=f"{unit.strat_unit_name} ({unit.strat_petroleum_system.name})"
#         )
#         for unit in strat_units
#     ]


from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.api.auth.models import Role
from app.core.security import authorize, get_current_user
from app.api.well import crud, schemas
from app.core.schema_operations import create_api_response
from uuid import UUID
from typing import List
from app.core.database import get_sync_db_session
from fastapi_limiter.depends import RateLimiter
from fastapi_cache.decorator import cache
from app.core.config import settings

router = APIRouter(prefix="/well")

@router.post("/existing/create", summary="Create Existing Well", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def create_well(well: schemas.CreateExistingWell, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    crud.create_existing_well(db, well, user)
    return create_api_response(success=True, message="Well created successfully")

@router.get("/existing/get/{kkks_id}", summary="Get Existing Well by KKKS ID", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def read_wells(
    kkks_id: str,
    db: Session = Depends(get_sync_db_session), 
    user = Depends(get_current_user)):
    wells = crud.get_existing_wells_by_kkks_id(db, kkks_id)
    return wells

@router.get("/existing/all", summary="Get All Existing Well (SKK Only)", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def read_wells(
    db: Session = Depends(get_sync_db_session),
    user = Depends(get_current_user)):
    wells = crud.get_existing_wells(db)
    return wells

@router.get("/existing/summary/{kkks_id}", summary="Get Existing Well Summary by KKKS ID", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def get_well_summary_by_kkks_id(kkks_id: str, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    wells = crud.get_existing_wells_summary_by_kkks_id(db, kkks_id)
    return wells

@router.get("/existing/all/summary", summary="Get All Existing Well Summary (SKK Only)", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def get_well_summary(db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    wells = crud.get_existing_wells_summary(db)
    return wells

@router.get("/existing/list/{kkks_id}", summary="Get List of Existing Wells",response_model=List[schemas.WellResponse], tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def get_existing_wells(kkks_id, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    wells = crud.get_existing_wells_list_by_kkks_id(db, kkks_id)
    return wells

@router.delete("/existing/{well_id}/delete", summary="Delete Existing Well", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def delete_well(well_id: str, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    crud.delete_existing_well(db, well_id)
    return create_api_response(success=True, message="Well deleted successfully")

@router.put("/existing/{well_id}/edit", summary="Edit Existing Well", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def edit_well(well_id: str, actual: schemas.UpdateExistingWell, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    crud.edit_well(db, well_id, actual, user)
    return create_api_response(success=True, message="Well edited successfully")

@router.get("/existing/{well_id}/get", summary="Get Existing Well", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def get_existing_well(well_id: str, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    existing_well = crud.get_existing_well(db, well_id)
    return create_api_response(success=True, message="Existing Well retrieved successfully", data=existing_well)

@router.post("/existing/upload-batch", summary="Upload Batch Existing Well", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS, Role.Admin])
async def upload_batch_well(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    content = file.file.read()
    crud.upload_batch_well(db, content, user)
    return create_api_response(success=True, message="Existing Well batch uploaded successfully")

@router.get("/existing/export-to-ppdm", summary="Export Existing Well to PPDM", tags=["Existing Well"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
@authorize(role=[Role.KKKS, Role.Admin])
async def export_to_pppdm(db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    wells = crud.export_to_ppdm(db)
    return wells
    
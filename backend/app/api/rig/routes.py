from math import exp
from urllib import response
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.api.auth.models import Role
from app.core.security import authorize, get_current_user
from app.api.rig import crud, schemas
from app.core.schema_operations import create_api_response
from uuid import UUID
from typing import List
from app.core.database import get_sync_db_session
from fastapi_limiter.depends import RateLimiter
from fastapi_cache.decorator import cache
from app.core.config import  settings

router = APIRouter(prefix="/rig")

@router.post("/create", summary="Create Rig", tags=["Rig"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
def create_rig(rig: schemas.CreateRig, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    crud.create_rig(db, rig, user)
    return create_api_response(success=True, message="Rig created successfully")

@router.get("/list", summary="Get Rig Options List", tags=["Rig"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))], response_model=List[schemas.RigOptionsList])
def get_rig_options_list(db: Session = Depends(get_sync_db_session)):
    rigs = crud.get_rigs_list(db)
    return rigs

@router.delete("/{rig_id}/delete", summary="Delete Rig", tags=["Rig"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
def delete_rig(rig_id: str, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    crud.delete_rig(db, rig_id)
    return create_api_response(success=True, message="Rig deleted successfully")

@router.put("/{rig_id}/edit", summary="Edit Rig", tags=["Rig"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
def edit_rig(rig_id: str, rig: schemas.UpdateRig, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    crud.edit_rig(db, rig_id, rig, user)
    return create_api_response(success=True, message="Rig edited successfully")

@router.get("/{rig_id}/get", summary="Get Rig", tags=["Rig"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
def get_rig(rig_id: str, db: Session = Depends(get_sync_db_session)):
    rig = crud.get_rig_by_id(db, rig_id)
    return create_api_response(success=True, message="Rig retrieved successfully", data=rig)

@router.get("/{rig_id}/view", summary="View Rig", tags=["Rig"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
def view_rig(rig_id: str, db: Session = Depends(get_sync_db_session)):
    rig = crud.get_rig_by_id(db, rig_id)
    return create_api_response(success=True, message="Rig viewed successfully", data=rig)

@router.get("/all", summary="Get All Rigs", tags=["Rig"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
def get_rigs(db: Session = Depends(get_sync_db_session)):
    rigs = crud.get_all_rigs(db)
    rigs = [schemas.GetRig.model_validate(rig).model_dump(by_alias=True) for rig in rigs]
    return create_api_response(success=True, message="Rigs retrieved successfully", data=rigs)

@router.get("/summary", summary="Get Rig Summary", tags=["Rig"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_rig_summary(db: Session = Depends(get_sync_db_session)):
    data = crud.get_rig_summary(db)
    return create_api_response(success=True, message="Rig summary retrieved successfully", data=data)
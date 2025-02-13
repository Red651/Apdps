from sqlalchemy.orm import Session
from app.api.auth import crud, schemas, models
from fastapi import HTTPException, Depends, status, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.schema_operations import create_api_response
from app.core.config import settings
from app.core.security import authenticate_user, create_access_token, get_current_token_availability, get_current_user, authorize,refresh_token
from typing import Union
from uuid import UUID
from app.api.utils.crud import *
from fastapi.responses import FileResponse
from fastapi import File, UploadFile
from app.core.database import get_sync_db_session

from fastapi_limiter.depends import RateLimiter
from fastapi_cache.decorator import cache

router = APIRouter(prefix="/auth")

@router.post("/token", summary='Generate Token', tags=['Token'], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_sync_db_session)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        return create_api_response(success=False, message="Incorrect username or password", status_code=401)
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/check-token", summary='Check Token', tags=['Token'])
async def check_token(availability: bool = Depends(get_current_token_availability)):
    return create_api_response(success=True, message="Token availability succesfully retrieved", data={"availability": availability})

@router.get('/user/me', summary='Get details of currently logged in user', tags=['User'])
async def get_me(user: models.User = Depends(get_current_user)):
    if user.role == models.Role.Admin:
        return schemas.GetUser.model_validate(user)
    else:
        return schemas.GetKKKSUser.model_validate(user)

@router.get("/kkks/{kkks_id}", response_model=schemas.GetKKKS, summary='Get KKKS Info (Admin Only)', tags=['KKKS'], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[models.Role.Admin , models.Role.KKKS])
async def get_user(kkks_id: str, db: Session = Depends(get_sync_db_session), user: schemas.GetUser = Depends(get_current_user)):
    kkks = crud.get_kkks_by_id(db, kkks_id)
    if kkks is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KKKS not found")
    return kkks

@router.get("/kkks", response_model=list[schemas.GetKKKS], summary='Get All KKKS (Admin Only)', tags=['KKKS'], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[models.Role.Admin])
async def get_all_kkks(db: Session = Depends(get_sync_db_session), user: schemas.GetUser = Depends(get_current_user)):
    kkks = crud.get_kkks(db)
    return kkks

@router.get("/kkks/{kkks_id}/logo", summary="Get KKKS Logo", tags=["KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_kkks_logo(kkks_id: str, db: Session = Depends(get_sync_db_session), user: schemas.GetUser = Depends(get_current_user)):
    # kkks = crud.get_kkks_by_id(db, kkks_id)
    # if kkks is None:
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KKKS not found")
    # if kkks.logo is None:
    #     return FileResponse('app/static/images/placeholder-kkks-logo.png')
    # return FileResponse(kkks.logo)
    return FileResponse('app/static/images/placeholder-kkks-logo.png')

@router.post("/kkks/{kkks_id}/logo", summary="Upload KKKS Logo", tags=["KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def upload_kkks_logo(kkks_id: str, file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user: schemas.GetUser = Depends(get_current_user)):
    kkks = crud.get_kkks_by_id(db, kkks_id)
    if kkks is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KKKS not found")
    try:
        file_info = save_upload_file(db, file, user)
        kkks.logo = file_info.file_location
        db.commit()
        db.refresh(kkks)
        return create_api_response(success=True, message="KKKS logo uploaded successfully", data={"kkks": kkks})
    except Exception as e:
        return create_api_response(success=False, message="Failed to upload KKKS logo", status_code=500)

@router.delete("/kkks/{kkks_id}/logo", summary="Delete KKKS Logo", tags=["KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def delete_kkks_logo(kkks_id: str, db: Session = Depends(get_sync_db_session), user: schemas.GetUser = Depends(get_current_user)):
    kkks = crud.get_kkks_by_id(db, kkks_id)
    if kkks is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KKKS not found")
    kkks.logo = None
    db.commit()
    db.refresh(kkks)
    return create_api_response(success=True, message="KKKS logo deleted successfully", data={"kkks": kkks})
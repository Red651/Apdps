from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Literal
from sqlalchemy.orm import Session
from app.api.auth.models import Role
from app.core.security import authorize, get_current_user
from app.api.utils.schemas import TabularData,DrillingOperationResponse,BHAResponse
from app.api.job.models import *
from app.api.utils.models import FileRecord, PhysicalItem
from app.api.utils.crud import *
from well_profile import load
from app.core.schema_operations import create_api_response
from app.api.visualize.lib.well_profile_func import render_well_profile
from app.core.database import get_sync_db_session
from fastapi_limiter.depends import RateLimiter
from fastapi_cache.decorator import cache
from app.api.utils.utils import remove_unassigned_file, remove_unassigned_physical_item

router = APIRouter(prefix="/utils", tags=["Utils"])

@router.post("/upload/file", tags=['File'], summary="Upload file", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def create_upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        file_info = save_upload_file(db, file, user)
        background_tasks.add_task(remove_unassigned_file, file_info.id)
        return create_api_response(
            success=True,
            message=f"File '{file.filename}' uploaded successfully",
            data={"file_info": file_info}
        )
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to upload file", status_code=500)

@router.post("/upload/physical-item", tags=['File'], summary="Upload physical item file", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def create_upload_physical_item(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        physical_item_id = save_upload_physical_item(db, file, user)
        background_tasks.add_task(remove_unassigned_physical_item,physical_item_id)
        return create_api_response(
            success=True,
            message=f"File '{file.filename}' uploaded successfully",
            data={"physical_item_info": {
                'physical_item_id': physical_item_id,
            }}
        )
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to upload file", status_code=500)
    
@router.post("/upload-and-read/tabularfile", tags=['File'], summary="Upload and read tabular file", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def create_upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    data = jsonify_and_save_tabular_file(db, file, user)
    background_tasks.add_task(remove_unassigned_file, data['file_info'].id)
    return create_api_response(
        success=True,
        message=f"File '{file.filename}' uploaded successfully",
        data=data
    )

@router.post("/upload/files", tags=['File'], summary="Upload multiple files", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def create_upload_files(files: List[UploadFile] = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        file_infos = save_upload_multiple_files(db, files, user)
        return create_api_response(
            success=True,
            message=f"Successfully uploaded {len(files)} files",
            data={"files_info": file_infos}
        )
    except Exception as e:
        return create_api_response(success=False, message="Failed to upload files", status_code=500)

@router.delete("/delete/file/{file_id}", tags=['File'], summary="Delete file", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def delete_file(file_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        delete_uploaded_file(db, file_id)
        return create_api_response(success=True, message=f"File '{file_id}' deleted successfully")
    except Exception as e:
        return create_api_response(success=False, message="Failed to delete file", status_code=500)

@router.get("/download/file/{file_id}", tags=['File'], summary="Download file", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def download_file(file_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    file_info = db.query(FileRecord).filter(FileRecord.id == file_id).first()
    if file_info is None:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_info.file_location)

@router.get("/view-image/file/{file_id}", tags=['File'], summary="View image file", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def view_image_file(file_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    file_info = db.query(FileRecord).filter(FileRecord.id == file_id).first()
    if file_info is None:
        raise HTTPException(status_code=404, detail="File not found")
    if file_info.file_extension not in ['.png', '.jpg', '.jpeg']:
        raise HTTPException(status_code=400, detail="File is not an image file")
    return FileResponse(file_info.file_location)

# @router.post("/read/tabular", response_model=TabularData, tags=['File'], summary="Read tabular file")
# @authorize(role=[Role.Admin, Role.KKKS])
# async def read_tabular_file(file: UploadFile = File(...), user = Depends(get_current_user)):
#     try:
#         tabular_data = jsonify_tabular_file(file)
#         return create_api_response(success=True, message="Tabular file read successfully", data=tabular_data)
#     except Exception as e:
#         return create_api_response(success=False, message="Failed to read tabular file", status_code=500)

@router.post("/upload/trajectory", tags=['File'], summary="Upload trajectory file", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def upload_trajectory_file(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):

    file_info = save_upload_file(db, file, user)
    
    try:
        well_profile = load(file_info.file_location)
        fig_data = render_well_profile(well_profile)

        return create_api_response(
            success=True,
            message="Trajectory file uploaded and processed successfully",
            data={"file_info": file_info, "plot": fig_data}
        )
        
    except Exception as e:
        print(e)
        return create_api_response(
            success=False,
            message="Error occured while processing the trajectory file. Data must contain at least inc, azi and md",
            status_code=500
        )

@router.get("/options/{enum_name}", response_model=List[EnumResponse], summary="Get options for a field", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_options(enum_name: Literal[tuple(options_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    job_types = [EnumResponse(name=jt.name, value=jt.value) for jt in options_map[enum_name]]
    return job_types

# @router.get("/drilling-operations/pyenum", response_model=List[DrillingOperationResponse])
# async def list_drilling_operations():
#     return [
#         DrillingOperationResponse(operation=op, description=op.value)
#         for op in DrillingOperation
#     ]

# @router.get("/bha/pyenum", response_model=List[BHAResponse])
# async def list_bhacomponents():
#     return [
#        BHAResponse(bhacomponent=op)
#         for op in BHAComponentType
#     ]
    
# @router.post("/wbs/upload-excel/")
# async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     # Memeriksa apakah file adalah Excel
#     return excel_wbs(file, db)
# @router.post("/drillingfluid/upload-excell/")
# async def upload_excel_drillingfluid(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_drillingfluid(file, db)
# @router.post("/mudaddictive/upload-excell/")
# async def upload_excel_mudaddictive(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_mudadditive(file, db)
# @router.post("/bulk-material/upload-excell/")
# async def upload_excel_bulkmaterial(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_bulkmaterial(file, db)
# @router.post("/directionalsurvey/upload-excell/")
# async def upload_excel_directionalsurvey(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_directionalsurvey(file, db)
# @router.post("/personnel/upload-excell/")
# async def upload_excel_personnel(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_personnel(file, db)
# @router.post("/pumps/upload-excell/")
# async def upload_excel_pumps(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_pumps(file, db)
# @router.post("/weather/upload-excell/")
# async def upload_excel_weather(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_weather(file, db)
# @router.post("/wellsummary/upload-excell/")
# async def upload_excel_wellsummary(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_well_summary(file, db)
# @router.post("/wellcasing/upload-excell/")
# async def upload_excel_wellcasing(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_well_casing(file, db)
# @router.post("/wellstatigraphy/upload-excell/")
# async def upload_excel_wellstatigraphy(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_well_stratigraphy(file, db)
# @router.post("/welltest/upload-excell/")
# async def upload_excel_welltest(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_well_test(file, db)
# @router.post("/jobhazard/upload-excell/")
# async def upload_excel_jobhazard(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_job_hazard(file, db)
# @router.post("/joboperationdays/upload-excell/")
# async def upload_excel_joboperationdays(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_job_operation_day(file, db)
# @router.post("/jobdocument/upload-excell/")
# async def upload_excel_jobdocument(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
#     return excel_job_document(file, db)
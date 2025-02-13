from fastapi import APIRouter, Depends, HTTPException, UploadFile, File,Query
from sqlalchemy.orm import Session
from app.api.auth.models import Role
from app.core.security import authorize, get_current_user
from app.api.job import crud
from .schemas.dor import *
from .schemas.job import *
from app.api.job.models import JobType, Job
from app.core.schema_operations import create_api_response
from typing import Any, Union, Literal,Dict
from app.core.database import get_sync_db_session
from fastapi_limiter.depends import RateLimiter
from fastapi_cache.decorator import cache
from app.core.config import  settings
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/job")

@router.post("/planning/upload-batch/exploration", summary="Upload Batch Job Exploration", tags=["Upload Batch Job"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def upload_batch_exploration(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    content = file.file.read()
    responses = crud.upload_batch(db, content, JobType.EXPLORATION, user)
    return create_api_response(success=True, message="Job plan batch uploaded successfully")

@router.post("/planning/upload-batch/development", summary="Upload Batch Job Development", tags=["Upload Batch Job"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def upload_batch_development(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    content = file.file.read()
    responses = crud.upload_batch(db, content, JobType.DEVELOPMENT, user)
    return create_api_response(success=True, message="Job plan batch uploaded successfully")

@router.post("/planning/upload-batch/workover", summary="Upload Batch Job Workover", tags=["Upload Batch Job"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def upload_batch_workover(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    content = file.file.read()
    responses = crud.upload_batch(db, content, JobType.WORKOVER, user)
    return create_api_response(success=True, message="Job plan batch uploaded successfully")

@router.post("/planning/upload-batch/wellservice", summary="Upload Batch Job Well Service", tags=["Upload Batch Job"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def upload_batch_wellservice(file: UploadFile = File(...), db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    content = file.file.read()
    responses = crud.upload_batch(db, content, JobType.WELLSERVICE, user)
    return create_api_response(success=True, message="Job plan batch uploaded successfully")

@router.post("/planning/create/exploration", summary="Create Job Exploration (KKKS Only)" , tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def create_planning(plan: CreateExplorationJob, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    job_id = crud.create_job_plan(db, JobType.EXPLORATION, plan, user)
    return create_api_response(success=True, message="Exploration job plan created successfully")

@router.post("/planning/create/development", summary="Create Job Development (KKKS Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def create_planning_development(plan: CreateDevelopmentJob, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    job_id = crud.create_job_plan(db, JobType.DEVELOPMENT, plan, user)
    return create_api_response(success=True, message="Development job plan created successfully")

@router.post("/planning/create/workover", summary="Create Job Workover (KKKS Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def create_planning_workover(plan: CreateWorkoverJob, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    job_id = crud.create_job_plan(db, JobType.WORKOVER, plan, user)
    return create_api_response(success=True, message="Workover job plan created successfully")

@router.post("/planning/create/wellservice", summary="Create Job Well Service (KKKS Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def create_planning_wellservice(plan: CreateWellServiceJob, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    job_id = crud.create_job_plan(db, JobType.WELLSERVICE, plan, user)
    return create_api_response(success=True, message="Well service job plan created successfully")

@router.delete('/planning/delete/{job_id}', summary="Delete Job Plan", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def delete_planning_exploration(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    crud.delete_job_plan(job_id, db, user)
    return create_api_response(success=True, message="Job plan deleted successfully")

@router.patch('/planning/approve/{job_id}', summary="Approve Job Plan (Admin Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin])
async def approve_planning_exploration(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    approved = crud.approve_job_plan(job_id, db, user)
    if not approved:
        return create_api_response(success=False, message="Job plan not found", status_code=404)
    return create_api_response(success=True, message="Job plan approved successfully")

@router.patch('/planning/return/{job_id}', summary="Return Job Plan (Admin Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin])
async def return_planning_exploration(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    returned = crud.return_job_plan(job_id, db, user)
    if not returned:
        return create_api_response(success=False, message="Job plan not found", status_code=404)
    return create_api_response(success=True, message="Job plan returned successfully")

@router.get("/planning/get/{job_id}", summary="View Job Plan (Raw)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def view_plan(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    data = crud.get_job_plan(job_id, db)
    return create_api_response(success=True, message="Job plan retrieved successfully", data=data)

@router.put("/planning/update-exploration/{job_id}", summary="Update Exploration Job Plan (KKKS Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def update_planning_exploration(
    job_id: UUID,
    plan: CreateExplorationJob,
    db: Session = Depends(get_sync_db_session),
    user = Depends(get_current_user)
) -> Any:
    crud.update_job_plan(db, job_id, plan, user)
    return create_api_response(success=True, message="Job Updated Successfully")

@router.put("/planning/update-development/{job_id}", summary="Update Development Job Plan (KKKS Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def update_planning_development(
    job_id: UUID,
    plan: CreateDevelopmentJob,
    db: Session = Depends(get_sync_db_session),
    user = Depends(get_current_user)
) -> Any:
    crud.update_job_plan(db, job_id, plan, user)
    return create_api_response(success=True, message="Job Updated Successfully")

@router.put("/planning/update-workover/{job_id}", summary="Update Workover Job Plan (KKKS Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def update_planning_workover(
    job_id: UUID,
    plan: CreateWorkoverJob,
    db: Session = Depends(get_sync_db_session),
    user = Depends(get_current_user)
) -> Any:
    crud.update_job_plan(db, job_id, plan, user)
    return create_api_response(success=True, message="Job Updated Successfully")

@router.put("/planning/update-wellservice/{job_id}", summary="Update Well Service Job Plan (KKKS Only)", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def update_planning_wellservice(
    job_id: UUID,
    plan: CreateWellServiceJob,
    db: Session = Depends(get_sync_db_session),
    user = Depends(get_current_user)
) -> Any:
    crud.update_job_plan(db, job_id, plan, user)
    return create_api_response(success=True, message="Job Updated Successfully")

@router.get('/planning/view/{job_id}', summary="View Job Plan", tags=["Job Planning"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def view_plan(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        job_plan = crud.view_job_plan(job_id, db)
        if not job_plan:
            return create_api_response(success=False, message="Job plan not found", status_code=404)
        return create_api_response(success=True, message="Job plan retrieved successfully", data=job_plan)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail=f"Error getting job plan: {str(e)}"
        )

#operation

@router.patch('/operation/operate/{job_id}', summary="Operate Job (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.KKKS])
async def operate_job(job_id: UUID, surat_tajak: SuratTajakSchema, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    crud.operate_job(job_id, db, surat_tajak)
    return create_api_response(success=True, message="Job operation started successfully")

#dor
@router.post("/operation/{job_id}/dor/save/", summary="Save Daily Operations Report by Job ID (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def save_dor_by_job_id(job_id: UUID, report: DailyOperationsReportCreate, db: Session = Depends(get_sync_db_session)):
    data = crud.save_daily_operations_report(db, job_id, report)
    return create_api_response(success=True, message="Daily Operations Report saved successfully", data=data)

@router.post("/operation/{job_id}/dor/witsml/", summary="Upload WITSML file and create Daily Operations Report by Job ID (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def upload_witsml_file_and_create_daily_operations_report(job_id: UUID, witsml_file: UploadFile = File(...), db: Session = Depends(get_sync_db_session)):
    crud.read_dor_from_witsml(job_id, db, witsml_file)
    return create_api_response(success=True, message="Daily Operations Report created successfully")

@router.get("/operation/{job_id}/dor/dates/", summary="Get Daily Operations Report Dates", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_daily_opeartions_report_dates(job_id: UUID, db: Session = Depends(get_sync_db_session)):
    data = crud.get_dor_dates(db, job_id)
    return create_api_response(success=True, message="Daily Operations Report dates retrieved successfully", data=data)

@router.get("/operation/{job_id}/dor/{report_date}/get", summary="Get Daily Operations Report by Job ID and Report Date", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_daily_operations_report_by_job_id_and_date(job_id: UUID, report_date: date, db: Session = Depends(get_sync_db_session)):
    dor = crud.get_dor_by_date(db, job_id, report_date)
    if dor is None:
        raise HTTPException(status_code=404, detail="Daily Operations Report not found")
    dor_output = DailyOperationsReportCreate.model_validate(dor).model_dump()
    return create_api_response(success=True, message="Daily Operations Report retrieved successfully", data=dor_output)

# @router.get("/operation/{job_id}/dor/{report_date}/view", summary="View Daily Operations Report by Job ID and Report Date", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
# @cache(expire=60)
# async def view_daily_operations_report_by_job_id_and_date(job_id: UUID, report_date: date, db: Session = Depends(get_sync_db_session)):
#     dor = crud.get_dor_by_date(db, job_id, report_date)
#     if dor is None:
#         raise HTTPException(status_code=404, detail="Daily Operations Report not found")
#     dor_output = DailyOperationsReportCreate.model_validate(dor).model_dump(by_alias=True)
#     return create_api_response(success=True, message="Daily Operations Report retrieved successfully", data=dor_output)


@router.get("/operation/{job_id}/dor/{report_date}/view", summary="View Daily Operations Report by Job ID and Report Date", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def view_daily_operations_report_by_job_id_and_date(job_id: UUID, report_date: date, db: Session = Depends(get_sync_db_session)):
    dor = crud.render_dor(db, job_id, report_date)
    return HTMLResponse(dor)

#issues
@router.get("/operation/{job_id}/issues/", summary="Get Job Issues (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_job_issues(
    job_id: UUID,
    db: Session = Depends(get_sync_db_session)
) -> Any:
    data = crud.get_job_issues(db, job_id)
    return create_api_response(success=True, message="Job issues retrieved successfully", data=data)

@router.get("/operation/{job_id}/issues/view", summary="View Job Issues", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def view_job_issues(
    job_id: UUID,
    db: Session = Depends(get_sync_db_session)
) -> Any:
    data = crud.view_job_issues(db, job_id)
    return create_api_response(success=True, message="Job issues retrieved successfully", data=data)

@router.post("/operation/{job_id}/issues/create/", summary="Create Job Issue identified by Job ID (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def create_job_issue(
    job_id: UUID,
    job_issue: JobIssueCreate,
    db: Session = Depends(get_sync_db_session),
) -> Any:
    crud.create_job_issue(db, job_id, job_issue)
    return create_api_response(success=True, message="Job issue created successfully")

@router.patch("/issues/{job_issue_id}/edit/", summary="Edit Job Issue identified by Job Issue ID (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def edit_job_issue(
    job_issue_id: UUID,
    job_issue: JobIssueEdit,
    db: Session = Depends(get_sync_db_session)
) -> Any:
    crud.edit_job_issue(db, job_issue_id, job_issue)
    return create_api_response(success=True, message="Job issue created successfully")

@router.delete("/issues/{job_issue_id}/delete", summary="Delete Job Issue identified by Job Issue ID (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def delete_job_issue(
    job_issue_id: UUID,
    db: Session = Depends(get_sync_db_session)
) -> Any:
    crud.delete_job_issue(db, job_issue_id)
    return create_api_response(success=True, message="Job issue resolved successfully")

@router.patch("/issues/{job_issue_id}/resolve", summary="Resolve Job Issue identified by Job Issue ID (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def resolve_job_issue(
    job_issue_id: UUID,
    db: Session = Depends(get_sync_db_session)
) -> Any:
    crud.resolve_job_issue(db, job_issue_id)
    return create_api_response(success=True, message="Job issue resolved successfully")

#wrm
@router.get("/operation/{job_id}/wrm/requirements", summary="Get WRM Requirements (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_wrm_requirements(
    job_id: UUID,
    db: Session = Depends(get_sync_db_session)
):
    data = crud.get_wrm_requirements(db, job_id)
    return create_api_response(success=True, message="WRM progress retrieved successfully", data=data)

@router.get("/operation/{job_id}/wrm/progress", summary="Get WRM Progress Cut by requirements (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_wrm_progress(
    job_id: UUID,
    db: Session = Depends(get_sync_db_session)
):
    data = crud.get_wrm_progress(db, job_id)
    return create_api_response(success=True, message="WRM progress retrieved successfully", data=data)

@router.get("/operation/{job_id}/wrm/view", summary="View WRM Progress Cut by requirements", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def view_wrm_progress(
    job_id: UUID,
    db: Session = Depends(get_sync_db_session)
):
    data = crud.view_wrm_progress(db, job_id)
    return create_api_response(success=True, message="WRM progress retrieved successfully", data=data)


@router.post("/operation/{job_id}/wrm/update-exploration", summary="Update Exploration WRM Progress (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def update_wrm(
    job_id: UUID,
    wrm_data: GetExplorationWRM,
    db: Session = Depends(get_sync_db_session)
):
    crud.update_wrm(db, job_id, wrm_data)
    return create_api_response(success=True, message="WRM updated successfully")

@router.post("/operation/{job_id}/wrm/update-development", summary="Update Development WRM Progress (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def update_wrm(
    job_id: UUID,
    wrm_data: GetDevelopmentWRM,
    db: Session = Depends(get_sync_db_session)
):
    crud.update_wrm(db, job_id, wrm_data)
    return create_api_response(success=True, message="WRM updated successfully")

@router.post("/operation/{job_id}/wrm/update-workover", summary="Update Workover WRM Progress (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def update_wrm(
    job_id: UUID,
    wrm_data: GetWorkoverWRM,
    db: Session = Depends(get_sync_db_session)
):
    crud.update_wrm(db, job_id, wrm_data)
    return create_api_response(success=True, message="WRM updated successfully")

@router.post("/operation/{job_id}/wrm/update-wellservice", summary="Update Well Service WRM Progress (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def update_wrm(
    job_id: UUID,
    wrm_data: GetWellServiceWRM,
    db: Session = Depends(get_sync_db_session)
):
    crud.update_wrm(db, job_id, wrm_data)
    return create_api_response(success=True, message="WRM updated successfully")

@router.get("/operation/{job_id}/get", summary="Get Job Operation (Actual Job)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def get_actual_operation(
    job_id: UUID,
    db: Session = Depends(get_sync_db_session),
    user=Depends(get_current_user)
):
    data = crud.get_operation(db, job_id)
    return create_api_response(success=True, message="Job operation retrieved successfully", data=data)

@router.put("/operation/{job_id}/update-exploration", summary="Update Exploration Job Operation (Actual Job) (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def patch_actual_exploration_route(
    job_id: UUID,
    actual: UpdateActualExploration,
    db: Session = Depends(get_sync_db_session),
    user=Depends(get_current_user)
):
    actual = crud.update_operation(db, job_id, actual)
    return create_api_response(True, "Job operation updated successfully", data=actual)

@router.put("/operation/{job_id}/update-development", summary="Update Development Job Operation (Actual Job) (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def patch_actual_development_route(
    job_id: UUID,
    actual: UpdateActualDevelopment,
    db: Session = Depends(get_sync_db_session),
    user=Depends(get_current_user)
):
    actual = crud.update_operation(db, job_id, actual)
    return create_api_response(True, "Job operation updated successfully", data=actual)

@router.put("/operation/{job_id}/update-workover", summary="Update Workover Job Operation (Actual Job) (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def patch_actual_workover_route(
    job_id: UUID,
    actual: UpdateActualWorkover,
    db: Session = Depends(get_sync_db_session),
    user=Depends(get_current_user)
):
    actual = crud.update_operation(db, job_id, actual)
    return create_api_response(True, "Job operation updated successfully", data=actual)

@router.put("/operation/{job_id}/update-wellservice", summary="Update Well Service Job Operation (Actual Job) (KKKS Only)", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def patch_actual_wellservice_route(
    job_id: UUID,
    actual: UpdateActualWellService,
    db: Session = Depends(get_sync_db_session),
    user=Depends(get_current_user)
):
    actual = crud.update_operation(db, job_id, actual)
    return create_api_response(True, "Job operation updated successfully", data=actual)

@router.patch("/operation/{job_id}/validate", summary="Validate Job Operation before Finishing", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def validate_actual_operation(
    job_id: UUID,
    db: Session = Depends(get_sync_db_session),
    user=Depends(get_current_user)
):
    data = crud.get_job_operation_validations(db, job_id)
    return create_api_response(success=True, message="Validation Successful", data=data)

@router.patch("/operation/{job_id}/finish", summary="Finish Job Operation", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def finish_actual_operation(
    job_id: UUID,
    finish_operation: FinishOperation,
    db: Session = Depends(get_sync_db_session),
    user=Depends(get_current_user)
):
    crud.finish_operation(db, job_id, finish_operation)
    return create_api_response(success=True, message="Job Operation finished successfully")

@router.get('/operation/{job_id}/view', summary="View Job Operation", tags=["Job Operation"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def view_operation(
    job_id: UUID,
    db: Session = Depends(get_sync_db_session),
    user=Depends(get_current_user)
):
    data = crud.view_operation(db, job_id)
    return create_api_response(success=True, message="Job operation retrieved successfully", data=data)

#PPP
@router.get("/ppp/{job_id}/afe-info", summary="Get PPP (KKKS Only)", tags=["Job PPP"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def get_ppp(job_id: UUID, db: Session = Depends(get_sync_db_session), user=Depends(get_current_user)):
    ppp = crud.get_ppp_afe_info(db, job_id)
    return create_api_response(success=True, message="PPP AFE Info retrieved successfully", data=ppp)

@router.patch("/ppp/{job_id}/propose", summary="Propose PPP (KKKS Only)", tags=["Job PPP"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def propose_ppp(job_id: UUID, proposal: ProposePPP, db: Session = Depends(get_sync_db_session), user=Depends(get_current_user)):
    crud.propose_ppp(db, job_id, proposal)
    return create_api_response(True, "Propose PPP successfully")

@router.patch("/ppp/{job_id}/return", summary="Return PPP (Admin Only)", tags=["Job PPP"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def return_ppp(job_id: UUID, db: Session = Depends(get_sync_db_session), user=Depends(get_current_user)):
    crud.return_ppp(db, job_id)
    return create_api_response(True, "Return PPP successfully")

@router.get("/ppp/{job_type}/export-to-ppdm", summary="Export Finished Wells to PPDM", tags=["Job PPP"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def export_to_pppdm(job_type: Literal['exploration','development'], db: Session = Depends(get_sync_db_session), user=Depends(get_current_user)):
    wells = crud.export_to_ppdm(db, JobType.EXPLORATION if job_type == 'exploration' else JobType.DEVELOPMENT)
    return wells

@router.get("/ppp/{job_id}/get", summary="Get PPP", tags=["Job PPP"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def get_ppp(job_id: UUID, db: Session = Depends(get_sync_db_session), user=Depends(get_current_user)):
    ppp = crud.get_ppp(db, job_id)
    return create_api_response(success=True, message="PPP retrieved successfully", data=ppp)

@router.patch("/ppp/{job_id}/approve", summary="Approve PPP (Admin Only)", tags=["Job PPP"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def approve_ppp(job_id: UUID, db: Session = Depends(get_sync_db_session), user=Depends(get_current_user)):
    crud.approve_ppp(db, job_id)
    return create_api_response(True, "PPP Approved successfully")

@router.patch("/co/{job_id}/update", summary="Update Close Out", tags=["Job Close Out"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def update_co(job_id: UUID, co: UpdateCO, db: Session = Depends(get_sync_db_session), user=Depends(get_current_user)):
    crud.update_co(db, job_id, co)
    return create_api_response(True, "CO Updated successfully")

@router.get("/co/{job_id}/get", summary="Get Close Out", tags=["Job Close Out"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@cache(expire=60)
async def get_co(job_id: UUID, db: Session = Depends(get_sync_db_session), user=Depends(get_current_user)):
    co = crud.get_co(db, job_id)
    return create_api_response(success=True, message="CO retrieved successfully", data=co)

# @router.get("/sidebar/{job_type}", summary="Get Status Job Sidebar", tags=["Sidebar Job"])
# async def get_jobs(job_type:str,status:str,db: Session = Depends(get_sync_db_session)):
#     try:
#         return crud.get_job_sidebar(db,job_type,status)
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error getting jobs: {str(e)}"
#         )
JOB_TYPES = ["EXPLORATION", "DEVELOPMENT", "WORKOVER", "WELLSERVICE"]
STATUS_TYPES = ["planning", "operational", "ppp", "co"]
@router.get("/sidebar/{job_type}/{status}", response_model=Dict[str, bool])
async def get_job_sidebar_status(
    job_type: str,
    status: str,
    db: Session = Depends(get_sync_db_session)
):
    """
    Get job sidebar status based on job type and status category.
    Returns a dictionary of status existence flags.
    """
    # Validate job_type
    if job_type not in JOB_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid job type. Must be one of: {', '.join(JOB_TYPES)}"
        )
    
    # Validate status
    if status not in STATUS_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status type. Must be one of: {', '.join(STATUS_TYPES)}"
        )
    
    try:
        result = crud.get_job_sidebar(db, job_type, status)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting sidebar status: {str(e)}"
        )
        
@router.get("getplanning{job_type}/{planning_status}", response_model=JobResponse,  tags=["Sidebar Job"])
async def get_planning_phase(job_type: JobType, planning_status: str, db: Session = Depends(get_sync_db_session)):
    try:
        result = crud.get_planning_phase(db,job_type,planning_status)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch exploration jobs: {str(e)}"
        )
@router.get("getoperation{job_type}/{operation_status}", response_model=JobResponse,tags=["Sidebar Job"])
async def get_operation_phase(job_type: JobType, operation_status: str, db: Session = Depends(get_sync_db_session)):
    try:
        result = crud.get_operasi_phase(db,job_type,operation_status)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch exploration jobs: {str(e)}"
        )
@router.get("getppp{job_type}/{ppp_status}", response_model=JobResponse,tags=["Sidebar Job"])
async def get_p3_phase(job_type: JobType, ppp_status: str, db: Session = Depends(get_sync_db_session)):
    
    try:
        result = crud.get_ppp_phase(db,job_type,ppp_status)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch exploration jobs: {str(e)}"
        )

@router.get("getco{job_type}/{closeout_status}", response_model=JobResponse,tags=["Sidebar Job"])
async def get_closeout_phase(job_type: JobType, closeout_status: str, db: Session = Depends(get_sync_db_session)):
    
    try:
        result = crud.get_co_phase(db,job_type,closeout_status)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch exploration jobs: {str(e)}"
        )

@router.get("/kkks/{kkks_id}/sidebar/{job_type}/{status}",tags=["Sidebar Job"], response_model=Dict[str, bool])
async def get_job_sidebar_status_by_kkks(
    kkks_id: str,
    job_type: str,
    status: str,
    db: Session = Depends(get_sync_db_session)
):
    if job_type not in JOB_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid job type. Must be one of: {', '.join(JOB_TYPES)}"
        )
    
    if status not in STATUS_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status type. Must be one of: {', '.join(STATUS_TYPES)}"
        )
    
    try:
        result = crud.get_job_sidebar_by_kkks(db, job_type, status, kkks_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting sidebar status: {str(e)}"
        )

@router.get("/kkks/{kkks_id}/planning/{job_type}/{planning_status}",tags=["Sidebar Job"], response_model=JobResponse)
async def get_planning_phase_by_kkks(
    kkks_id: str,
    job_type: JobType,
    planning_status: str,
    db: Session = Depends(get_sync_db_session)
):
    try:
        result = crud.get_planning_phase_by_kkks(db, job_type, planning_status, kkks_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch planning phase jobs: {str(e)}"
        )

@router.get("/kkks/{kkks_id}/operation/{job_type}/{operation_status}",tags=["Sidebar Job"], response_model=JobResponse)
async def get_operation_phase_by_kkks(
    kkks_id: str,
    job_type: JobType,
    operation_status: str,
    db: Session = Depends(get_sync_db_session)
):
    try:
        result = crud.get_operasi_phase_by_kkks(db, job_type, operation_status, kkks_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch operation phase jobs: {str(e)}"
        )

@router.get("/kkks/{kkks_id}/ppp/{job_type}/{ppp_status}",tags=["Sidebar Job"], response_model=JobResponse)
async def get_ppp_phase_by_kkks(
    kkks_id: str,
    job_type: JobType,
    ppp_status: str,
    db: Session = Depends(get_sync_db_session)
):
    try:
        result = crud.get_ppp_phase_by_kkks(db, job_type, ppp_status, kkks_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch PPP phase jobs: {str(e)}"
        )

@router.get("/kkks/{kkks_id}/co/{job_type}/{closeout_status}",tags=["Sidebar Job"], response_model=JobResponse)
async def get_closeout_phase_by_kkks(
    kkks_id: str,
    job_type: JobType,
    closeout_status: str,
    db: Session = Depends(get_sync_db_session)
):
    try:
        result = crud.get_co_phase_by_kkks(db, job_type, closeout_status, kkks_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch closeout phase jobs: {str(e)}"
        )


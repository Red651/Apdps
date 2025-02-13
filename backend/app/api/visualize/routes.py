import matplotlib
from fastapi import Response, BackgroundTasks, APIRouter, Depends
from requests import get
from sqlalchemy.orm import Session
from app.api.job.models import Job
from app.api.visualize.lib.well_curve_data import generate_log, generate_ppfg
from app.api.auth.models import Role
from app.core.security import authorize, get_current_user
from app.api.auth.schemas import GetUser
from app.api.visualize import schemas, utils, crud
from app.core.schema_operations import create_api_response
from fastapi.responses import HTMLResponse
from app.api.utils.models import FileRecord
import uuid
from uuid import UUID
from app.core.database import get_sync_db_session
from fastapi_limiter.depends import RateLimiter
from fastapi_cache.decorator import cache
from app.core.config import  settings

router = APIRouter(prefix="/visualize", tags=["Visualizations"])

@router.post("/temporary/casing", summary="Visualize casing from request body (for visualization during form input)", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def visualize_casing(casing: schemas.VisualizeCasing, background_tasks: BackgroundTasks, user = Depends(get_current_user)):
    try:
        img_buf = utils.generate_well_casing(
            casing.names, casing.top_depths, casing.bottom_depths, casing.diameters
        )
        background_tasks.add_task(img_buf.close)
        headers = {'Content-Disposition': 'inline; filename="casing.png"'}
        return Response(img_buf.getvalue(), headers=headers, media_type='image/png')
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate casing visualization", status_code=500)

@router.get("/casing/plan/{job_id}", summary="Visualize casing from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def visualize_casing_plan(job_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        casing_data = crud.visualize_well_casing(db, job_id, background_tasks, 'plan')
        return casing_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate casing visualization", status_code=500)

@router.get("/casing/actual/{job_id}", summary="Visualize casing from actual job", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def visualize_actual_casing_plan(job_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        casing_data = crud.visualize_well_casing(db, job_id, background_tasks, 'actual')
        return casing_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate casing visualization", status_code=500)

@router.get("/wbs/plan/{job_id}", response_class=HTMLResponse, summary="Visualize Work Breakdown Structure from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def visualize_wbs(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        wbs_data = crud.visualize_work_breakdown_structure(db, job_id, 'plan')
        return wbs_data
    except Exception as e:
        return create_api_response(success=False, message="Failed to generate Work Breakdown Structure visualization", status_code=500)

@router.get("/wbs/actual/{job_id}", response_class=HTMLResponse, summary="Visualize Work Breakdown Structure from actual job", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def visualize_actual_wbs(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        wbs_data = crud.visualize_work_breakdown_structure(db, job_id, 'actual')
        return wbs_data
    except Exception as e:
        return create_api_response(success=False, message="Failed to generate Work Breakdown Structure visualization", status_code=500)

@router.get("/tdc/plan/{job_id}", summary="Visualize Time Depth Curve from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def visualize_time_depth_curve(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        tdc_data = crud.visualize_time_depth_curve(db, job_id, 'plan')
        return tdc_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate Time Depth Curve visualization", status_code=500)
    
@router.get("/tdc/actual/{job_id}", summary="Visualize Time Depth Curve from actual job", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def visualize_actual_time_depth_curve(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        tdc_data = crud.visualize_time_depth_curve(db, job_id, 'actual')
        return tdc_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate Time Depth Curve visualization", status_code=500)
    
@router.get("/trajectory/plan/{job_id}", summary="Visualize Trajectory from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def visualize_trajectory(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        trajectory_data = crud.visualize_trajectory(db, job_id, 'plan')
        return trajectory_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate Trajectory visualization", status_code=500)

@router.get("/trajectory/actual/{job_id}", summary="Visualize Trajectory from actual job", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def visualize_actual_trajectory(job_id: UUID, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        trajectory_data = crud.visualize_trajectory(db, job_id, 'actual')
        return trajectory_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate Trajectory visualization", status_code=500)

@router.get("/log/{file_id}", summary="Visualize Well Log", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def generate_logs(file_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        file = db.query(FileRecord).filter(FileRecord.id == file_id).first()
        img_buf = generate_log(file)
        background_tasks.add_task(img_buf.close)
        headers = {'Content-Disposition': 'inline; filename="log.png"'}
        return Response(img_buf.getvalue(), headers=headers, media_type='image/png')
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate well log visualization", status_code=500)

@router.get("/pore-pressure/plan/{job_id}", summary="Visualize Pore Pressure from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def generate_pore_pressure(job_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job is None:
            return create_api_response(success=False, message="Job not found", status_code=404)
        file = job.job_plan.well.well_ppfg.file
        img_buf = generate_ppfg(file)
        background_tasks.add_task(img_buf.close)
        headers = {'Content-Disposition': 'inline; filename="pore_pressure.png"'}
        return Response(img_buf.getvalue(), headers=headers, media_type='image/png')
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate pore pressure visualization", status_code=500)

@router.get("/pore-pressure/actual/{job_id}", summary="Visualize Pore Pressure from actual job", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def generate_pore_pressure(job_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job is None:
            return create_api_response(success=False, message="Job not found", status_code=404)
        file = job.actual_job.well.well_ppfg.file
        img_buf = generate_ppfg(file)
        background_tasks.add_task(img_buf.close)
        headers = {'Content-Disposition': 'inline; filename="pore_pressure.png"'}
        return Response(img_buf.getvalue(), headers=headers, media_type='image/png')
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate pore pressure visualization", status_code=500)

@router.get("/schematic/plan/{job_id}", summary="Visualize Schematic from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def generate_plan_schematic(job_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        schematic_data = crud.generate_schematic(db, job_id, background_tasks, 'plan')
        return schematic_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate schematic visualization", status_code=500)

@router.get("/schematic/actual/{job_id}", summary="Visualize Schematic from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def generate_actual_schematic(job_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        schematic_data = crud.generate_schematic(db, job_id, background_tasks, 'actual')
        return schematic_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate schematic visualization", status_code=500)

@router.get("/seismic/plan/{job_id}", summary="Visualize Seismic from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def generate_plan_seismic_section(job_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        seismic_data = crud.generate_seismic_section(db, job_id, background_tasks, 'plan')
        return seismic_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate seismic section visualization", status_code=500)

@router.get("/seismic/actual/{job_id}", summary="Visualize Seismic from job plan", dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
async def generate_actual_seismic_section(job_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    try:
        seismic_data = crud.generate_seismic_section(db, job_id, background_tasks, 'actual')
        return seismic_data
    except Exception as e:
        print(e)
        return create_api_response(success=False, message="Failed to generate seismic section visualization", status_code=500)
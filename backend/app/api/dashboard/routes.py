from unittest import result
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Literal
from app.api.dashboard.crud import *
from app.core.security import authorize, get_current_user
from app.api.auth.models import Role
from app.api.job.models import JobType
from app.core.schema_operations import create_api_response
from uuid import UUID
from app.core.database import get_sync_db_session
from fastapi_limiter.depends import RateLimiter
from fastapi_cache.decorator import cache
from app.core.config import settings

router = APIRouter(prefix="/dashboard")

job_type_map = {
    'exploration': JobType.EXPLORATION,
    'development': JobType.DEVELOPMENT,
    'workover': JobType.WORKOVER,
    'wellservice': JobType.WELLSERVICE
}

@router.get("/all/progress/summary", summary="Get Progress (All)", tags=["Dashboard"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_home_dashboard(db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    result = get_dashboard_progress_tablechart(db)
    return create_api_response(success=True, message="Progress retrieved successfully", data=result)

@router.get("/all/progress/{job_type}/plot", summary="Get Job Progress by Job Type", tags=["Dashboard"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def view_job_progress(job_type: str, db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    if job_type not in job_type_map:
        return create_api_response(success=False, message="Invalid job type", status_code=400)
    result = make_job_graph(db, job_type_map[job_type], ['month', 'week'])
    return create_api_response(success=True, message="Job progress data retrieved successfully", data=result)

@router.get("/skk/progress/kkks", summary="Get KKKS Progress (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_kkks_progress_table(db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)):
    result = get_dashboard_kkks_table(db)
    return create_api_response(success=True, message="Progress retrieved successfully", data=result)

@router.get("/kkks/{kkks_id}/{job_type}/summary", summary="Get Summary by KKKS ID and Job Type", tags=["Dasboard KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def get_kkks_job_by_job_type(kkks_id: str, job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    result = get_summary_by_job_type(db, job_type_map[job_type], kkks_id)
    return create_api_response(success=True, message="Summary retrieved successfully", data=result)

@router.get("/kkks/{kkks_id}/{job_type}/jobs", summary="Get Jobs by KKKS ID and Job Type", tags=["Dasboard KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_kkks_job_by_job_type(kkks_id: str, job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    result = get_jobs_by_job_type(db, job_type_map[job_type], kkks_id)
    return create_api_response(success=True, message="Jobs retrieved successfully", data=result)

@router.get("/skk/{job_type}/summary", summary="Get Summary by Job Type (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_kkks_job_by_job_type(job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    result = get_summary_by_job_type(db, job_type_map[job_type])
    return create_api_response(success=True, message="Summary retrieved successfully", data=result)

@router.get("/skk/{job_type}/jobs", summary="Get Jobs by Job Type (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_kkks_job_by_job_type(job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    result = get_jobs_by_job_type(db, job_type_map[job_type], None)
    return create_api_response(success=True, message="Jobs retrieved successfully", data=result)

@router.get("/skk/{job_type}/progress", summary="Get Job Progress by Type (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_job_type_progress(job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    result = get_job_type_dashboard(db, job_type_map[job_type])
    return create_api_response(success=True, message="Job progress retrieved successfully", data=result)

@router.get("/skk/{job_type}/progress/kkks", summary="Get KKKS Job Progress by Type (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_job_type_progress(job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    result = get_kkks_table_by_job_type(db, job_type_map[job_type])
    return create_api_response(success=True, message="Job progress retrieved successfully", data=result)

@router.get("/kkks/{kkks_id}/{job_type}/progress", summary="Get KKKS Job Progress by Type", tags=["Dasboard KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_job_type_progress(kkks_id: str, job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    result = get_job_type_dashboard(db, job_type_map[job_type], kkks_id)
    return create_api_response(success=True, message="Job progress retrieved successfully", data=result)

@router.get("/skk/{job_type}/issues/plot", summary="Get Job Issues Plot by Job Type (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_all_issues_plot_by_job_type(job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    result = get_issues_plot_by_job_type(db, job_type_map[job_type])
    return create_api_response(success=True, message="Issues plot retrieved successfully", data=result)

@router.get("/kkks/{kkks_id}/{job_type}/issues/plot", summary="Get Job Issues Plot by Job Type", tags=["Dasboard KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_all_issues_plot_by_job_type(kkks_id: str, job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    result = get_issues_plot_by_job_type(db, job_type_map[job_type], kkks_id)
    return create_api_response(success=True, message="Issues plot retrieved successfully", data=result)

@router.get("/kkks/{kkks_id}/{job_type}/issues", summary="Get Job Issues by KKKS ID and Job Type", tags=["Dasboard KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_issues_by_kkks_by_job_type(kkks_id: str, job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    result = get_issues_by_job_type(db, job_type_map[job_type], kkks_id)
    return create_api_response(success=True, message="Issues retrieved successfully", data=result)

@router.get("/skk/{job_type}/issues", summary="Get Job Issues by Job Type (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_issues_all_by_job_type(job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    result = get_issues_by_job_type(db, job_type_map[job_type], None)
    return create_api_response(success=True, message="Issues retrieved successfully", data=result)

@router.get("/kkks/{kkks_id}/{job_type}/wrm", summary="Get WRM Progress by KKKS ID and Job Type", tags=["Dasboard KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_wrm_progress_by_kkks_by_job_type(kkks_id: str, job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    result = get_wrm_progress_by_job_type(db, job_type_map[job_type], kkks_id)
    return create_api_response(success=True, message="WRM progress retrieved successfully", data=result)

@router.get("/skk/{job_type}/wrm", summary="Get WRM Progress by Job Type (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
@cache(expire=60)
async def get_wrm_progress_all_by_job_type(job_type: Literal[tuple(job_type_map.keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    result = get_wrm_progress_by_job_type(db, job_type_map[job_type], None)
    return create_api_response(success=True, message="WRM progress retrieved successfully", data=result)

job_phases_map = {
    'summary':{
        'plan': get_plan_summary_by_job_type,
        'operation': get_operation_summary_by_job_type,
        'ppp': get_ppp_summary_by_job_type,
        'co': get_co_summary_by_job_type,
    },
    'jobs':{
        'plan': get_plan_jobs_by_job_type,
        'operation': get_operation_jobs_by_job_type,
        'ppp': get_ppp_jobs_by_job_type,
        'co': get_co_jobs_by_job_type,
    }
}

@router.get("/kkks/{kkks_id}/{job_type}/{phase}/summary", summary="Get Summary by KKKS ID, Job Type and Phase", tags=["Dasboard KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def get_summary_by_kkks_by_job_type_and_phase(kkks_id: str, job_type: Literal[tuple(job_type_map.keys())], phase: Literal[tuple(job_phases_map["summary"].keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    if phase not in job_phases_map["summary"].keys():
        raise HTTPException(status_code=400, detail="Invalid phase")
    result = job_phases_map['summary'][phase](db, job_type_map[job_type], kkks_id)
    return create_api_response(success=True, message="Summary retrieved successfully", data=result)

@router.get("/kkks/{kkks_id}/{job_type}/{phase}/jobs", summary="Get Jobs by KKKS ID, Job Type and Phase", tags=["Dasboard KKKS"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def get_jobs_by_kkks_by_job_type_and_phase(kkks_id: str, job_type: Literal[tuple(job_type_map.keys())], phase: Literal[tuple(job_phases_map["jobs"].keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    if phase not in job_phases_map['jobs'].keys():
        raise HTTPException(status_code=400, detail="Invalid phase")
    result = job_phases_map['jobs'][phase](db, job_type_map[job_type], kkks_id)
    return create_api_response(success=True, message="Jobs retrieved successfully", data=result)

@router.get("/skk/{job_type}/{phase}/summary", summary="Get Summary by KKKS ID, Job Type and Phase (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def get_summary_by_kkks_by_job_type_and_phase(job_type: Literal[tuple(job_type_map.keys())], phase: Literal[tuple(job_phases_map["summary"].keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    if phase not in job_phases_map['summary'].keys():
        raise HTTPException(status_code=400, detail="Invalid phase")
    result = job_phases_map['summary'][phase](db, job_type_map[job_type], None)
    return create_api_response(success=True, message="Summary retrieved successfully", data=result)

@router.get("/skk/{job_type}/{phase}/jobs", summary="Get Jobs by Job Type and Phase (SKK Only)", tags=["Dasboard SKK"], dependencies=[Depends(RateLimiter(times=settings.LIMITER_TIMES, seconds=settings.LIMITER_SECONDS))])
@authorize(role=[Role.Admin, Role.KKKS])
async def get_jobs_by_job_type_and_phase(job_type: Literal[tuple(job_type_map.keys())], phase: Literal[tuple(job_phases_map["jobs"].keys())], db: Session = Depends(get_sync_db_session), user = Depends(get_current_user)): # type: ignore
    if job_type not in job_type_map.keys():
        raise HTTPException(status_code=400, detail="Invalid job type")
    if phase not in job_phases_map["jobs"].keys():
        raise HTTPException(status_code=400, detail="Invalid phase")
    result = job_phases_map['jobs'][phase](db, job_type_map[job_type], None)
    return create_api_response(success=True, message="Jobs retrieved successfully", data=result)

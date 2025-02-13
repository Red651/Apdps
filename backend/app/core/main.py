from app.api.auth import routes as auth_routes
from app.api.job import routes as job_routes
from app.api.spatial import routes as spatial_routes
from app.api.well import routes as well_routes
from app.api.utils import routes as utils_routes
from app.api.dashboard import routes as dashboard_routes
from app.api.visualize import routes as visualization_routes
from app.api.rig import routes as rig_routes
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.core.error_handlers import (
    custom_http_exception_handler, 
    custom_exception_handler, 
    sqlalchemy_exception_handler,
    # custom_request_validation_exception_handler,
    custom_starlette_http_exception_handler,
    # validation_exception_handler
)
from sqlalchemy.exc import SQLAlchemyError
from fastapi import FastAPI, HTTPException, Request, Response, status
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
import os
from fastapi.middleware.wsgi import WSGIMiddleware
from app.api.auth.administration.admin_app import ADMIN_APP
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
import time
import redis.asyncio as redis
from fastapi_limiter import FastAPILimiter
from math import ceil
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from app.core.middlewares import (
    GZipMiddleware,
    CustomHeaderMiddleware,
    TimeoutMiddleware,
    ProxyHeadersMiddleware,
    RouterLoggingMiddleware
)
from app.core.external.app import external_app

async def key_builder(request: Request):
    key = ":".join([
        request.method.lower(),
        request.url.path,
        request.headers.get('authorization', ""),
        repr(sorted(request.query_params.items())),
    ])
    return key

async def custom_callback(request: Request, response: Response, pexpire: int):
    """
    default callback when too many requests
    :param request:
    :param pexpire: The remaining milliseconds
    :param response:
    :return:
    """
    expire = ceil(pexpire / 1000)

    raise HTTPException(
        status.HTTP_429_TOO_MANY_REQUESTS,
        f"Too Many Requests. Retry after {expire} seconds.",
        headers={"Retry-After": str(expire)},
    )
    
async def request_key_builder(
    func,
    namespace: str = "",
    request: Request = None,
    response: Response = None,
    *args,
    **kwargs,
):
    key = await key_builder(request)
    return namespace + ":" + key

@asynccontextmanager
async def lifespan(app: FastAPI):

    os.makedirs(settings.upload_dir, exist_ok=True)
    redis_connection = redis.from_url(settings.REDIS_URL, encoding="utf8")
    await FastAPILimiter.init(
        redis=redis_connection,
        identifier=key_builder,
        http_callback=custom_callback,
        prefix="apdps-limiter",
    )
    FastAPICache.init(
        RedisBackend(redis_connection), 
        prefix="apdps-cache",
        cache_status_header="X-ApDPS-Cache",
        key_builder=request_key_builder
    )
    yield
    await FastAPILimiter.close()
    
app = FastAPI(
    title=settings.PROJECT_NAME,
    # openapi_url=f"{settings.ROOT_PATH}/openapi.json",
    lifespan=lifespan,
    root_path=settings.ROOT_PATH
)

# app.add_middleware(
#     RouterLoggingMiddleware,
#     logger=logging.getLogger(__name__)
# )
# app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compress responses larger than 1000 bytes
# app.add_middleware(CustomHeaderMiddleware)
app.add_middleware(TimeoutMiddleware, timeout=20)
# app.add_middleware(ProxyHeadersMiddleware)

if settings.APP_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "*"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/admin", ADMIN_APP)
app.mount(settings.EXTERNAL_PAGES_PATH, WSGIMiddleware(external_app.server))

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# app.add_exception_handler(HTTPException, custom_http_exception_handler)
# app.add_exception_handler(Exception, custom_exception_handler)
# app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
# app.add_exception_handler(StarletteHTTPException, custom_starlette_http_exception_handler)

app.include_router(auth_routes.router)
app.include_router(job_routes.router)
app.include_router(well_routes.router)
app.include_router(rig_routes.router)
app.include_router(spatial_routes.router)
app.include_router(utils_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(visualization_routes.router)

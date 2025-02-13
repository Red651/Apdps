from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import http_exception_handler
from sqlalchemy.exc import SQLAlchemyError
from fastapi.exceptions import RequestValidationError, WebSocketRequestValidationError
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from pydantic import ValidationError
import logging
from starlette.exceptions import HTTPException as StarletteHTTPException
from .schema_operations import parse_validation_error
from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler,
)


class AreaDoesntExist(Exception):...

class FieldDoesntExist(Exception):...

class WellDoesntExist(Exception):...

async def custom_starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail}
    )

async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail}
    )

async def custom_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An unexpected error occurred.", "error": str(exc)}
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):

    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "A database error occurred.", "error": str(exc)}
    )

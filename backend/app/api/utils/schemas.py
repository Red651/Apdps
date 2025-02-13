from typing import List
from app.api.job.models import *
from uuid import UUID
from app.core.schema_operations import BaseModel

class FileInfo(BaseModel):
    id: UUID
    filename: str
    file_location: str



class UploadResponse(BaseModel):
    message: str
    file_info: FileInfo

class MultiUploadResponse(BaseModel):
    message: str
    files_info: List[FileInfo]

class TabularData(BaseModel):
    headers: List[str]
    records: List[dict]

class DrillingOperationResponse(BaseModel):
    operation: DrillingOperation

class BHAResponse(BaseModel):
    bhacomponent: BHAComponentType

class EnumResponse(BaseModel):
    name: str
    value: str

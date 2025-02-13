from pydantic import EmailStr
from app.api.auth.models import Role
from typing import Optional
from app.api.spatial.schemas import GetAreaSchema
from uuid import UUID
from app.core.schema_operations import BaseModel

#KKKS
class KKKSBase(BaseModel):
    name: str
    area: GetAreaSchema

class CreateKKKS(KKKSBase):
    pass

class GetKKKS(KKKSBase):
    id: UUID

#User
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Role

class CreateKKKSUser(UserBase):
    kkks_id: str
    password: str

class CreateAdmin(UserBase):
    password: str

class GetUser(UserBase):
    id: UUID
        
class GetKKKSUser(GetUser):
    id: UUID
    kkks_id: str
    kkks: GetKKKS

class VerifyUser(GetUser):
    verfied_status: bool

from pydantic import Field, model_validator
from typing import Optional, List
from datetime import date
from app.api.well.models import *
from app.core.constants import UnitType
from uuid import UUID
from app.core.schema_operations import BaseModel
from app.api.rig.models import *

class RigBase(BaseModel):
    
    rig_name: str = Field(..., serialization_alias='Rig Name')
    rig_type: RigType = Field(..., serialization_alias='Rig Type')
    rig_horse_power: int = Field(..., serialization_alias='Rig Horse Power')
    
    class Meta:
        orm_model = Rig

class GetRig(RigBase):
    
    id: UUID

class CreateRig(RigBase):
    
    class Meta:
        orm_model = Rig

class UpdateRig(RigBase):
    
    class Meta:
        orm_model = Rig
        
class RigOptionsList(BaseModel):
    value: UUID
    name: str
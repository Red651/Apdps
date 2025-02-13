from app.core.schema_operations import BaseModel
from app.api.spatial.models import *
from typing import List, Optional
from uuid import UUID

class CreateFieldSchema(BaseModel):

    name: str
    area_id: str
    # geojson: str

# class CreateStratUnitSchema(BaseModel):
    
#     area_id: str
    
#     strat_unit_name: str
#     strat_type: StratType
#     strat_unit_type: StratUnitType
#     strat_petroleum_system: PetroleumSystem
    
#     remark: str

class GetAreaSchema(BaseModel):
    id: UUID
    label: str
    name: str
    phase: AreaPhase
    type: AreaType
    position: AreaPosition
    production_status: AreaProductionStatus
    region: AreaRegion
    # geojson: Optional[str]
    

    
class CreateAreaSchema(BaseModel):
    
    label: str
    name: str
    phase: AreaPhase
    type: AreaType
    position: AreaPosition
    production_status: AreaProductionStatus
    region: AreaRegion
    geojson: str
    
class GetFieldSchema(CreateFieldSchema):
    id: UUID

# class GetStratUnitSchema(CreateStratUnitSchema):
#     id: UUID
    
# class GetAreaSchema(CreateAreaSchema):
    
#     id: UUID
#     fields: List[GetFieldSchema]
#     strat_units: List[GetStratUnitSchema]

class AreaResponse(BaseModel):
    name: str
    value: UUID



class FieldResponse(BaseModel):
    name: str
    value: UUID



class WellInstanceResponse(BaseModel):
    id: UUID
    well_name: str



# class StratUnitResponse(BaseModel):
#     id: UUID
#     strat_unit_info: str


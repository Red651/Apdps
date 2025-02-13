from typing import List, Union

from app.api.job.models import *
from app.api.well.schemas import *
# from app.core.schema_operations import AllRequired
from uuid import UUID
from pydantic import Field, EmailStr, field_serializer
from typing import Optional
from datetime import datetime
from datetime import date as pydate
from decimal import Decimal
from app.core.schema_operations import BaseModel, generate_custom_model
from pydantic import model_validator

from app.core.constants import UnitType

class WRMBase(BaseModel):
    
    @model_validator(mode='before')
    @classmethod
    def validate_percentage(cls,v):
        if isinstance(v, dict):
            for key,value in v.items():
                if 'wrm_' in key:
                    if isinstance(v[key], str):
                        v[key] = int(value.replace('%', '').strip())
        return v
    
    # @model_validator(mode='after')
    # def wrm_integer_to_percentage(self):
    #     for key,value in self.__dict__.items():
    #         if 'wrm_' in key:
    #             self.__dict__[key] = f'{value}%'
    #     return self

class ExplorationWRM(WRMBase):
    wrm_pembebasan_lahan: Optional[int] = Field(default=None, serialization_alias='Pembebasan Lahan')
    wrm_ippkh: Optional[int] = Field(default=None, serialization_alias='IPPKH')
    wrm_ukl_upl: Optional[int] = Field(default=None, serialization_alias='UKL/UPL')
    wrm_amdal: Optional[int] = Field(default=None, serialization_alias='Amdal')
    wrm_pengadaan_rig: Optional[int] = Field(default=None, serialization_alias='Pengadaan Rig')
    wrm_pengadaan_drilling_services: Optional[int] = Field(default=None, serialization_alias='Pengadaan Drilling Services')
    wrm_pengadaan_lli: Optional[int] = Field(default=None, serialization_alias='Pengadaan LLI')
    wrm_persiapan_lokasi: Optional[int] = Field(default=None, serialization_alias='Persiapan Lokasi')
    wrm_internal_kkks: Optional[int] = Field(default=None, serialization_alias='Internal KKKS')
    wrm_evaluasi_subsurface: Optional[int] = Field(default=None, serialization_alias='Evaluasi Subsurface')

class DevelopmentWRM(WRMBase):
    wrm_pembebasan_lahan: Optional[int] = Field(default=None, serialization_alias='Pembebasan Lahan')
    wrm_ippkh: Optional[int] = Field(default=None, serialization_alias='IPPKH')
    wrm_ukl_upl: Optional[int] = Field(default=None, serialization_alias='UKL/UPL')
    wrm_amdal: Optional[int] = Field(default=None, serialization_alias='Amdal')
    wrm_cutting_dumping: Optional[int] = Field(default=None, serialization_alias='Cutting/Dumping')
    wrm_pengadaan_rig: Optional[int] = Field(default=None, serialization_alias='Pengadaan Rig')
    wrm_pengadaan_drilling_services: Optional[int] = Field(default=None, serialization_alias='Pengadaan Drilling Services')
    wrm_pengadaan_lli: Optional[int] = Field(default=None, serialization_alias='Pengadaan LLI')
    wrm_persiapan_lokasi: Optional[int] = Field(default=None, serialization_alias='Persiapan Lokasi')
    wrm_internal_kkks: Optional[int] = Field(default=None, serialization_alias='Internal KKKS')
    wrm_evaluasi_subsurface: Optional[int] = Field(default=None, serialization_alias='Evaluasi Subsurface')

class WorkoverWRM(WRMBase):
    wrm_internal_kkks: Optional[int] = Field(default=None, serialization_alias='Internal KKKS')
    wrm_pengadaan_equipment: Optional[int] = Field(default=None, serialization_alias='Pengadaan Equipment')
    wrm_pengadaan_services: Optional[int] = Field(default=None, serialization_alias='Pengadaan Services')
    wrm_pengadaan_handak: Optional[int] = Field(default=None, serialization_alias='Pengadaan Handak')
    wrm_pengadaan_octg: Optional[int] = Field(default=None, serialization_alias='Pengadaan OCTG')
    wrm_pengadaan_lli: Optional[int] = Field(default=None, serialization_alias='Pengadaan LLI')
    wrm_pengadaan_artificial_lift: Optional[int] = Field(default=None, serialization_alias='Pengadaan Artificial Lift')
    wrm_sumur_berproduksi: Optional[int] = Field(default=None, serialization_alias='Sumur Berproduksi')
    wrm_fasilitas_produksi: Optional[int] = Field(default=None, serialization_alias='Fasilitas Produksi')
    wrm_persiapan_lokasi: Optional[int] = Field(default=None, serialization_alias='Persiapan Lokasi')
    wrm_well_integrity: Optional[int] = Field(default=None, serialization_alias='Well Integrity')

class WellServiceWRM(WRMBase):
    wrm_internal_kkks: Optional[int] = Field(default=None, serialization_alias='Internal KKKS')
    wrm_pengadaan_equipment: Optional[int] = Field(default=None, serialization_alias='Pengadaan Equipment')
    wrm_pengadaan_services: Optional[int] = Field(default=None, serialization_alias='Pengadaan Services')
    wrm_pengadaan_handak: Optional[int] = Field(default=None, serialization_alias='Pengadaan Handak')
    wrm_pengadaan_octg: Optional[int] = Field(default=None, serialization_alias='Pengadaan OCTG')
    wrm_pengadaan_lli: Optional[int] = Field(default=None, serialization_alias='Pengadaan LLI')
    wrm_pengadaan_artificial_lift: Optional[int] = Field(default=None, serialization_alias='Pengadaan Artificial Lift')
    wrm_sumur_berproduksi: Optional[int] = Field(default=None, serialization_alias='Sumur Berproduksi')
    wrm_fasilitas_produksi: Optional[int] = Field(default=None, serialization_alias='Fasilitas Produksi')
    wrm_persiapan_lokasi: Optional[int] = Field(default=None, serialization_alias='Persiapan Lokasi')
    wrm_well_integrity: Optional[int] = Field(default=None, serialization_alias='Well Integrity')

class WBCustomSEventSchema(BaseModel):
    event: str = Field(..., serialization_alias='Event')
    start_date: pydate = Field(..., serialization_alias='Start Date')
    end_date: pydate = Field(..., serialization_alias='End Date')
    remarks: Optional[str] = Field(default=None, serialization_alias='Remarks')
    
    class Meta:
        orm_model = WBSCustomEvent

class WBSWRMEventSchema(BaseModel):
    start_date: pydate = Field(..., serialization_alias='Start Date')
    end_date: pydate = Field(..., serialization_alias='End Date')
    
    class Meta:
        orm_model = WBSWRMEvent
    
WRMWBSExploration = generate_custom_model(
    ExplorationWRM,
    Optional[WBSWRMEventSchema],
    'WRMWBSExploration'
)

WRMWBSDevelopment = generate_custom_model(
    DevelopmentWRM,
    Optional[WBSWRMEventSchema],
    'WRMWBSDevelopment'
)

WRMWBSWorkover = generate_custom_model(
    WorkoverWRM,
    Optional[WBSWRMEventSchema],
    'WRMWBSWorkover'
)

WRMWBSWellService = generate_custom_model(
    WellServiceWRM,
    Optional[WBSWRMEventSchema],
    'WRMWBSWellService'
)

WRMExplorationBool = generate_custom_model(
    ExplorationWRM,
    Optional[bool],
    'WRMExplorationBool'
)

WRMDevelopmentBool = generate_custom_model(
    DevelopmentWRM,
    Optional[bool],
    'WRMDevelopmentBool'
)

WRMWorkoverBool = generate_custom_model(
    WorkoverWRM,
    Optional[bool],
    'WRMWorkoverBool'
)

WRMWellServiceBool = generate_custom_model(
    WellServiceWRM,
    Optional[bool],
    'WRMWellServiceBool'
)

WRMExplorationUnion = generate_custom_model(
    ExplorationWRM,
    Optional[Union[bool,int]],
    'WRMExplorationUnion'
)

WRMDevelopmentUnion = generate_custom_model(
    DevelopmentWRM,
    Optional[Union[bool,int]],
    'WRMDevelopmentUnion'
)

WRMWorkoverUnion = generate_custom_model(
    WorkoverWRM,
    Optional[Union[bool,int]],
    'WRMWorkoverUnion'
)

WRMWellServiceUnion = generate_custom_model(
    WellServiceWRM,
    Optional[Union[bool,int]],
    'WRMWellServiceUnion'
)

WRMExplorationInteger = generate_custom_model(
    ExplorationWRM,
    Optional[int],
    'WRMExplorationInteger'
)

WRMDevelopmentInteger = generate_custom_model(
    DevelopmentWRM,
    Optional[int],
    'WRMDevelopmentInteger'
)

WRMWorkoverInteger = generate_custom_model(
    WorkoverWRM,
    Optional[int],
    'WRMWorkoverInteger'
)

WRMWellServiceInteger = generate_custom_model(
    WellServiceWRM,
    Optional[int],
    'WRMWellServiceInteger'
)

class GetExplorationWRM(ExplorationWRM):
    wbs: Optional[WRMWBSExploration] = Field(default=None, serialization_alias='Work Breakdown Structure')
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

class GetDevelopmentWRM(DevelopmentWRM):
    wbs: Optional[WRMWBSDevelopment] = Field(default=None, serialization_alias='Work Breakdown Structure')
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

class GetWorkoverWRM(WorkoverWRM):
    wbs: Optional[WRMWBSWorkover] = Field(default=None, serialization_alias='Work Breakdown Structure')
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

class GetWellServiceWRM(WellServiceWRM):
    wbs: Optional[WRMWBSWellService] = Field(default=None, serialization_alias='Work Breakdown Structure')
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

class WBSJobBase(BaseModel):
    events: Optional[List[WBCustomSEventSchema]] = Field(default=None, serialization_alias='Events')

class WBSExplorationSchema(WRMWBSExploration, WBSJobBase):
    class Meta:
        orm_model = WorkBreakdownStructureDrilling

class WBSDevelopmentSchema(WRMWBSDevelopment, WBSJobBase):
    class Meta:
        orm_model = WorkBreakdownStructureDrilling
    
class WBSWorkoverSchema(WRMWBSWorkover, WBSJobBase):
    class Meta:
        orm_model = WorkBreakdownStructureWOWS
        
class WBSWellServiceSchema(WRMWBSWellService, WBSJobBase):
    class Meta:
        orm_model = WorkBreakdownStructureWOWS

class JobHazardBase(BaseModel):

    hazard_type: HazardType = Field(..., serialization_alias='Hazard Type')
    hazard_description: Optional[str] = Field(default=None, serialization_alias='Hazard Description')
    severity: Severity = Field(..., serialization_alias='Severity')
    mitigation: str = Field(..., serialization_alias='Mitigation')
    remark: Optional[str] = Field(default=None, serialization_alias='Remark')
    
    class Meta:
        orm_model = JobHazard

class JobDocumentBase(BaseModel):
    
    file_id: UUID = Field(..., serialization_alias='file_id')
    filename: Optional[str] = Field(default=None, serialization_alias='Filename')
    document_type: JobDocumentType = Field(..., serialization_alias='Document Type')
    remark: Optional[str] = Field(default=None, serialization_alias='Remark')

    @computed_field
    @property
    def download_path(self) -> str:
        return f'/utils/download/file/{self.file_id}'

    @computed_field
    @property
    def delete_path(self) -> str:
        return f'/utils/delete/file/{self.file_id}'
    
    class Meta:
        orm_model = JobDocument

class JobOperationDayBase(BaseModel):

    unit_type: UnitType = Field(..., serialization_alias='Unit Type')
    phase: str = Field(..., serialization_alias='Phase')
    depth_datum: DepthDatum = Field(..., serialization_alias='Depth Datum')
    depth_in: float = Field(..., serialization_alias='Depth In')
    depth_out: float = Field(..., serialization_alias='Depth Out')
    operation_days: float = Field(..., serialization_alias='Operation Days')
    
    class Meta:
        orm_model = JobOperationDay

class JobProjectManagementTeamBase(BaseModel):

    company: str = Field(..., serialization_alias='Company')
    position: str = Field(..., serialization_alias='Position')
    name: str = Field(..., serialization_alias='Name')
    email: Optional[EmailStr] = Field(default=None, serialization_alias='Email')
    contact: Optional[str] = Field(default=None, serialization_alias='Contact')
    
    class Meta:
        orm_model = JobProjectManagementTeam

class JobEquipmentBase(BaseModel):

    equipment: str = Field(..., serialization_alias='Equipment')
    vendor: str = Field(..., serialization_alias='Vendor')
    
    class Meta:
        orm_model = JobEquipment
    
class JobHSEAspectBase(BaseModel):
    
    near_miss: int = Field(..., serialization_alias='Near Miss')
    fatality: int = Field(..., serialization_alias='Fatality')
    spill: int = Field(..., serialization_alias='Spill')
    unsafe_condition: int = Field(..., serialization_alias='Unsafe Condition')
    unsafe_action: int = Field(..., serialization_alias='Unsafe Action')
    man_hour: int = Field(..., serialization_alias='Man Hour')
    
    class Meta:
        orm_model = JobHSEAspect

class JobPlanInstanceBase(BaseModel):
    
    start_date: pydate = Field(..., serialization_alias='Start Date')
    end_date: pydate = Field(..., serialization_alias='End Date')
    total_budget: Decimal = Field(default=None, max_digits=10, decimal_places=2, serialization_alias='Total Budget')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')
    
    job_operation_days: Optional[List[JobOperationDayBase]] = Field(default=None, serialization_alias='Job Operation Days')
    job_hazards: Optional[List[JobHazardBase]] = Field(default=None, serialization_alias='Job Hazards')
    job_documents: Optional[List[JobDocumentBase]] = Field(default=None, serialization_alias='Job Documents')
    job_project_management_team: Optional[List[JobProjectManagementTeamBase]] = Field(default=None, serialization_alias='Project Management Team')
    job_equipments: Optional[List[JobEquipmentBase]] = Field(default=None, serialization_alias='Job Equipments')
    job_hse_aspect: Optional[JobHSEAspectBase] = Field(default=None, serialization_alias='Job HSE Aspect')
    
class JobActualInstanceBase(BaseModel):
    
    # start_date: Optional[date] = Field(default=None, serialization_alias='Start Date')
    # end_date: Optional[date] = Field(default=None, serialization_alias='End Date')
    total_budget: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, serialization_alias='Total Budget')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')
    
    job_operation_days: Optional[List[JobOperationDayBase]] = Field(default=None, serialization_alias='Job Operation Days')
    job_hazards: Optional[List[JobHazardBase]] = Field(default=None, serialization_alias='Job Hazards')
    job_documents: Optional[List[JobDocumentBase]] = Field(default=None, serialization_alias='Job Documents')
    job_project_management_team: Optional[List[JobProjectManagementTeamBase]] = Field(default=None, serialization_alias='Project Management Team')
    job_equipments: Optional[List[JobEquipmentBase]] = Field(default=None, serialization_alias='Job Equipments')
    job_hse_aspect: Optional[JobHSEAspectBase] = Field(default=None, serialization_alias='Job HSE Aspect')

class CreatePlanExploration(JobPlanInstanceBase, WRMExplorationBool):
    
    work_breakdown_structure: Optional[WBSExplorationSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')

    well: CreatePlanWellExploration = Field(..., serialization_alias='Well')

    class Meta:
        orm_model = PlanExploration

class CreateDummyPlanExploration(CreatePlanExploration):
    
    well: CreateDummyPlanWell = Field(..., serialization_alias='Well')
        
class CreatePlanDevelopment(JobPlanInstanceBase, WRMDevelopmentBool):
    
    work_breakdown_structure: Optional[WBSDevelopmentSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')

    well: CreatePlanWellDevelopment = Field(..., serialization_alias='Well')

    class Meta:
        orm_model = PlanDevelopment

class GetPlanExploration(CreatePlanExploration):
    well: GetUpdatePlanWellExploration

class GetPlanDevelopment(CreatePlanDevelopment):
    well: GetUpdatePlanWellDevelopment

class CreateDummyPlanDevelopment(CreatePlanDevelopment):
    
    well: CreateDummyPlanWell = Field(..., serialization_alias='Well')
        
class CreatePlanWorkover(JobPlanInstanceBase, WRMWorkoverBool):
    
    work_breakdown_structure: Optional[WBSWorkoverSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    equipment: str = Field(..., serialization_alias='Equipment')
    equipment_specifications: str = Field(..., serialization_alias='Equipment Specifications')
    
    well_id: str = Field(..., serialization_alias='well_id')
    
    job_category: WorkoverJobCategory = Field(..., serialization_alias='Job Category')
    job_description: str = Field(..., serialization_alias='Job Description')
    
    #current
    onstream_oil: Decimal = Field(..., serialization_alias='Onstream Oil')
    onstream_gas: Decimal = Field(..., serialization_alias='Onstream Gas')
    onstream_water_cut: Decimal = Field(..., serialization_alias='Onstream Water Cut')
    
    #target
    target_oil: Decimal = Field(..., serialization_alias='Target Oil')
    target_gas: Decimal = Field(..., serialization_alias='Target Gas')
    target_water_cut: Decimal = Field(..., serialization_alias='Target Water Cut')
    
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')

    class Meta:
        orm_model = PlanWorkover

class CreatePlanWellService(JobPlanInstanceBase, WRMWellServiceBool):
    
    work_breakdown_structure: Optional[WBSWellServiceSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    equipment: str = Field(..., serialization_alias='Equipment')
    equipment_specifications: str = Field(..., serialization_alias='Equipment Specifications')
    
    well_id: str = Field(..., serialization_alias='well_id')
    
    job_category: WellServiceJobCategory  = Field(..., serialization_alias='Job Category')
    job_description: str = Field(..., serialization_alias='Job Description')
    
    #current
    onstream_oil: Decimal = Field(..., serialization_alias='Onstream Oil')
    onstream_gas: Decimal = Field(..., serialization_alias='Onstream Gas')
    onstream_water_cut: Decimal = Field(..., serialization_alias='Onstream Water Cut')
    
    #target
    target_oil: Decimal = Field(..., serialization_alias='Target Oil')
    target_gas: Decimal = Field(..., serialization_alias='Target Gas')
    target_water_cut: Decimal = Field(..., serialization_alias='Target Water Cut')
    
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')

    class Meta:
        orm_model = PlanWellService

class CreateActualExploration(JobActualInstanceBase, WRMExplorationInteger):
    
    work_breakdown_structure: Optional[WBSExplorationSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')

    well: CreateActualWell = Field(..., serialization_alias="Well")

    class Meta:
        orm_model = ActualExploration

class CreateDummyActualExploration(CreateActualExploration):
    
    start_date: Optional[date] = Field(default=None, serialization_alias='Start Date')
    end_date: Optional[date] = Field(default=None, serialization_alias='End Date')
    
    well: CreateActualWellDummy = Field(..., serialization_alias="Well")

class GetUpdateActualExploration(JobActualInstanceBase, WRMExplorationUnion):
    
    work_breakdown_structure: Optional[WBSExplorationSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

    well: GetActualWellExploration = Field(..., serialization_alias="Well")
    
    class Meta:
        orm_model = ActualDevelopment

class UpdateActualExploration(JobActualInstanceBase):
    
    work_breakdown_structure: Optional[WBSExplorationSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

    well: Optional[UpdateActualWellExploration] = Field(..., serialization_alias='Well')

    class Meta:
        orm_model = ActualDevelopment

class CreateActualDevelopment(JobActualInstanceBase, WRMDevelopmentInteger):
    
    work_breakdown_structure: Optional[WBSDevelopmentSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

    well: CreateActualWell = Field(..., serialization_alias='Well')

    class Meta:
        orm_model = ActualDevelopment

class CreateDummyActualDevelopment(CreateActualDevelopment):
    
    start_date: Optional[date] = Field(default=None, serialization_alias='Start Date')
    end_date: Optional[date] = Field(default=None, serialization_alias='End Date')
    
    well: CreateActualWellDummy = Field(..., serialization_alias='Well')
 
class GetUpdateActualDevelopment(JobActualInstanceBase, WRMDevelopmentUnion):
    
    work_breakdown_structure: Optional[WBSDevelopmentSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

    well: GetActualWellDevelpoment = Field(..., serialization_alias='Well')

    class Meta:
        orm_model = ActualDevelopment

class UpdateActualDevelopment(JobActualInstanceBase):
    
    work_breakdown_structure: Optional[WBSDevelopmentSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')

    well: Optional[UpdateActualWellDevelopment] = Field(..., serialization_alias='Well')

    class Meta:
        orm_model = ActualDevelopment

class CreateActualWorkover(JobActualInstanceBase, WRMWorkoverInteger):
    
    work_breakdown_structure: Optional[WBSWorkoverSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')
    
    equipment: Optional[str] = Field(default=None, serialization_alias='Equipment')
    equipment_specifications: Optional[str] = Field(default=None, serialization_alias='Equipment Specifications')
    
    well_id: Optional[UUID] = Field(default=None, serialization_alias='well_id')
    
    job_category: Optional[WorkoverJobCategory] = Field(default=None, serialization_alias='Job Category')
    job_description: Optional[str] = Field(default=None, serialization_alias='Job Description')
    
    #target
    onstream_oil: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Oil')
    onstream_gas: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Gas')
    onstream_water_cut: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Water Cut')
    
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')
    
    class Meta:
        orm_model = ActualWorkover

class CreateDummyActualWorkover(CreateActualWorkover):

    start_date: Optional[date] = Field(default=None, serialization_alias='Start Date')
    end_date: Optional[date] = Field(default=None, serialization_alias='End Date')

class GetUpdateActualWorkover(JobActualInstanceBase, WRMWorkoverUnion):
    
    work_breakdown_structure: Optional[WBSWorkoverSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')
    
    equipment: Optional[str] = Field(default=None, serialization_alias='Equipment')
    equipment_specifications: Optional[str] = Field(default=None, serialization_alias='Equipment Specifications')
    
    well_id: Optional[UUID] = Field(default=None, serialization_alias='well_id')
    
    job_category: Optional[WorkoverJobCategory] = Field(default=None, serialization_alias='Job Category')
    job_description: Optional[str] = Field(default=None, serialization_alias='Job Description')
    
    #target
    onstream_oil: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Oil')
    onstream_gas: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Gas')
    onstream_water_cut: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Water Cut')
    
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')

    class Meta:
        orm_model = ActualWorkover

class UpdateActualWorkover(JobActualInstanceBase):
    
    work_breakdown_structure: Optional[WBSWorkoverSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')
    
    equipment: Optional[str] = Field(default=None, serialization_alias='Equipment')
    equipment_specifications: Optional[str] = Field(default=None, serialization_alias='Equipment Specifications')
    
    well_id: Optional[UUID] = Field(default=None, serialization_alias='well_id')
    
    job_category: Optional[WorkoverJobCategory] = Field(default=None, serialization_alias='Job Category')
    job_description: Optional[str] = Field(default=None, serialization_alias='Job Description')
    
    #target
    onstream_oil: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Oil')
    onstream_gas: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Gas')
    onstream_water_cut: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Water Cut')
    
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')
    
    class Meta:
        orm_model = ActualWorkover
            
class CreateActualWellService(JobActualInstanceBase, WRMWellServiceInteger):
    
    work_breakdown_structure: Optional[WBSWellServiceSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')
    
    equipment: Optional[str] = Field(default=None, serialization_alias='Equipment')
    equipment_specifications: Optional[str] = Field(default=None, serialization_alias='Equipment Specifications')
    
    well_id: Optional[UUID] = Field(default=None, serialization_alias='well_id')
    
    job_category: Optional[WellServiceJobCategory] = Field(default=None, serialization_alias='Job Category')
    job_description: Optional[str] = Field(default=None, serialization_alias='Job Description')
    
    #target
    onstream_oil: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Oil')
    onstream_gas: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Gas')
    onstream_water_cut: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Water Cut')
    
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')
    
    class Meta:
        orm_model = ActualWellService

class CreateDummyActualWellService(CreateActualWellService):

    start_date: Optional[date] = Field(default=None, serialization_alias='Start Date')
    end_date: Optional[date] = Field(default=None, serialization_alias='End Date')

class GetUpdateActualWellService(JobActualInstanceBase, WRMWellServiceUnion):
    
    work_breakdown_structure: Optional[WBSWellServiceSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')
    
    equipment: Optional[str] = Field(default=None, serialization_alias='Equipment')
    equipment_specifications: Optional[str] = Field(default=None, serialization_alias='Equipment Specifications')
    
    well_id: Optional[UUID] = Field(default=None, serialization_alias='well_id')
    
    job_category: Optional[WellServiceJobCategory] = Field(default=None, serialization_alias='Job Category')
    job_description: Optional[str] = Field(default=None, serialization_alias='Job Description')
    
    #target
    onstream_oil: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Oil')
    onstream_gas: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Gas')
    onstream_water_cut: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Water Cut')
    
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')

    class Meta:
        orm_model = ActualWellService

class UpdateActualWellService(JobActualInstanceBase):
    
    work_breakdown_structure: Optional[WBSWellServiceSchema] = Field(default=None, serialization_alias='Work Breakdown Structure')
    
    rig_id: Optional[str] = Field(default=None, serialization_alias='rig_id')
    
    equipment: Optional[str] = Field(default=None, serialization_alias='Equipment')
    equipment_specifications: Optional[str] = Field(default=None, serialization_alias='Equipment Specifications')
    
    well_id: Optional[UUID] = Field(default=None, serialization_alias='well_id')
    
    job_category: Optional[WellServiceJobCategory] = Field(default=None, serialization_alias='Job Category')
    job_description: Optional[str] = Field(default=None, serialization_alias='Job Description')
    
    #target
    onstream_oil: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Oil')
    onstream_gas: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Gas')
    onstream_water_cut: Optional[Decimal] = Field(default=None, serialization_alias='Onstream Water Cut')
    
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')
    
    class Meta:
        orm_model = ActualWellService

class JobBase(BaseModel):
    
    #kkks information
    area_id: str = Field(..., serialization_alias='area_id')
    field_id: str = Field(..., serialization_alias='field_id')
   
    #contract information
    contract_type: ContractType = Field(..., serialization_alias='Contract Type')
    
    afe_number: Optional[str] = Field(..., serialization_alias="AFE Number")
    wpb_year: int = Field(..., serialization_alias='WP&B Year')
    
    @model_validator(mode='after')
    def validate_afe_number(self):
        if self.contract_type is ContractType.COST_RECOVERY and self.afe_number is None:
            raise ValueError('AFE Number is required when Contract Type is Cost Recovery')
        else:
            return self

    
    class Meta:
        orm_model = Job

class GetJobBase(JobBase):
    
    area_name: str = Field(..., description="Area Name")
    field_name: str = Field(..., description="Field Name")

class CreateExplorationJob(JobBase):
    
    job_plan: CreatePlanExploration = Field(..., serialization_alias='Job Plan')

class CreateDummyExplorationJob(CreateExplorationJob):
    
    job_plan: CreateDummyPlanExploration = Field(..., serialization_alias='Job Plan')
    
class CreateDevelopmentJob(JobBase):
    
    job_plan: CreatePlanDevelopment = Field(..., serialization_alias='Job Plan')

class GetDevelopmentJob(CreateDevelopmentJob):

    job_plan: GetPlanDevelopment = Field(..., serialization_alias='Job Plan')

class GetExplorationJob(CreateExplorationJob):
    
    job_plan: GetPlanExploration = Field(..., serialization_alias='Job Plan')

class CreateDummyDevelopmentJob(CreateDevelopmentJob):
    
    job_plan: CreateDummyPlanDevelopment = Field(..., serialization_alias='Job Plan')

class CreateWorkoverJob(JobBase):       
    
    job_plan: CreatePlanWorkover = Field(..., serialization_alias='Job Plan')

class CreateWellServiceJob(JobBase):
    
    job_plan: CreatePlanWellService = Field(..., serialization_alias='Job Plan')

class GetWorkoverJob(CreateWorkoverJob):
    
    pass

class GetWellServiceJob(CreateWellServiceJob):

    pass

class GetUpdateActualExplorationJob(GetJobBase):
    actual_job: GetUpdateActualExploration

class GetUpdateActualDevelopmentJob(GetJobBase):
    actual_job: GetUpdateActualDevelopment

class GetUpdateActualWorkoverJob(GetJobBase):
    actual_job: GetUpdateActualWorkover

class GetUpdateActualWellServiceJob(GetJobBase):
    actual_job: GetUpdateActualWellService
    
class SuratTajakSchema(BaseModel):
    
    file_id: UUID = Field(..., serialization_alias='file_id')
    filename: Optional[str] = Field(default=None, serialization_alias='Filename')
    nomor_surat: str = Field(..., serialization_alias='Nomor Surat')
    tanggal_mulai: pydate = Field(..., serialization_alias='Tanggal Mulai')

class JobIssueCreate(BaseModel):

    date_time: datetime = Field(..., serialization_alias='Date Time')
    severity: Severity = Field(..., serialization_alias='Severity')
    description: str = Field(..., serialization_alias='Description')
    
    @field_serializer('date_time')
    def serialize_date_time(self, date_time: datetime):
        return date_time.strftime("%d %b %Y %H:%M")

class JobIssueEdit(JobIssueCreate):
    pass
    
class JobIssueResponse(JobIssueCreate):
    id: UUID = Field(..., serialization_alias='id')
    resolved: bool = Field(default=False, serialization_alias='Resolved')
    resolved_date_time: Optional[datetime] = Field(default=None, serialization_alias='Resolved Date Time')

    @field_serializer('resolved_date_time', when_used='json')
    def serialize_date_time(self, resolved_date_time: Optional[datetime]):
        return resolved_date_time.strftime('%Y %m %d %H:%M:%S')
    
class ColoredDate(BaseModel):
    date: pydate = Field(..., serialization_alias='Date') 
    color: str = Field(..., serialization_alias='Color')
    
class PPPDocument(BaseModel):
    file_id: UUID = Field(..., serialization_alias='file_id')
    filename: Optional[str] = Field(default=None, serialization_alias='Filename')
    
    class Meta:
        orm_model = JobDocument

class PPPOtherDocument(PPPDocument):
    remark: Optional[str] = Field(default=None, serialization_alias='Remarks')

class COOtherDocument(PPPDocument):
    pass

class ProposePPP(BaseModel):

    surat_pengajuan_ppp: PPPDocument = Field(..., serialization_alias='Surat Pengajuan PPP')
    nomor_surat_pengajuan_ppp: str = Field(..., serialization_alias='Nomor Surat Pengajuan PPP')
    dokumen_persetujuan_afe: PPPDocument = Field(..., serialization_alias='Dokumen Persetujuan AFE/WP&B')
    dokumen_project_summary: PPPDocument = Field(..., serialization_alias='Dokumen Project Summary')
    dokumen_pernyataan: PPPDocument = Field(..., serialization_alias='Dokumen Pernyataan')
    dokumen_laporan_pekerjaan: PPPDocument = Field(..., serialization_alias='Dokumen Laporan Pekerjaan')
    dokumen_formulir: PPPDocument = Field(..., serialization_alias='Dokumen Formulir')
    dokumen_korespondensi: PPPDocument = Field(..., serialization_alias='Dokumen Korespondensi')
    dokumen_sumur_tidak_berproduksi: PPPDocument = Field(..., serialization_alias='Dokumen Sumur Tidak Berproduksi')
    dokumen_daftar_material: PPPDocument = Field(..., serialization_alias='Dokumen Daftar Material')
    dokumen_lainnya: Optional[List[PPPOtherDocument]] = Field(default=None, serialization_alias='Dokumen Lainnya')

class UpdateCO(BaseModel):
    
    final_budget: float = Field(..., serialization_alias='Final Budget')
    dokumen_lainnya: Optional[List[COOtherDocument]] = Field(default=None, serialization_alias='Dokumen Lainnya')

class ValidateActualExploration(CreateActualExploration):
    
    well: ValidateWell = Field(..., serialization_alias='Well')
    
class ValidateActualDevelopment(CreateActualDevelopment):
    
    well: ValidateWell = Field(..., serialization_alias='Well')
    
class ValidateActualWorkover(CreateActualWorkover):
    
    well: ValidateWell = Field(..., serialization_alias='Well')
    
class ValidateActualWellService(CreateActualWellService):
    
    well: ValidateWell = Field(..., serialization_alias='Well')

class SidebarJobResponse(BaseModel):
    job_id: UUID
    NAMA_SUMUR: str
    
    class Config:
        from_attributes = True

class FinishOperation(BaseModel):
    date_finished: date
    well_status: Literal[tuple(const.well_status)] #type: ignore
    remarks: Optional[str]

class JobResponse(BaseModel):
    jobs: List[SidebarJobResponse]
from app.api.job.models import *
from app.api.well.schemas import *

from pydantic import field_validator, model_validator, Field
from typing import Optional, Union, List
from datetime import datetime, date
from datetime import time as pytime
from .utils import validate_time, validate_date
from app.core.schema_operations import BaseModel

class TimeBreakdownBase(BaseModel):
    start_time: Union[pytime, datetime] = Field(..., serialization_alias='Start Time')
    end_time: Union[pytime, datetime] = Field(..., serialization_alias='End Time')
    start_measured_depth: float = Field(..., serialization_alias='Start MD')
    end_measured_depth: float = Field(..., serialization_alias='End MD')
    category: Optional[JobCategory] = Field(..., serialization_alias='Job Category')
    p: Optional[YesNo] = Field(..., serialization_alias='P')
    npt: Optional[NPT] = Field(..., serialization_alias='NPT')
    code: Optional[OperationCode] = Field(..., serialization_alias='Code')
    operation: str = Field(..., serialization_alias='Operation')

    @model_validator(mode='before')
    @classmethod
    def verify_times(cls, v):
        
        if not isinstance(v , dict):
            v = v.__dict__
        
        start = validate_time(v.get('start_time'))
        end = validate_time(v.get('end_time'))
        
        # if start is not None and end <= start:
        #     raise ValueError('end_time must be after start_time')
        
        v['start_time'] = start
        v['end_time'] = end
        
        return v



class TimeBreakdownCreate(TimeBreakdownBase):
    
    class Meta:
        orm_model = TimeBreakdown
    


class PersonnelBase(BaseModel):
    company: str = Field(..., serialization_alias='Company')
    people: int = Field(..., serialization_alias='People')
    


class PersonnelCreate(PersonnelBase):
    
    class Meta:
        orm_model = Personnel
        


class IncidentBase(BaseModel):
    incidents_time: Union[pytime, datetime] = Field(..., serialization_alias='Incident Time')
    incident: str = Field(..., serialization_alias='Incident')
    incident_type: str = Field(..., serialization_alias='Incident Type')
    comments: Optional[str] = Field(default=None, serialization_alias='Comments')

    @field_validator('incidents_time', mode='before')
    @classmethod
    def verify_time(cls, v):
        return validate_time(v)
    


class IncidentCreate(IncidentBase):
    
    class Meta:
        orm_model = Incident
        


class BitRecordBase(BaseModel):
    bit_size: float = Field(..., serialization_alias='Bit Size')
    bit_number: int = Field(..., serialization_alias='Bit Number')
    bit_run: int = Field(..., serialization_alias='Bit Run')
    manufacturer: str = Field(..., serialization_alias='Manufacturer')
    iadc_code: str = Field(..., serialization_alias='IADC Code')
    jets: str = Field(..., serialization_alias='Jets')
    serial: str = Field(..., serialization_alias='Serial')
    depth_out: float = Field(..., serialization_alias='Depth Out')
    depth_in: float = Field(..., serialization_alias='Depth In')
    meterage: float = Field(..., serialization_alias='Meterage')
    bit_hours: float = Field(..., serialization_alias='Bit Hours')
    nozzels: float = Field(..., serialization_alias='Nozzels')
    dull_grade: str = Field(..., serialization_alias='Dull Grade')


        
class BitRecordCreate(BitRecordBase):
    class Meta:
        orm_model = BitRecord
    


class BHAComponentBase(BaseModel):
    component: BHAComponentType  = Field(..., serialization_alias='Component')
    outer_diameter: float = Field(..., serialization_alias='Outer Diameter')
    length: float = Field(..., serialization_alias='Length')


        
class BHAComponentCreate(BHAComponentBase):
    
    class Meta:
        orm_model = BHAComponent
    


class BottomHoleAssemblyBase(BaseModel):

    bha_number: int = Field(..., serialization_alias='BHA Number')
    bha_run: int = Field(..., serialization_alias='BHA Run')

        
class BottomHoleAssemblyCreate(BottomHoleAssemblyBase):
    components: List[BHAComponentCreate] = Field(..., serialization_alias='Components')
    
    class Meta:
        orm_model = BottomHoleAssembly
    


class DrillingFluidBase(BaseModel):
    mud_type: MudType  = Field(..., serialization_alias='Mud Type')
    time: Union[pytime, datetime] = Field(..., serialization_alias='Time') 
    mw_in: float = Field(..., serialization_alias='MW In')
    mw_out: float = Field(..., serialization_alias='MW Out')
    temp_in: float = Field(..., serialization_alias='Temp In')
    temp_out: float = Field(..., serialization_alias='Temp Out')
    pres_grad: float = Field(..., serialization_alias='Pres Grad')
    visc: float = Field(..., serialization_alias='Visc')
    pv: float = Field(..., serialization_alias='PV')
    yp: float = Field(..., serialization_alias='YP')
    gels_10_sec: float = Field(..., serialization_alias='Gels 10 Sec')
    gels_10_min: float = Field(..., serialization_alias='Gels 10 Min')
    fluid_loss: float = Field(..., serialization_alias='Fluid Loss')
    ph: float = Field(..., serialization_alias='PH')
    solids: float = Field(..., serialization_alias='Solids')
    sand: float = Field(..., serialization_alias='Sand')
    water: float = Field(..., serialization_alias='Water')
    oil: float = Field(..., serialization_alias='Oil')
    hgs: float = Field(..., serialization_alias='HGS')
    lgs: float = Field(..., serialization_alias='LGS')
    ltlp: float = Field(..., serialization_alias='LTLP')
    hthp: float = Field(..., serialization_alias='HTHP')
    cake: float = Field(..., serialization_alias='Cake')
    e_stb: float = Field(..., serialization_alias='E STB')
    pf: float = Field(..., serialization_alias='PF')
    mf: float = Field(..., serialization_alias='MF')
    pm: float = Field(..., serialization_alias='PM')
    ecd: float = Field(..., serialization_alias='ECD')

    @field_validator('time', mode='before')
    @classmethod
    def verify_time(cls, v):
        return validate_time(v)
    


class DrillingFluidCreate(DrillingFluidBase):
    
    class Meta:
        orm_model = DrillingFluid
    


class MudAdditiveBase(BaseModel):
    mud_additive_type: str = Field(..., serialization_alias='Mud Additive Type')
    amount: float = Field(..., serialization_alias='Amount')
    

        
class MudAdditiveCreate(MudAdditiveBase):
    
    class Meta:
        orm_model = MudAdditive
        


class BulkMaterialBase(BaseModel):
    material_type: str = Field(..., serialization_alias='Material Type')
    material_name: str = Field(..., serialization_alias='Material Name')
    material_uom: str = Field(..., serialization_alias='Material UOM')
    received: float = Field(..., serialization_alias='Received')
    consumed: float = Field(..., serialization_alias='Consumed')
    returned: float = Field(..., serialization_alias='Returned')
    adjust: float = Field(..., serialization_alias='Adjust')
    ending: float = Field(..., serialization_alias='Ending')
    

        
class BulkMaterialCreate(BulkMaterialBase):
    
    class Meta:
        orm_model = BulkMaterial
        


class DirectionalSurveyBase(BaseModel):
    measured_depth: float = Field(..., serialization_alias='MD')
    inclination: float = Field(..., serialization_alias='Inclination')
    azimuth: float = Field(..., serialization_alias='Azimuth')
    

        
class DirectionalSurveyCreate(DirectionalSurveyBase):
    
    class Meta:
        orm_model = DirectionalSurvey
    


class PumpsBase(BaseModel):
    slow_speed: YesNo = Field(..., serialization_alias='Slow Speed')
    circulate: float = Field(..., serialization_alias='Circulate')
    strokes: float = Field(..., serialization_alias='Strokes')
    pressure: float = Field(..., serialization_alias='Pressure')
    liner_size: float = Field(..., serialization_alias='Liner Size')
    efficiency: float = Field(..., serialization_alias='Efficiency')
    

        
class PumpsCreate(PumpsBase):
    
    class Meta:
        orm_model = Pumps
    


class WeatherBase(BaseModel):
    temperature_high: float = Field(..., serialization_alias='Temperature High')
    temperature_low: float = Field(..., serialization_alias='Temperature Low')
    chill_factor: float = Field(..., serialization_alias='Chill Factor')
    wind_speed: float = Field(..., serialization_alias='Wind Speed')
    wind_direction: float = Field(..., serialization_alias='Wind Direction')
    barometric_pressure: float = Field(..., serialization_alias='Barometric Pressure')
    wave_height: float = Field(..., serialization_alias='Wave Height')
    wave_current_speed: float = Field(..., serialization_alias='Wave Current Speed')
    road_condition: str = Field(..., serialization_alias='Road Condition')
    visibility: str = Field(..., serialization_alias='Visibility')

class WeatherCreate(WeatherBase):
    
    class Meta:
        orm_model = Weather
    


class DailyOperationsReportBase(BaseModel):
    
    contractor: Optional[str]  = Field(default=None, serialization_alias='Contractor')
    current_md: Optional[float]  = Field(default=None, serialization_alias='Current MD')
    
    avg_wob: Optional[float]  = Field(default=None, serialization_alias='Average WOB')
    avg_rop: Optional[float]  = Field(default=None, serialization_alias='Average ROP')
    avg_rpm: Optional[float]  = Field(default=None, serialization_alias='Average RPM')
    torque: Optional[float]  = Field(default=None, serialization_alias='Torque')
    stand_pipe_pressure: Optional[float]  = Field(default=None, serialization_alias='Stand Pipe Pressure')
    flow_rate: Optional[float]  = Field(default=None, serialization_alias='Flow Rate')
    string_weight: Optional[float]  = Field(default=None, serialization_alias='String Weight')
    rotating_weight: Optional[float]  = Field(default=None, serialization_alias='Rotating Weight')
    total_drilling_time: Optional[float]  = Field(default=None, serialization_alias='Total Drilling Time')
    circulating_pressure: Optional[float]  = Field(default=None, serialization_alias='Circulating Pressure')
    daily_cost: Optional[float]  = Field(default=None, serialization_alias='Daily Cost')
    daily_mud_cost: Optional[float]  = Field(default=None, serialization_alias='Daily Mud Cost')
    day_supervisor: Optional[str]  = Field(default=None, serialization_alias='Day Supervisor')
    night_supervisor: Optional[str]  = Field(default=None, serialization_alias='Night Supervisor')
    engineer: Optional[str]  = Field(default=None, serialization_alias='Engineer')
    geologist: Optional[str]  = Field(default=None, serialization_alias='Geologist')
    day_summary: Optional[str]  = Field(default=None, serialization_alias='Day Summary')
    day_forecast: Optional[str]  = Field(default=None, serialization_alias='Day Forecast')
    last_size: Optional[float]  = Field(default=None, serialization_alias='Last Size')
    set_md: Optional[float]  = Field(default=None, serialization_alias='Set MD')
    next_size: Optional[float]  = Field(default=None, serialization_alias='Next Size')
    next_set_md: Optional[float]  = Field(default=None, serialization_alias='Next Set MD')
    last_lot_emw: Optional[float]  = Field(default=None, serialization_alias='Last Lot EMW')
    tol: Optional[float]  = Field(default=None, serialization_alias='Tol')
    start_mud_volume: Optional[float]  = Field(default=None, serialization_alias='Start Mud Volume')
    lost_surface_mud_volume: Optional[float]  = Field(default=None, serialization_alias='Lost Surface Mud Volume')
    lost_dh_mud_volume: Optional[float]  = Field(default=None, serialization_alias='Lost DH Mud Volume')
    dumped_mud_volume: Optional[float]  = Field(default=None, serialization_alias='Dumped Mud Volume')
    built_mud_volume: Optional[float]  = Field(default=None, serialization_alias='Built Mud Volume')
    ending_mud_volume: Optional[float]  = Field(default=None, serialization_alias='Ending Mud Volume')
    max_gas: Optional[float]  = Field(default=None, serialization_alias='Max Gas')
    conn_gas: Optional[float]  = Field(default=None, serialization_alias='Conn Gas')
    trip_gas: Optional[float]  = Field(default=None, serialization_alias='Trip Gas')
    back_gas: Optional[float]  = Field(default=None, serialization_alias='Back Gas')
    annular_velocity: Optional[float]  = Field(default=None, serialization_alias='Annular Velocity')
    pb: Optional[float]  = Field(default=None, serialization_alias='PB')
    sys_hhp: Optional[float]  = Field(default=None, serialization_alias='Sys HHP')
    hhpb: Optional[float]  = Field(default=None, serialization_alias='HHPB')
    hsi: Optional[float]  = Field(default=None, serialization_alias='HSI')
    percent_psib: Optional[float]  = Field(default=None, serialization_alias='Percent PSIB')
    jet_velocity: Optional[float]  = Field(default=None, serialization_alias='Jet Velocity')
    impact_force: Optional[float]  = Field(default=None, serialization_alias='Impact Force')
    if_area: Optional[float]  = Field(default=None, serialization_alias='IF Area')
    stop_cards: Optional[int]  = Field(default=None, serialization_alias='Stop Cards')
    lta: Optional[YesNo]  = Field(default=None, serialization_alias='LTA')
    spill: Optional[YesNo]  = Field(default=None, serialization_alias='Spill')
    h2s_test: Optional[YesNo]  = Field(default=None, serialization_alias='H2S Test')
    hse_mtg: Optional[YesNo]  = Field(default=None, serialization_alias='HSE MTG')
    kicktrip: Optional[YesNo]  = Field(default=None, serialization_alias='Kicktrip')
    kickdrill: Optional[YesNo]  = Field(default=None, serialization_alias='Kickdrill')
    fire: Optional[YesNo]  = Field(default=None, serialization_alias='Fire')
    
    personnel: Optional[List[PersonnelCreate]] = Field(default=None, serialization_alias='Personnel')
    incidents: Optional[List[IncidentCreate]] = Field(default=None, serialization_alias='Incidents')
    time_breakdowns: Optional[List[TimeBreakdownCreate]] = Field(default=None, serialization_alias='Time Breakdowns')
    bit_records: Optional[List[BitRecordCreate]] = Field(default=None, serialization_alias='Bit Records')
    bottom_hole_assemblies: Optional[List[BottomHoleAssemblyCreate]] = Field(default=None, serialization_alias='Bottom Hole Assemblies')
    drilling_fluids: Optional[List[DrillingFluidCreate]] = Field(default=None, serialization_alias='Drilling Fluids')
    mud_additives: Optional[List[MudAdditiveCreate]] = Field(default=None, serialization_alias='Mud Additives')
    bulk_materials: Optional[List[BulkMaterialCreate]] = Field(default=None, serialization_alias='Bulk Materials')
    directional_surveys: Optional[List[DirectionalSurveyCreate]] = Field(default=None, serialization_alias='Directional Surveys')
    pumps: Optional[List[PumpsCreate]] = Field(default=None, serialization_alias='Pumps')
    weather: Optional[WeatherCreate] = Field(default=None, serialization_alias='Weather')

    class Meta:
        orm_model = DailyOperationsReport
        

        

class DailyOperationsReportCreate(DailyOperationsReportBase):
    report_date: date
    
    @field_validator('report_date', mode='before')
    @classmethod
    def verify_date(cls, v):
        return validate_date(v)

class DailyOperationsReportEdit(DailyOperationsReportBase):
    pass
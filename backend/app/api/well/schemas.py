from pydantic import Field, computed_field
from decimal import Decimal
from typing import Optional, List, Literal
from datetime import date
from app.api.well.models import *
from app.core.constants import UnitType
from uuid import UUID
from app.core.schema_operations import BaseModel
from app.core import constants as const
from datetime import datetime

class WellMandatoryBase(BaseModel):
    
    unit_type: Optional[UnitType] = Field(default=None, serialization_alias='Unit Type') # type: ignore
        
    # Well Status and Classification
    well_level_type: Optional[Literal[tuple(const.well_level_type)]] = Field(default=None, serialization_alias='Well Level Type') # type: ignore
    well_class: Optional[Literal[tuple(const.well_class)]] = Field(default=None, serialization_alias='Well Class') # type: ignore
    well_profile_type: Optional[Literal[tuple(const.well_profile_type)]] = Field(default=None, serialization_alias='Well Profile Type') # type: ignore
    environment_type: Optional[Literal[tuple(const.environment_type)]] = Field(default=None, serialization_alias='Environment Type') # type: ignore
    
    # Coordinates
    surface_longitude: Optional[float] = Field(default=None, serialization_alias='Surface Longitude')
    surface_latitude: Optional[float] = Field(default=None, serialization_alias='Surface Latitude')
    bottom_hole_longitude: Optional[float] = Field(default=None, serialization_alias='Bottom Hole Longitude')
    bottom_hole_latitude: Optional[float] = Field(default=None, serialization_alias='Bottom Hole Latitude')
    
    # Key Dates
    spud_date: Optional[date] = Field(default=None, serialization_alias='Spud Date')
    final_drill_date: Optional[date] = Field(default=None, serialization_alias='Final Drill Date')
    completion_date: Optional[date] = Field(default=None, serialization_alias='Completion Date')
    abandonment_date: Optional[date] = Field(default=None, serialization_alias='Abandonment Date')
    rig_on_site_date: Optional[date] = Field(default=None, serialization_alias='Rig On-Site Date')
    rig_release_date: Optional[date] = Field(default=None, serialization_alias='Rig Release Date')

    maximum_inclination: Optional[float] = Field(default=None, serialization_alias='Maximum Inclination')
    azimuth: Optional[float] = Field(default=None, serialization_alias='Azimuth')
    hydrocarbon_target: Optional[Literal[tuple(const.hydrocarbon_target)]] = Field(default=None, serialization_alias='Hydrocarbon Target') # type: ignore
    kick_off_point: Optional[float] = Field(default=None, serialization_alias='Kick Off Point')
    
    # Elevations
    difference_lat_msl: Optional[float] = Field(default=None, serialization_alias='Difference Lat MSL')
    subsea_elev_ref_type: Optional[Literal[tuple(const.subsea_elev_ref_type)]] = Field(default=None, serialization_alias='Subsea Elev Ref Type') # type: ignore
    elev_ref_datum: Optional[Literal[tuple(const.elev_ref_datum)]] = Field(default=None, serialization_alias='Elev Ref Datum') # type: ignore
    
    rotary_table_elev: Optional[float] = Field(default=None, serialization_alias='Rotary Table Elev')
    kb_elev: Optional[float] = Field(default=None, serialization_alias='KB Elev')
    derrick_floor_elev: Optional[float] = Field(default=None, serialization_alias='Derrick Floor Elev')
    ground_elev: Optional[float] = Field(default=None, serialization_alias='Ground Elev')
    ground_elev_type: Optional[Literal[tuple(const.ground_elev_type)]] = Field(default=None, serialization_alias='Ground Elev Type') # type: ignore
    
    # Depths
    base_depth: Optional[float] = Field(default=None, serialization_alias='Base Depth')
    water_depth: Optional[float] = Field(default=None, serialization_alias='Water Depth')
    water_depth_datum: Optional[Literal[tuple(const.water_depth_datum)]] = Field(default=None, serialization_alias='Water Depth Datum') # type: ignore
    deepest_depth: Optional[float] = Field(default=None, serialization_alias='Deepest Depth')
    depth_datum: Optional[str] = Field(default=None, serialization_alias='Depth Datum')
    depth_datum_elev: Optional[float] = Field(default=None, serialization_alias='Depth Datum Elev')
    drill_td: Optional[float] = Field(default=None, serialization_alias='Drill TD')
    top_depth: Optional[float] = Field(default=None, serialization_alias='Top Depth')
    maximum_tvd: Optional[float] = Field(default=None, serialization_alias='Maximum TVD')
    final_md: Optional[float] = Field(default=None, serialization_alias='Final MD')
    plugback_depth: Optional[float] = Field(default=None, serialization_alias='Plugback Depth')
    whipstock_depth: Optional[float] = Field(default=None, serialization_alias='Whipstock Depth')
    
    # Other
    water_acoustic_vel: Optional[float] = Field(default=None, serialization_alias='Water Acoustic Vel')
    net_pay: Optional[float] = Field(default=None, serialization_alias='Net Pay')
    
class WellBase(WellMandatoryBase):
    
    # Basic Information
    well_name: Optional[str] = Field(default=None, serialization_alias='Well Name')
    well_num: Optional[str] = Field(default=None, serialization_alias='Well Number')

class WellDigitalDataBase(BaseModel):
    
    file_id: UUID = Field(..., serialization_alias='file_id')
    filename: Optional[str] = Field(default=None, serialization_alias='Filename')
    
    @computed_field
    @property
    def download_path(self) -> str:
        return f'/utils/download/file/{self.file_id}'
    
    @computed_field
    @property
    def remove_path(self) -> str:
        return f'/utils/delete/file/{self.file_id}'

class WellPPFGBase(WellDigitalDataBase):
    class Meta:
        orm_model = WellPPFG
        
class WellLogPlanBase(WellDigitalDataBase):
    class Meta:
        orm_model = WellLogPlan

class WellMaterialsBase(WellDigitalDataBase):
    class Meta:
        orm_model = WellMaterials

class WellCasingBase(BaseModel):
    
    top_depth: Optional[float] = Field(None, description="Hung top depth")
    top_depth_ouom: Optional[str] = Field(None, description="Unit of measurement for top depth")
    
    base_depth: Optional[float] = Field(None, description="Base depth")
    base_depth_ouom: Optional[str] = Field(None, description="Unit of measurement for base depth")
    
    hole_size: Optional[float] = Field(None, description="Hole size")
    hole_size_ouom: Optional[str] = Field(None, description="Unit of measurement for hole size")
    
    inside_diameter: Optional[float] = Field(None, description="Inside diameter")
    inside_diameter_ouom: Optional[str] = Field(None, description="Unit of measurement for inside diameter")
    
    outside_diameter: Optional[float] = Field(None, description="Outside diameter")
    outside_diameter_ouom: Optional[str] = Field(None, description="Unit of measurement for outside diameter")
    
    cement_type: Optional[str] = Field(None, description="Type of cement used")
    cement_amount: Optional[float] = Field(None, description="Amount of cement used")
    cement_amount_uom: Optional[str] = Field(None, description="Unit of measurement for cement amount")
    
    remark: Optional[str] = Field(None, description="Additional remarks")

    class Meta:
        index_column = "tubing_obs_no"
        orm_model = PPDMWellTubular

class WellSchematicBase(BaseModel):

    file_id: UUID = Field(..., serialization_alias='file_id')
    filename: Optional[str] = Field(default=None, serialization_alias='Filename')

    @computed_field
    @property
    def download_path(self) -> str:
        return f'/utils/download/file/{self.file_id}'
    
    @computed_field
    @property
    def delete_path(self) -> str:
        return f'/utils/delete/file/{self.file_id}'
    
    class Meta:
        orm_model = WellSchematic

class WellStratigraphyBase(BaseModel):
    
    unit_type: UnitType = Field(..., serialization_alias='Unit Type')
    
    depth_datum: DepthDatum = Field(..., serialization_alias='Depth Datum')
    
    top_depth: float = Field(..., serialization_alias='Top Depth')
    bottom_depth: float = Field(..., serialization_alias='Bottom Depth')
    
    formation_name: str = Field(..., serialization_alias='Formation Name')
    lithology: str = Field(..., serialization_alias='Lithology')
    
    class Meta:
        orm_model = WellStratigraphy

class WellTestBase(BaseModel):

    test_type: str = Field(..., max_length=40, serialization_alias="test_type")
    run_num: str = Field(..., max_length=4, serialization_alias="run_num")
    test_num: str = Field(..., max_length=4, serialization_alias="test_num")
    base_depth: Optional[Decimal] = Field(None, max_digits=15, decimal_places=5, serialization_alias="base_depth")
    base_depth_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="base_depth_ouom") #type: ignore
    bhp_z: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="bhp_z")
    bottom_choke_desc: Optional[str] = Field(None, max_length=40, serialization_alias="bottom_choke_desc")
    bsw_percent: Optional[Decimal] = Field(None, max_digits=15, decimal_places=12, serialization_alias="bsw_percent")
    caliper_hole_diameter: Optional[Decimal] = Field(None, max_digits=8, decimal_places=3, serialization_alias="caliper_hole_diameter")
    caliper_hole_diameter_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="caliper_hole_diameter_ouom")#type: ignore
    casing_pressure: Optional[Decimal] = Field(None, max_digits=8, decimal_places=2, serialization_alias="casing_pressure")
    casing_pressure_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="casing_pressure_ouom")#type: ignore
    choke_size_desc: Optional[str] = Field(None, max_length=240, serialization_alias="choke_size_desc")
    condensate_amount_percent: Optional[Decimal] = Field(None, max_digits=15, decimal_places=12, serialization_alias="condensate_amount_percent")
    condensate_flow_amount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="condensate_flow_amount")
    condensate_flow_amount_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="condensate_flow_amount_ouom")#type: ignore
    condensate_flow_amount_uom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="condensate_flow_amount_uom")#type: ignore
    condensate_gravity: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="condensate_gravity")
    condensate_ratio: Optional[Decimal] = Field(None, max_digits=15, decimal_places=6, serialization_alias="condensate_ratio")
    condensate_ratio_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="condensate_ratio_ouom")#type: ignore
    damage_quality: Optional[str] = Field(None, max_length=40, serialization_alias="damage_quality")
    flow_pressure: Optional[Decimal] = Field(None, max_digits=8, decimal_places=2, serialization_alias="flow_pressure")
    flow_pressure_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="flow_pressure_ouom")#type: ignore
    flow_temperature: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="flow_temperature")
    flow_temperature_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="flow_temperature_ouom")#type: ignore
    gas_flow_amount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="gas_flow_amount")
    gas_flow_amount_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="gas_flow_amount_ouom")#type: ignore
    gas_flow_amount_uom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="gas_flow_amount_uom")#type: ignore
    gas_gravity: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="gas_gravity")
    gor: Optional[Decimal] = Field(None, max_digits=15, decimal_places=6, serialization_alias="gor")
    gor_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="gor_ouom")#type: ignore
    h2s_percent: Optional[Decimal] = Field(None, max_digits=15, decimal_places=12, serialization_alias="h2s_percent")
    hole_condition: Optional[str] = Field(None, max_length=40, serialization_alias="hole_condition")
    max_condens_flow_rate: Optional[Decimal] = Field(None, max_digits=15, decimal_places=5, serialization_alias="max_condens_flow_rate")
    max_condens_flow_rate_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="max_condens_flow_rate_ouom")#type: ignore
    max_gas_flow_rate: Optional[Decimal] = Field(None, max_digits=15, decimal_places=5, serialization_alias="max_gas_flow_rate")
    max_gas_flow_rate_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="max_gas_flow_rate_ouom")#type: ignore
    max_hydrostatic_pressure: Optional[Decimal] = Field(None, max_digits=8, decimal_places=2, serialization_alias="max_hydrostatic_pressure")
    max_hydrostatic_press_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="max_hydrostatic_press_ouom")#type: ignore
    max_oil_flow_rate: Optional[Decimal] = Field(None, max_digits=15, decimal_places=5, serialization_alias="max_oil_flow_rate")
    max_oil_flow_rate_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="max_oil_flow_rate_ouom")#type: ignore
    max_water_flow_rate: Optional[Decimal] = Field(None, max_digits=15, decimal_places=5, serialization_alias="max_water_flow_rate")
    max_water_flow_rate_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="max_water_flow_rate_ouom")#type: ignore
    oil_amount_percent: Optional[Decimal] = Field(None, max_digits=15, decimal_places=12, serialization_alias="oil_amount_percent")
    oil_flow_amount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="oil_flow_amount")
    oil_flow_amount_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="oil_flow_amount_ouom")#type: ignore
    oil_flow_amount_uom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="oil_flow_amount_uom")#type: ignore
    oil_gravity: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="oil_gravity")
    permeability_quality: Optional[str] = Field(None, max_length=40, serialization_alias="permeability_quality")
    primary_fluid_recovered: Optional[str] = Field(None, max_length=40, serialization_alias="primary_fluid_recovered")
    production_method: Optional[str] = Field(None, max_length=40, serialization_alias="production_method")
    rat_hole_diameter: Optional[Decimal] = Field(None, max_digits=8, decimal_places=3, serialization_alias="rat_hole_diameter")
    rat_hole_diameter_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="rat_hole_diameter_ouom")#type: ignore
    rat_hole_length: Optional[Decimal] = Field(None, max_digits=10, decimal_places=3, serialization_alias="rat_hole_length")
    rat_hole_length_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="rat_hole_length_ouom")#type: ignore
    remark: Optional[str] = Field(None, max_length=2000, serialization_alias="remark")
    report_temperature: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="report_temperature")
    report_temperature_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="report_temperature_ouom")#type: ignore
    report_test_num: Optional[str] = Field(None, max_length=4, serialization_alias="report_test_num")
    show_type: Optional[str] = Field(None, max_length=40, serialization_alias="show_type")
    si_flow_ratio: Optional[Decimal] = Field(None, max_digits=4, decimal_places=2, serialization_alias="si_flow_ratio")
    start_time: Optional[datetime] = Field(None, serialization_alias="start_time")
    start_timezone: Optional[str] = Field(None, max_length=40, serialization_alias="start_timezone")
    static_pressure: Optional[Decimal] = Field(None, max_digits=8, decimal_places=2, serialization_alias="static_pressure")
    static_pressure_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="static_pressure_ouom")#type: ignore
    strat_age: Optional[str] = Field(None, max_length=40, serialization_alias="strat_age")
    string_source: Optional[str] = Field(None, max_length=40, serialization_alias="string_source")
    sulphur_ind: Optional[str] = Field(None, max_length=1, serialization_alias="sulphur_ind")
    td: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="td")
    td_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="td_ouom")#type: ignore
    temperature_correction: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="temperature_correction")
    temperature_correction_ind: Optional[str] = Field(None, max_length=1, serialization_alias="temperature_correction_ind")
    temperature_correction_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="temperature_correction_ouom")#type: ignore
    test_date: Optional[datetime] = Field(None, serialization_alias="test_date")
    test_duration: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="test_duration")
    test_duration_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="test_duration_ouom")#type: ignore
    test_hole_diameter: Optional[Decimal] = Field(None, max_digits=8, decimal_places=3, serialization_alias="test_hole_diameter")
    test_hole_diameter_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="test_hole_diameter_ouom")#type: ignore
    test_result_code: Optional[str] = Field(None, max_length=40, serialization_alias="test_result_code")
    test_subtype: Optional[str] = Field(None, max_length=40, serialization_alias="test_subtype")
    tool_open_time: Optional[datetime] = Field(None, serialization_alias="tool_open_time")
    tool_open_timezone: Optional[str] = Field(None, max_length=40, serialization_alias="tool_open_timezone")
    top_choke_desc: Optional[str] = Field(None, max_length=240, serialization_alias="top_choke_desc")
    top_depth: Optional[Decimal] = Field(None, max_digits=15, decimal_places=5, serialization_alias="top_depth")
    top_depth_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="top_depth_ouom")#type: ignore
    water_amount_percent: Optional[Decimal] = Field(None, max_digits=15, decimal_places=12, serialization_alias="water_amount_percent")
    water_cut_percent: Optional[Decimal] = Field(None, max_digits=15, decimal_places=12, serialization_alias="water_cut_percent")
    water_flow_amount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="water_flow_amount")
    water_flow_amount_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="water_flow_amount_ouom")#type: ignore
    water_flow_amount_uom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, serialization_alias="water_flow_amount_uom")#type: ignore
    wellbore_completion_type: Optional[str] = Field(None, max_length=40, serialization_alias="wellbore_completion_type")
    z_factor: Optional[Decimal] = Field(None, max_digits=10, decimal_places=5, serialization_alias="z_factor")

    class Meta:
        orm_model = WellTest

class WellPressureBase(BaseModel):
    base_depth: Optional[float] = Field(None, description="Base depth")
    base_depth_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Base depth unit of measure")#type: ignore
    flow_casing_pressure: Optional[float] = Field(None, ge=0, description="Flow casing pressure")
    flow_casing_pressure_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Flow casing pressure unit of measure")#type: ignore
    flow_tubing_pressure: Optional[float] = Field(None, ge=0, description="Flow tubing pressure")
    flow_tubing_pressure_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Flow tubing pressure unit of measure")#type: ignore
    init_reservoir_pressure: Optional[float] = Field(None, ge=0, description="Initial reservoir pressure")
    init_reservoir_press_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Initial reservoir pressure unit of measure")#type: ignore
    pool_datum: Optional[str] = Field(None, max_length=40, description="Pool datum")
    pool_datum_depth: Optional[float] = Field(None, description="Pool datum depth")
    pool_datum_depth_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Pool datum depth unit of measure")#type: ignore
    pr_str_form_obs_no: Optional[int] = Field(None, description="Production string formation observation number")
    remark: Optional[str] = Field(None, max_length=2000, description="Remark or comment")
    shutin_casing_pressure: Optional[float] = Field(None, ge=0, description="Shutin casing pressure")
    shutin_casing_pressure_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Shutin casing pressure unit of measure")#type: ignore
    shutin_tubing_pressure: Optional[float] = Field(None, ge=0, description="Shutin tubing pressure")
    shutin_tubing_pressure_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Shutin tubing pressure unit of measure")#type: ignore
    top_depth: Optional[float] = Field(None, description="Top depth")
    top_depth_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Top depth unit of measure")#type: ignore
    well_datum_depth: Optional[float] = Field(None, description="Well datum depth")
    well_datum_ouom: Optional[Literal[tuple(const.uoms)]] = Field(None, max_length=40, description="Well datum depth unit of measure")#type: ignore
    
    class Meta:
        index_column = "pressure_obs_no"
        orm_model = WellPressure

class FilenameBase(BaseModel):
    filename: Optional[str] = Field(default=None, serialization_alias='Filename')

class SeismicLineBase(BaseModel):
    physical_item_id: Optional[str] = Field(default=None, serialization_alias='physical_item_id')
    seismic_line_name: Optional[str] = Field(default=None, serialization_alias='Seismic Line Name')
    average_velocity: Optional[float] = Field(default=None, serialization_alias='Average Velocity')
    shot_point_number: Optional[int] = Field(default=None, serialization_alias='Shot Point Number')
    max_latitude: Optional[float] = Field(default=None, serialization_alias='Max Latitude')
    max_longitude: Optional[float] = Field(default=None, serialization_alias='Max Longitude')
    min_latitude: Optional[float] = Field(default=None, serialization_alias='Min Latitude')
    min_longitude: Optional[float] = Field(default=None, serialization_alias='Min Longitude')
    remark: Optional[str] = Field(default=None, serialization_alias='Remark')
    
    class Meta:
        orm_model = SeismicLine

class GetSeismicLineBase(SeismicLineBase, FilenameBase):
    pass

class WellCorePlanBase(WellDigitalDataBase):
    class Meta:
        orm_model = WellCorePlan

class WellTrajectoryBase(BaseModel):
    unit_type: UnitType = Field(default=None, alias='unit_type')
    physical_item_id: str = Field(default=None, alias='physical_item_id')
    survey_start_date: date = Field(default=None, alias='survey_start_date')
    survey_end_date: date = Field(default=None, alias='survey_end_date')
    top_depth: float = Field(default=None, alias='top_depth')
    base_depth: float = Field(default=None, alias='base_depth')
    survey_type: str = Field(default=None, alias='survey_type')

    class Meta:
        orm_model = WellTrajectory
        
class GetWellTrajectoryBase(WellTrajectoryBase, FilenameBase):
    pass

class CreateExplorationWellPlan(BaseModel):
    well_plan: Optional[WellBase] = Field(default=None, alias='well_plan')
    well_ppfg: Optional[WellPPFGBase] = Field(default=None, alias='well_ppfg')
    well_materials: Optional[WellMaterialsBase] = Field(default=None, alias='well_materials')
    well_casings: Optional[List[WellCasingBase]] = Field(default=None, alias='well_casings')
    well_schematic: Optional[WellSchematicBase] = Field(default=None, alias='well_schematic')
    well_stratigraphy: Optional[List[WellStratigraphyBase]] = Field(default=None, alias='well_stratigraphy')
    well_test: Optional[List[WellTestBase]] = Field(default=None, alias='well_test')
    well_pressure: Optional[List[WellPressureBase]] = Field(default=None, alias='well_pressure')
    well_core: Optional[List[WellCorePlanBase]] = Field(default=None, alias='well_core')
    seismic_line: Optional[SeismicLineBase] = Field(default=None, alias='seismic_line')

class CreateDevelopmentWellPlan(BaseModel):
    well_plan: Optional[WellBase] = Field(default=None, alias='well_plan')
    well_ppfg: Optional[WellPPFGBase] = Field(default=None, alias='well_ppfg')
    well_materials: Optional[WellMaterialsBase] = Field(default=None, alias='well_materials')
    well_casings: Optional[List[WellCasingBase]] = Field(default=None, alias='well_casings')
    well_schematic: Optional[WellSchematicBase] = Field(default=None, alias='well_schematic')
    well_stratigraphy: Optional[List[WellStratigraphyBase]] = Field(default=None, alias='well_stratigraphy')
    well_pressure: Optional[List[WellPressureBase]] = Field(default=None, alias='well_pressure')
    seismic_line: Optional[SeismicLineBase] = Field(default=None, alias='seismic_line')

class WellLogBase(BaseModel):
    unit_type: Optional[UnitType] = Field(default=None, alias='unit_type')
    top_depth: Optional[float] = Field(default=None, alias='top_depth')
    base_depth: Optional[float] = Field(default=None, alias='base_depth')
    logs: Optional[str] = Field(default=None, alias='logs')
    physical_item_id: Optional[str] = Field(default=None, alias='physical_item_id')

    class Meta:
        orm_model = WellLog

class GetWellLogBase(WellLogBase, FilenameBase):
    pass

class WellCoreBase(BaseModel):
    
    # uwi: str
    
    unit_type: Optional[UnitType] = Field(default=None, serialization_alias='Unit Type')
    
    top_depth: Optional[float] = Field(default=None, serialization_alias='Top Depth')
    base_depth: Optional[float] = Field(default=None, serialization_alias='Base Depth')
    core_diameter: Optional[float] = Field(default=None, serialization_alias='Core Diameter')
    core_type: Optional[str] = Field(default=None, serialization_alias='Core Type')
    core_show_type: Optional[str] = Field(default=None, serialization_alias='Core Show Type')
    remark: Optional[str] = Field(default=None, serialization_alias='Remark')
    
    physical_item_id: Optional[str] = Field(default=None, serialization_alias='physical_item_id')
    
    @computed_field
    @property
    def view_path(self) -> str:
        return f'/utils/view-image/file/{self.physical_item_id}'
    
    @computed_field
    @property
    def delete_path(self) -> str:
        return f'/utils/delete/file/{self.physical_item_id}'
    
    class Meta:
        orm_model = WellCore

class GetWellCoreBase(WellCoreBase, FilenameBase):
    pass

class WellEquipmentBase(BaseModel):
    # equip_obs_no: Optional[int] = Field(None, description="Observation number of the equipment")
    purchase_date: Optional[date] = Field(None, description="Date when the equipment was purchased")
    commission_date: Optional[date] = Field(None, description="Date when the equipment was commissioned")
    decommission_date: Optional[date] = Field(None, description="Date when the equipment was decommissioned")
    equipment_group: Optional[str] = Field(None, description="Group category of the equipment")
    equipment_name: Optional[str] = Field(None, description="Name of the equipment")
    equipment_type: Optional[str] = Field(None, description="Type or model of the equipment")
    serial_num: Optional[str] = Field(None, description="Serial number of the equipment")
    description: Optional[str] = Field(None, description="Detailed description of the equipment")
    remark: Optional[str] = Field(None, description="Additional remarks")
    
    class Meta:
        index_column = "equip_obs_no"
        orm_model = PPDMWellEquipment
    
class WellCompletionBase(BaseModel):
    # completion_obs_no: Optional[int] = Field(default=None, serialization_alias='Completion Obs No')
    base_depth: Optional[float] = Field(None, description="Base depth")
    base_depth_ouom: Optional[str] = Field(None, max_length=40, description="Base depth unit of measure")
    completion_date: Optional[date] = Field(None, description="Completion date")
    completion_method: Optional[str] = Field(None, max_length=40, description="Completion method")
    completion_type: Optional[str] = Field(None, max_length=40, description="Completion type")
    remark: Optional[str] = Field(None, max_length=2000, description="Remark or comment")
    top_depth: Optional[float] = Field(None, description="Top depth")
    top_depth_ouom: Optional[str] = Field(None, max_length=40, description="Top depth unit of measure")

    class Meta:
        index_column = "completion_obs_no"
        orm_model = WellCompletion

class WellDocumentBase(BaseModel):
    
    file_id: UUID = Field(..., serialization_alias='file_id')
    filename: Optional[str] = Field(default=None, serialization_alias='Filename')
    
    document_type: WellDocumentType = Field(..., serialization_alias='Document Type')
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
        orm_model = WellDocument



class WellDrillingParameterPlanBase(WellDigitalDataBase):
    class Meta:
        orm_model = WellDrillingParameterPlan

class WellDrillingParameterBase(WellDigitalDataBase):
    class Meta:
        orm_model = WellDrillingParameter
        
class WellTestPlanBase(WellDigitalDataBase):
    class Meta:
        orm_model = WellTestPlan







class GetWellDigitalDataBase(BaseModel):
    
    file_id: UUID = Field(..., serialization_alias='file_id')
    filename: Optional[str] = Field(default=None, serialization_alias='Filename')

    @computed_field
    @property
    def download_path(self) -> str:
        return f'/utils/download/file/{self.file_id}'
    
    @computed_field
    @property
    def delete_path(self) -> str:
        return f'/utils/delete/file/{self.file_id}'

class GetWellLogPlanBase(WellDigitalDataBase):
    data: Optional[List[dict]] = Field(default=None, serialization_alias='data')
    class Meta:
        orm_model = WellLogPlan

class GetWellPPFGBase(GetWellDigitalDataBase):
    # data: Optional[List[dict]] = Field(default=None, serialization_alias='data')
    class Meta:
        orm_model = WellPPFG

class GetWellDrillingParameterPlanBase(GetWellDigitalDataBase):
    data: Optional[List[dict]] = Field(default=None, serialization_alias='data')
    class Meta:
        orm_model = WellDrillingParameterPlan

class GetWellDrillingParameterBase(GetWellDigitalDataBase):
    class Meta:
        orm_model = WellDrillingParameter
        
class GetWellTestPlanBase(GetWellDigitalDataBase):
    data: Optional[List[dict]] = Field(default=None, serialization_alias='data')
    class Meta:
        orm_model = WellTestPlan

class GetWellTestBase(GetWellDigitalDataBase):
    data: Optional[List[dict]] = Field(default=None, serialization_alias='data')
    class Meta:
        orm_model = WellTest

class GetWellMaterialsBase(GetWellDigitalDataBase):
    data: Optional[List[dict]] = Field(default=None, serialization_alias='data')
    class Meta:
        orm_model = WellMaterials

class GetWellCorePlanBase(GetWellDigitalDataBase):
    data: Optional[List[dict]] = Field(default=None, serialization_alias='data')
    class Meta:
        orm_model = WellCorePlan









class WellMandatoryData(BaseModel):
    well_trajectory: Optional[WellTrajectoryBase] = Field(default=None, serialization_alias="Well Trajectory")
    well_logs: Optional[List[WellLogBase]] = Field(default=None, serialization_alias="Well Logs")
    seismic_line: Optional[SeismicLineBase] = Field(default=None, serialization_alias="Seismic Line")
    well_casings: Optional[List[WellCasingBase]] = Field(default=None, serialization_alias="Well Casings")
    well_equipments: Optional[List[WellEquipmentBase]] = Field(default=None, serialization_alias="Well Equipments")
    well_completion: Optional[List[WellCompletionBase]] = Field(default=None, serialization_alias="Well Completion")
    well_ppfg: Optional[WellPPFGBase] = Field(default=None, serialization_alias="Well PPFG")
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias="Well Schematic")
    well_stratigraphy: Optional[List[WellStratigraphyBase]] = Field(default=None, serialization_alias="Well Stratigraphy")
    well_pressure: Optional[List[WellPressureBase]] = Field(default=None, serialization_alias="Well Pressure")
    
class GetWellMandatoryData(BaseModel):
    well_trajectory: Optional[GetWellTrajectoryBase] = Field(default=None, serialization_alias="Well Trajectory")
    well_logs: Optional[List[GetWellLogBase]] = Field(default=None, serialization_alias="Well Logs")
    seismic_line: Optional[GetSeismicLineBase] = Field(default=None, serialization_alias="Seismic Line")
    well_casings: Optional[List[WellCasingBase]] = Field(default=None, serialization_alias="Well Casings")
    well_equipments: Optional[List[WellEquipmentBase]] = Field(default=None, serialization_alias="Well Equipments")
    well_completion: Optional[List[WellCompletionBase]] = Field(default=None, serialization_alias="Well Completion")
    well_ppfg: Optional[GetWellPPFGBase] = Field(default=None, serialization_alias='Well PPFG')
    well_schematic: Optional[WellSchematicBase] = Field(default=None, serialization_alias='Well Schematic')
    well_stratigraphy: Optional[List[WellStratigraphyBase]] = Field(default=None, serialization_alias='Well Stratigraphy')
    well_pressure: Optional[List[WellPressureBase]] = Field(default=None, serialization_alias="Well Pressure")

class WellBaseWithData(WellBase, WellMandatoryData):
    pass

class GetWellBaseWithData(WellBase, GetWellMandatoryData):
    pass

class WellMandatoryBaseWithData(WellMandatoryBase, WellMandatoryData):
    pass

class CreatePlanWellExploration(WellBaseWithData):
    well_cores: Optional[List[WellCoreBase]] = Field(default=None, serialization_alias="Well Cores")
    well_tests: Optional[List[WellTestBase]] = Field(default=None, serialization_alias="Well Tests")
    well_drilling_parameter_plan: Optional[WellDrillingParameterPlanBase] = Field(default=None, serialization_alias='Well Drilling Parameter Plan')
    class Meta:
        orm_model = PlanWell

class CreatePlanWellDevelopment(WellBaseWithData):
    parent_well_id: Optional[UUID] = Field(default=None, foreign_key='wells.id', serialization_alias='Parent Well ID')
    well_drilling_parameter_plan: Optional[WellDrillingParameterPlanBase] = Field(default=None, serialization_alias='Well Drilling Parameter Plan')
    class Meta:
        orm_model = PlanWell

class UpdatePlanWellExploration(CreatePlanWellExploration):
    pass

class UpdatePlanWellDevelopment(CreatePlanWellDevelopment):
    pass

class GetUpdatePlanWellExploration(GetWellBaseWithData):
    well_cores: Optional[List[WellCoreBase]] = Field(default=None, serialization_alias="Well Cores")
    well_tests: Optional[List[WellTestBase]] = Field(default=None, serialization_alias="Well Tests")
    well_drilling_parameter_plan: Optional[GetWellDrillingParameterPlanBase] = Field(default=None, serialization_alias='Well Drilling Parameter Plan')

class GetUpdatePlanWellDevelopment(GetWellBaseWithData):
    parent_well_id: Optional[UUID] = Field(default=None, foreign_key='wells.id', serialization_alias='Parent Well ID')
    well_drilling_parameter_plan: Optional[GetWellDrillingParameterPlanBase] = Field(default=None, serialization_alias='Well Drilling Parameter Plan')

class CreateDummyPlanWell(CreatePlanWellExploration):
    area_id: str
    field_id: str
    kkks_id: str

class ActualWellData(BaseModel):
    
    parent_well_id: Optional[UUID] = Field(default=None, foreign_key='wells.id', serialization_alias='Parent Well ID')
    
    # well_logs: Optional[List[WellLogBase]] = Field(default=None, serialization_alias='Well Logs')
    well_drilling_parameter: Optional[WellDrillingParameterBase] = Field(default=None, serialization_alias='Well Drilling Parameter')
    # well_cores: Optional[List[WellCoreBase]] = Field(default=None, serialization_alias='Well Cores')
    # well_tests: Optional[WellTestBase] = Field(default=None, serialization_alias='Well Tests')
    well_documents: Optional[List[WellDocumentBase]] = Field(default=None, serialization_alias='Well Documents')

class GetActualWellData(BaseModel):
    
    parent_well_id: Optional[UUID] = Field(default=None, foreign_key='wells.id', serialization_alias='Parent Well ID')
    
    well_drilling_parameter: Optional[GetWellDrillingParameterBase] = Field(default=None, serialization_alias='Well Drilling Parameter')
    well_documents: Optional[List[WellDocumentBase]] = Field(default=None, serialization_alias='Well Documents')

class ActualWellBase(WellBaseWithData, ActualWellData):
    seismic_line: Optional[SeismicLineBase] = Field(default=None, serialization_alias='Seismic Line')
    well_cores: Optional[List[WellCoreBase]] = Field(default=None, serialization_alias="Well Cores")
    well_tests: Optional[List[WellTestBase]] = Field(default=None, serialization_alias="Well Tests")

class GetActualWellBase(GetWellBaseWithData, GetActualWellData):
    seismic_line: Optional[GetSeismicLineBase] = Field(default=None, serialization_alias='Seismic Line')
    well_cores: Optional[List[WellCoreBase]] = Field(default=None, serialization_alias="Well Cores")
    well_tests: Optional[List[WellTestBase]] = Field(default=None, serialization_alias="Well Tests")

class UpdateActualWell(ActualWellBase):
    # well_status: Optional[WellStatus] = Field(..., serialization_alias='Well Status')
    # remark: Optional[str] = Field(default=None, serialization_alias='Remark')

    class Meta:
        orm_model = ActualWell

class UpdateActualWellExploration(UpdateActualWell):
    well_cores: Optional[List[WellCoreBase]] = Field(default=None, serialization_alias='Well Cores')
    well_tests: Optional[List[WellTestBase]] = Field(default=None, serialization_alias="Well Tests")

class UpdateActualWellDevelopment(UpdateActualWell):
    pass
        
class GetActualWellExploration(GetActualWellBase):
    well_cores: Optional[List[GetWellCoreBase]] = Field(default=None, serialization_alias='Well Cores')
    well_tests: Optional[List[WellTestBase]] = Field(default=None, serialization_alias="Well Tests")

class GetActualWellDevelpoment(GetActualWellBase):
    pass

class CreateActualWell(ActualWellBase):
    
    area_id: str
    field_id: str
    kkks_id: str
    
    class Meta:
        orm_model = ActualWell

class CreateActualWellDummy(CreateActualWell):
    well_status: Optional[Literal[tuple(const.well_status)]] = Field(..., serialization_alias='Well Status') # type: ignore
    remark: Optional[str] = Field(default=None, serialization_alias='Remark')

class CreateExistingWell(ActualWellBase):
    area_id: str = Field(..., serialization_alias='area_id')
    field_id: str = Field(..., serialization_alias='field_id')

    
    well_cores: Optional[List[WellCoreBase]] = Field(default=None, serialization_alias="Well Cores")
    well_tests: Optional[List[WellTestBase]] = Field(default=None, serialization_alias="Well Tests")
    
    well_status: Optional[Literal[tuple(const.well_status)]] = Field(default=None, serialization_alias='Well Status') # type: ignore
    remark: Optional[str] = Field(default=None, serialization_alias='Remark')
    
    class Meta:
        orm_model = ExistingWell

class UpdateExistingWell(CreateExistingWell):
    pass

class GetWell(BaseModel):
    well_name: str = Field(..., serialization_alias='Well Name')
    area: str = Field(..., serialization_alias='Area')
    field: str = Field(..., serialization_alias='Field')
    well_status: Optional[str] = Field(default=None, serialization_alias='Well Status')  # Izinkan None untuk status
    kkks_id: str = Field(..., serialization_alias='kkks_id')

class ValidateWell(CreateActualWell):
    pass

class WellResponse(BaseModel):
    name: str
    value: UUID

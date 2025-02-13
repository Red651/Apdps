from cmath import phase
import re

from flask import session
from matplotlib import use
from sklearn import base
from app.api.spatial.models import Area
from app.utils.model_bases import CreateBase, EditBase, KKKSInfoBase, AreaInfoBase, FieldInfoBase
from sqlalchemy import VARCHAR, Column, ForeignKeyConstraint, String, ForeignKey, Enum, Text, Float, Date, Integer, event
from sqlalchemy.orm import mapped_column
from app.utils.models_utils import GUID
from app.core.constants import uom, UnitType
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
# from app.api.job.utils import read_data_from_file
import pandas as pd
import uuid
import numpy as np
from app.core.ppdm_database import PPDMBase, ppdm_table,ppdm_table_pk_to_fk, table_fk_from_model
from app.core.public_database import Base
from app.api.utils.models import FileRecord, PhysicalItem

class EnvironmentType(PyEnum):
    MARINE = 'MARINE'
    LAND = 'LAND'
    SWAMP = 'SWAMP'

class DepthDatum(PyEnum):
    RT = 'RT'
    KB = 'KB'
    MSL = 'MSL'

class WellType(PyEnum):
    DELINEATION = "DELINEATION"
    WILDCAT = "WILDCAT"
    INJECTION = 'INJECTION'
    PRODUCER = 'PRODUCER'
    INFILL = 'INFILL'
    STEPOUT = 'STEPOUT'
    
class WellProfileType(PyEnum):
    DIRECTIONAL = 'DIRECTIONAL'
    VERTICAL = 'VERTICAL'

class WellDirectionalType(PyEnum):
    HORIZONTAL = 'HORIZONTAL'
    J_TYPE = 'J-TYPE'
    S_TYPE = 'S-TYPE'

class WellStatus(PyEnum):
    ACTIVE = "Active"
    SUSPENDED = "Suspended"
    ABANDONED = "Abandoned"
    TPA = 'Temporary P&A'
    PA = "P&A"

class CasingType(PyEnum):
    CONDUCTOR_PIPE = 'Conductor Pipe'
    SURFACE_CASING = 'Surface Casing'
    INTERMEDIATE_CASING = 'Intermediate Casing'
    PRODUCTION_CASING = 'Production Casing'
    PRODUCTION_LINER = 'Production Liner'

class LogType(PyEnum):
    WIRELINE_LOG = 'Wireline Log'
    MUD_LOG = 'Mud Log'
    VELOCITY_LOG = 'Velocity Log'

class HydrocarbonTarget(PyEnum):
    OIL = 'OIL'
    GAS = 'GAS'

class WellInstance(PPDMBase, KKKSInfoBase, AreaInfoBase, FieldInfoBase):
    
    __table__ = ppdm_table("well")

    id = __table__.c.uwi
    
    area_id =  __table__.c.area_id
    area_type = __table__.c.area_type
    area = relationship('Area', back_populates='well_instances')
    
    field_id = __table__.c.assigned_field
    field = relationship('Field', back_populates='well_instances')

    kkks_id = __table__.c.operator
    kkks = relationship('KKKS', back_populates='well_instances', foreign_keys=[kkks_id])

    # actual= relationship('ActualWell', back_populates='well_instances')
    
    # Basic Information
    well_name = __table__.c.well_name
    well_num = __table__.c.well_num
    
    # Well Status and Classification
    well_level_type = __table__.c.well_level_type
    well_class = __table__.c.current_class
    well_profile_type = __table__.c.profile_type
    environment_type = __table__.c.environment_type
    
    well_phase = __table__.c.current_status

    # Coordinates
    surface_longitude = __table__.c.surface_longitude
    surface_latitude = __table__.c.surface_latitude
    bottom_hole_longitude = __table__.c.bottom_hole_longitude
    bottom_hole_latitude = __table__.c.bottom_hole_latitude
    
    # Key Dates
    spud_date = __table__.c.spud_date
    final_drill_date = __table__.c.final_drill_date
    completion_date = __table__.c.completion_date
    abandonment_date = __table__.c.abandonment_date
    rig_on_site_date = __table__.c.rig_on_site_date
    rig_release_date = __table__.c.rig_release_date
    
    # Elevations
    difference_lat_msl = __table__.c.difference_lat_msl
    subsea_elev_ref_type = __table__.c.subsea_elev_ref_type
    elev_ref_datum = __table__.c.elev_ref_datum
    
    rotary_table_elev = __table__.c.rotary_table_elev
    rotary_table_elev_uom = __table__.c.rotary_table_elev_ouom
    
    kb_elev = __table__.c.kb_elev
    kb_elev_uom = __table__.c.kb_elev_ouom
    
    derrick_floor_elev = __table__.c.derrick_floor_elev
    derrick_floor_elev_uom = __table__.c.derrick_floor_elev_ouom
    
    ground_elev = __table__.c.ground_elev
    ground_elev_uom = __table__.c.ground_elev_ouom
    ground_elev_type = __table__.c.ground_elev_type
    
    # Depths
    base_depth = __table__.c.base_depth
    base_depth_uom = __table__.c.base_depth_ouom
    
    water_depth = __table__.c.water_depth
    water_depth_datum = __table__.c.water_depth_datum
    water_depth_uom = __table__.c.water_depth_ouom
    
    deepest_depth = __table__.c.deepest_depth
    deepest_depth_uom = __table__.c.deepest_depth_ouom
    
    depth_datum = __table__.c.depth_datum
    depth_datum_elev = __table__.c.depth_datum_elev
    depth_datum_elev_ouom = __table__.c.depth_datum_elev_ouom
    
    drill_td = __table__.c.drill_td
    drill_td_uom = __table__.c.drill_td_ouom
    
    top_depth = __table__.c.top_depth
    top_depth_uom = __table__.c.top_depth_ouom
    
    maximum_tvd = __table__.c.max_tvd
    maximum_tvd_uom = __table__.c.max_tvd_ouom
    
    final_md = __table__.c.final_td
    final_md_uom = __table__.c.final_td_ouom
    
    drill_td = __table__.c.drill_td
    drill_td_uom = __table__.c.drill_td_ouom
    
    plugback_depth = __table__.c.plugback_depth
    plugback_depth_uom = __table__.c.plugback_depth_ouom
    
    whipstock_depth = __table__.c.whipstock_depth
    whipstock_depth_uom = __table__.c.whipstock_depth_ouom
    
    #other
    water_acoustic_vel = __table__.c.water_acoustic_vel
    water_acoustic_vel_uom = __table__.c.water_acoustic_vel_ouom
    
    net_pay = __table__.c.net_pay
    net_pay_uom = __table__.c.net_pay_ouom

    well_additional_data = relationship('AditionalWellData', uselist=False, foreign_keys="AditionalWellData.well_id", cascade="all, delete-orphan")
    
    well_trajectory = relationship('WellTrajectory', uselist=False, cascade="all, delete-orphan")
    well_logs = relationship('WellLog', cascade="all, delete-orphan")
    well_cores = relationship('WellCore', cascade="all, delete-orphan")
    well_tests = relationship('WellTest', cascade="all, delete-orphan")
    seismic_line = relationship('SeismicLine', uselist=False, cascade="all, delete-orphan")
    well_completion = relationship("WellCompletion", cascade="all, delete-orphan")
    well_ppfg = relationship('WellPPFG', uselist=False, cascade="all, delete-orphan")
    well_casings = relationship('PPDMWellTubular', cascade="all, delete-orphan")
    well_schematic = relationship('WellSchematic', uselist=False, cascade="all, delete-orphan")
    well_stratigraphy = relationship('WellStratigraphy', cascade="all, delete-orphan")
    well_pressure = relationship('WellPressure', cascade="all, delete-orphan")
    well_equipments = relationship('PPDMWellEquipment', cascade="all, delete-orphan")

    __mapper_args__ = {
        "polymorphic_on": "well_phase",
    }
    
    __table_args__ = (
        ForeignKeyConstraint(
            [area_id, area_type],
            [Area.id, Area.area_type]),
        {})

    def __init__(self,
                 uwi=None,
                 unit_type=UnitType.METRICS, 
                 maximum_inclination=None, 
                 azimuth=None, 
                 hydrocarbon_target=None, 
                 kick_off_point=None, 
                 parent_well_id=None,
                 *args, 
                 **kwargs
                 ):

        kwargs["area_type"] = "WILAYAH KERJA"
        
        uom_map = uom.get(unit_type, {})
        if uwi:
            self.id = uwi
        else:
            self.id = str(uuid.uuid4())
        
        self.rotary_table_elev_uom = uom_map.get('Length', 'm')
        self.kb_elev_uom = uom_map.get('Length', 'm')
        self.derrick_floor_elev_uom = uom_map.get('Length', 'm')
        self.ground_elev_uom = uom_map.get('Length', 'm')
        self.base_depth_uom = uom_map.get('Length', 'm')
        self.water_depth_uom = uom_map.get('Length', 'm')
        self.depth_datum_elev_ouom = uom_map.get('Length', 'm')
        self.drill_td_uom = uom_map.get('Length', 'm')
        self.top_depth_uom = uom_map.get('Length', 'm')
        self.maximum_tvd_uom = uom_map.get('Length', 'm')
        self.final_md_uom = uom_map.get('Length', 'm')
        self.drill_td_uom = uom_map.get('Length', 'm')
        self.plugback_depth_uom = uom_map.get('Length', 'm')
        self.whipstock_depth_uom = uom_map.get('Length', 'm')
        self.water_acoustic_vel_uom = uom_map.get('Velocity', 'm/s')
        self.net_pay_uom = uom_map.get('Length', 'm')

        self.well_additional_data = AditionalWellData(
            unit_type = unit_type,
            maximum_inclination = maximum_inclination,
            azimuth = azimuth,
            hydrocarbon_target = hydrocarbon_target,
            kick_off_point = kick_off_point,
            kick_off_point_uom = uom_map.get('Length', 'm'),
            parent_well_id = parent_well_id
        )

        kwargs["area_type"] = "WILAYAH KERJA"
        
        super().__init__(*args, **kwargs)
    
    @property
    def unit_type(self):
        return self.well_additional_data.unit_type
    
    @property
    def maximum_inclination(self):
        return self.well_additional_data.maximum_inclination
    
    @property
    def azimuth(self):
        return self.well_additional_data.azimuth
    
    @property
    def hydrocarbon_target(self):
        return self.well_additional_data.hydrocarbon_target
    
    @property
    def kick_off_point(self):
        return self.well_additional_data.kick_off_point
    
    @property
    def parent_well(self):
        return self.well_additional_data.parent_well
    
    @property
    def parent_well_id(self):
        return self.well_additional_data.parent_well_id

    @property
    def parent_well_id(self):
        return self.well_additional_data.parent_well_id

class AditionalWellData(Base):

    __tablename__ = 'well_additional_data'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)

    well_id = ppdm_table_pk_to_fk("well")
    well = relationship('WellInstance', back_populates='well_additional_data', foreign_keys=[well_id])
    
    unit_type = Column(Enum(UnitType))

    maximum_inclination = Column(Float)
    azimuth = Column(Float)
    hydrocarbon_target = Column(String(10))
    kick_off_point = Column(Float)
    kick_off_point_uom = ppdm_table_pk_to_fk("ppdm_unit_of_measure")
    
    #parent well
    parent_well_id = ppdm_table_pk_to_fk("well")
    parent_well = relationship("WellInstance", foreign_keys=[parent_well_id], backref='children', primaryjoin="WellInstance.id == AditionalWellData.parent_well_id")

class PlanWell(WellInstance):
    
    well_drilling_parameter_plan = relationship('WellDrillingParameterPlan', uselist=False)
    
    @property
    def available_data(self):
        return {
            "Well Trajectory": "Available" if self.well_trajectory else "Not Available",
            "Well Casing": "Available" if self.well_casings else "Not Available",
            "Well Schematic": "Available" if self.well_schematic else "Not Available",
            "Well Stratigraphy": "Available" if self.well_stratigraphy else "Not Available",
            "Well Logs": "Available" if self.well_logs else "Not Available",
            "Well Drilling Parameter Plan": "Available" if self.well_drilling_parameter_plan else "Not Available",
            "Well Cores": "Available" if self.well_cores else "Not Available",
            "Well Tests": "Available" if self.well_tests else "Not Available",
            "Seismic Lines": "Available" if self.seismic_line else "Not Available",
            "Well Completion": "Available" if self.well_completion else "Not Available",
            "Well PPFG": "Available" if self.well_ppfg else "Not Available",
            "Well Pressure": "Available" if self.well_pressure else "Not Available",
            "Well Equipments": "Available" if self.well_equipments else "Not Available",
        }

    __mapper_args__ = {
        "polymorphic_identity": "plan",
    }

class ActualWell(WellInstance):
    
    well_drilling_parameter = relationship('WellDrillingParameter', uselist=False)
    well_documents = relationship('WellDocument')
    
    well_status = ppdm_table("well").c.status_type
    remark = ppdm_table("well").c.remark
    
    @property
    def available_data(self):
        return {
            "Well Trajectory": "Available" if self.well_trajectory else "Not Available",
            "Well Casing": "Available" if self.well_casings else "Not Available",
            "Well Schematic": "Available" if self.well_schematic else "Not Available",
            "Well Stratigraphy": "Available" if self.well_stratigraphy else "Not Available",
            "Well Logs": "Available" if self.well_logs else "Not Available",
            "Well Drilling Parameter": "Available" if self.well_drilling_parameter else "Not Available",
            "Well Cores": "Available" if self.well_cores else "Not Available",
            "Well Tests": "Available" if self.well_tests else "Not Available",
            "Well Documents": "Available" if self.well_documents else "Not Available",
            "Seismic Lines": "Available" if self.seismic_line else "Not Available",
            "Well Completion": "Available" if self.well_completion else "Not Available",
            "Well PPFG": "Available" if self.well_ppfg else "Not Available",
            "Well Pressure": "Available" if self.well_pressure else "Not Available",
            "Well Equipments": "Available" if self.well_equipments else "Not Available",
            "Well Documents": "Available" if self.well_documents else "Not Available",
        }
    
    __mapper_args__ = {
        "polymorphic_identity": "actual",
    }

class ExistingWell(WellInstance):

    well_drilling_parameter = relationship('WellDrillingParameter', uselist=False)
    well_documents = relationship('WellDocument')
    
    well_status = ppdm_table("well").c.status_type
    remark = ppdm_table("well").c.remark
    
    plan_workover = relationship('PlanWorkover')
    actual_workover = relationship('ActualWorkover')
    plan_well_service = relationship('PlanWellService')
    actual_well_service = relationship('ActualWellService')
    
    __mapper_args__ = {
        "polymorphic_identity": "existing",
    }
    
    @property
    def available_data(self):
        return {
            "Well Trajectory": "Available" if self.well_trajectory else "Not Available",
            "Well Casing": "Available" if self.well_casings else "Not Available",
            "Well Schematic": "Available" if self.well_schematic else "Not Available",
            "Well Stratigraphy": "Available" if self.well_stratigraphy else "Not Available",
            "Well Logs": "Available" if self.well_logs else "Not Available",
            "Well Drilling Parameter": "Available" if self.well_drilling_parameter else "Not Available",
            "Well Cores": "Available" if self.well_cores else "Not Available",
            "Well Tests": "Available" if self.well_tests else "Not Available",
            "Well Documents": "Available" if self.well_documents else "Not Available",
            "Seismic Lines": "Available" if self.seismic_line else "Not Available",
            "Well Completion": "Available" if self.well_completion else "Not Available",
            "Well PPFG": "Available" if self.well_ppfg else "Not Available",
            "Well Pressure": "Available" if self.well_pressure else "Not Available",
            "Well Equipments": "Available" if self.well_equipments else "Not Available",
            "Well Documents": "Available" if self.well_documents else "Not Available",
        }


class WellDigitalDataType(PyEnum):
    WELL_LOG_PLAN = "Well Log Plan"
    WELL_LOG = "Well Log"
    WELL_TRAJECTORY = "Well Trajectory"
    WELL_PPFG = "Well PPFG"
    WELL_DRILLING_PARAMETER_PLAN = "Well Drilling Parameter Plan"
    WELL_DRILLING_PARAMETER = "Well Drilling Parameter"
    WELL_TEST_PLAN = "Well Test Plan"
    WELL_TEST = "Well Test"
    WELL_MATERIALS = "Well Materials"
    WELL_CORE_PLAN = "Well Core Plan"
    WELL_TRAJECTORY_PLAN = "Well Trajectory Plan"


class InformationItemContent(PPDMBase):
    
    __table__ = ppdm_table("rm_info_item_content")
    
    info_item_subtype = __table__.c.info_item_subtype
    information_item_id = __table__.c.information_item_id
    content_obs_no = __table__.c.content_obs_no
    
    well_dir_survey = relationship('PPDMWellDirSurvey', uselist=False)
    
    well_core = relationship('PPDMWellCore', uselist=False)
    
    well_log = relationship('PPDMWellLog', uselist=False)
    
    seismic_line = relationship('PPDMSeismicLine', uselist=False)
    
    physical_item_id = __table__.c.physical_item_id
    physical_item = relationship(
        "PhysicalItem", 
        uselist=False, 
        foreign_keys=[physical_item_id],
        primaryjoin=(
            (PhysicalItem.id == physical_item_id)
        )
    )


class WellDigitalData(Base):
    
    __allow_recursive__ = False

    __tablename__ = 'well_digital_data'

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    unit_type = Column(Enum(UnitType), nullable=False)
    
    well_instance_id = ppdm_table_pk_to_fk("well")

    file_id = Column(GUID(), ForeignKey('files.id'), nullable=True)
    file = relationship('FileRecord', foreign_keys=[file_id])
    
    information_item_id = mapped_column(
        ppdm_table("rm_info_item_content").c.information_item_id.type,
        ForeignKey(ppdm_table("rm_info_item_content").c.information_item_id),
    )
    
    data_type = Column(Enum(WellDigitalDataType))
    
    @property
    def filename(self):
        return self.file.filename
    @filename.setter
    def filename(self, value):
        pass
    
    @property
    def data(self):
        
        if self.file.file_extension == '.csv':
            df = pd.read_csv(self.file.file_location)
            df = df.replace({np.nan: None})
            return df.to_dict(orient='records')
        elif self.file.file_extension == '.xlsx':
            df = pd.read_excel(self.file.file_location, engine='openpyxl')
            df = df.replace({np.nan: None})
            return df.to_dict(orient='records')
        elif self.file.file_extension == '.xls':
            df = pd.read_excel(self.file.file_location)
            df = df.replace({np.nan: None})
            return df.to_dict(orient='records')
        
        return None

    @data.setter
    def data(self, value):
        pass
    
    __mapper_args__ = {
        'polymorphic_on': 'data_type'
    }

class WellLogPlan(WellDigitalData):
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_LOG_PLAN,
    }

class PPDMWellLog(PPDMBase):
    __table__ = ppdm_table("well_log")
    
    uwi = __table__.c.uwi
    well_log_id = __table__.c.well_log_id
    source = __table__.c.source

    top_depth = __table__.c.top_depth
    top_depth_ouom = __table__.c.top_depth_ouom

    base_depth = __table__.c.base_depth
    base_depth_ouom = __table__.c.base_depth_ouom
    
    logs = __table__.c.remark

    def __init__(self, unit_type,*args, **kwargs):
        
        self.top_depth_ouom = uom[unit_type]["Length"]
        self.base_depth_ouom = uom[unit_type]["Length"]
        
        kwargs["well_log_id"] = str(uuid.uuid4()) if kwargs.get("well_log_id", None) is None else kwargs.get("well_log_id", None)
        kwargs["source"] = "ApDPS" if kwargs.get("source", None) is None else kwargs.get("source", None)
        
        super().__init__(*args, **kwargs)

class WellLog(WellDigitalData):
    
    __allow_recursive__ = False
    
    information_item_id = mapped_column(
        ppdm_table("rm_info_item_content").c.information_item_id.type,
        ForeignKey(ppdm_table("rm_info_item_content").c.information_item_id),
        use_existing_column=True
    )
    
    info_item_content = relationship(
        'InformationItemContent', 
        uselist=False, 
        foreign_keys=[
            information_item_id
        ]
    )

    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_LOG,
    }
    
    @property
    def physical_item_id(self):
        return self.info_item_content.physical_item_id
    
    @property
    def top_depth(self):
        return self.info_item_content.well_log.top_depth
    
    @property
    def base_depth(self):
        return self.info_item_content.well_log.base_depth
    
    @property
    def logs(self):
        return self.info_item_content.well_log.logs
    
    def __init__(self, uwi, unit_type, physical_item_id=None, top_depth=None, base_depth=None, logs=None, *args, **kwargs):

        self.info_item_content = InformationItemContent(
            info_item_subtype = "RM_LOG",
            information_item_id = str(uuid.uuid4()),
            content_obs_no = 1,
            well_log = PPDMWellLog(
                uwi = uwi,
                unit_type = unit_type,
                top_depth = top_depth,
                base_depth = base_depth,
                logs = logs,
            ),
            physical_item_id = physical_item_id
        )
        
        kwargs['well_instance_id'] = uwi
        kwargs['unit_type'] = unit_type
        kwargs['file_id'] = physical_item_id
        
        super().__init__(*args, **kwargs)

class PPDMWellDirSurvey(PPDMBase):
    
    __allow_recursive__ = False

    __table__ = ppdm_table("well_dir_srvy")
    
    uwi = __table__.c.uwi
    survey_id = __table__.c.survey_id
    source = __table__.c.source
    
    survey_start_date = __table__.c.survey_start_date
    survey_end_date = __table__.c.survey_end_date
    top_depth = __table__.c.top_depth
    top_depth_ouom = __table__.c.top_depth_ouom
    survey_type = __table__.c.survey_type
    base_depth = __table__.c.base_depth
    base_depth_ouom = __table__.c.base_depth_ouom
    
    def __init__(self, unit_type,*args, **kwargs):
        
        self.top_depth_ouom = uom[unit_type]["Length"]
        self.base_depth_ouom = uom[unit_type]["Length"]
        
        kwargs["survey_id"] = str(uuid.uuid4()) if kwargs.get("survey_id", None) is None else kwargs.get("survey_id", None)
        kwargs["source"] = "ApDPS" if kwargs.get("source", None) is None else kwargs.get("source", None)
        
        super().__init__(*args, **kwargs)

class WellTrajectoryPlan(WellDigitalData):
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_TRAJECTORY_PLAN,
    }

class WellTrajectory(WellDigitalData):
    
    __allow_recursive__ = False

    information_item_id = mapped_column(
        ppdm_table("rm_info_item_content").c.information_item_id.type,
        ForeignKey(ppdm_table("rm_info_item_content").c.information_item_id),
        use_existing_column=True
    )
    
    info_item_content = relationship(
        'InformationItemContent', 
        uselist=False, 
        foreign_keys=[
            information_item_id
        ]
    )
    
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_TRAJECTORY,
    }
    
    @property
    def survey_start_date(self):
        return self.info_item_content.well_dir_survey.survey_start_date
    
    @property
    def survey_end_date(self):
        return self.info_item_content.well_dir_survey.survey_end_date
    
    @property
    def survey_type(self):
        return self.info_item_content.well_dir_survey.survey_type
    
    @property
    def top_depth(self):
        return self.info_item_content.well_dir_survey.top_depth
    
    @property
    def base_depth(self):
        return self.info_item_content.well_dir_survey.base_depth
    
    @property
    def physical_item_id(self):
        return self.info_item_content.physical_item_id
    
    def __init__(self, uwi, unit_type, survey_start_date=None, survey_end_date=None, top_depth=None, survey_type=None, base_depth=None, physical_item_id=None, **kwargs):
            
        self.info_item_content = InformationItemContent(
            info_item_subtype = "RM_LOG",
            information_item_id = str(uuid.uuid4()),
            content_obs_no = 1,
            well_dir_survey = PPDMWellDirSurvey(
                uwi = uwi,
                unit_type = unit_type,
                survey_start_date = survey_start_date,
                survey_end_date = survey_end_date,
                top_depth = top_depth,
                survey_type = survey_type,
                base_depth = base_depth,
            ),
            physical_item_id = physical_item_id
        )
        
        kwargs['well_instance_id'] = uwi
        kwargs['unit_type'] = unit_type
        kwargs['file_id'] = physical_item_id
        
        super().__init__(**kwargs)

class WellPPFG(WellDigitalData):
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_PPFG,
    }

class WellDrillingParameterPlan(WellDigitalData):
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_DRILLING_PARAMETER_PLAN,
    }

class WellDrillingParameter(WellDigitalData):
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_DRILLING_PARAMETER,
    }

class WellTestPlan(WellDigitalData):
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_TEST_PLAN,
    }

class WellMaterials(WellDigitalData):
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_MATERIALS,
    }

class PPDMEquipment(PPDMBase):
    
    __allow_recursive__ = False
    
    __table__ = ppdm_table("equipment")
    
    equipment_id = __table__.c.equipment_id
    
    purchase_date = __table__.c.purchase_date
    commission_date = __table__.c.commission_date
    decommission_date = __table__.c.decommission_date
    equipment_group = __table__.c.equipment_group
    equipment_name = __table__.c.equipment_name
    equipment_type = __table__.c.equipment_type
    serial_num = __table__.c.serial_num
    description = __table__.c.description
    remark = __table__.c.remark
    
    def __init__(self, *args, **kwargs):
        
        self.equipment_id = str(uuid.uuid4()) if kwargs.get("equipment_id", None) is None else kwargs.get("equipment_id", None)
        
        super().__init__(*args, **kwargs)
    
class PPDMWellEquipment(PPDMBase):
    
    __allow_recursive__ = False
    
    __table__ = ppdm_table("well_equipment")
    
    uwi = __table__.c.uwi
    source = __table__.c.source
    equipment_id = __table__.c.equipment_id
    equip_obs_no = __table__.c.equip_obs_no
    
    equipment = relationship("PPDMEquipment", uselist=False, foreign_keys=[equipment_id])
    
    
    @property
    def purchase_date(self):
        return self.equipment.purchase_date
    
    @property
    def commission_date(self):
        return self.equipment.commission_date
    
    @property
    def decommission_date(self):
        return self.equipment.decommission_date
    
    @property
    def equipment_group(self):
        return self.equipment.equipment_group
    
    @property
    def equipment_name(self):
        return self.equipment.equipment_name
    
    @property
    def equipment_type(self):
        return self.equipment.equipment_type
    
    @property
    def serial_num(self):
        return self.equipment.serial_num
    
    @property
    def description(self):
        return self.equipment.description
    
    @property
    def remark(self):
        return self.equipment.remark
    
    def __init__(self, equip_obs_no, purchase_date=None, commission_date=None, decommission_date=None, equipment_group=None, equipment_name=None, equipment_type=None, serial_num=None, description=None, remark=None, *args, **kwargs):
        
        self.equip_obs_no = equip_obs_no
        
        self.equipment = PPDMEquipment(
            purchase_date=purchase_date,
            commission_date=commission_date,
            decommission_date=decommission_date,
            equipment_group=equipment_group, 
            equipment_name=equipment_name, 
            equipment_type=equipment_type, 
            serial_num=serial_num, 
            description=description, 
            remark=remark
        )
        
        kwargs['source'] = "ApDPS"
        
        super().__init__(*args, **kwargs)

class PPDMSeismicLine(PPDMBase):
    
    __allow_recursive__ = False
    
    __table__ = ppdm_table('seis_set')
    
    seis_set_subtype = __table__.c.seis_set_subtype
    seis_set_id = __table__.c.seis_set_id
    
    def __init__(self, *args, **kwargs):
        
        self.seis_set_subtype = 'SEIS_LINE'
        self.seis_set_id = str(uuid.uuid4())
        
        super().__init__(*args, **kwargs)

class SeismicLine(Base):
    
    __allow_recursive__ = False
    
    __tablename__ = 'seismic_lines'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    well_instance_id = ppdm_table_pk_to_fk("well")
    
    seismic_line_name = Column(String(50))
    average_velocity = Column(Float)
    shot_point_number = Column(Integer)
    
    information_item_id = mapped_column(
        ppdm_table("rm_info_item_content").c.information_item_id.type,
        ForeignKey(ppdm_table("rm_info_item_content").c.information_item_id),
        use_existing_column=True
    )

    info_item_content = relationship(
        'InformationItemContent', 
        uselist=False, 
        foreign_keys=[
            information_item_id
        ]
    )
    
    file_id = Column(GUID(), ForeignKey('files.id'), nullable=True)
    file = relationship('FileRecord', foreign_keys=[file_id])
    
    @property
    def filename(self):
        return self.file.filename
    
    @property
    def physical_item_id(self):
        return self.info_item_content.physical_item.id
    
    @property
    def max_latitude(self):
        return self.info_item_content.seismic_line.max_latitude
    
    @property
    def max_longitude(self):
        return self.info_item_content.seismic_line.max_longitude
    
    @property
    def min_latitude(self):
        return self.info_item_content.seismic_line.min_latitude
    
    @property
    def min_longitude(self):
        return self.info_item_content.seismic_line.min_longitude
    
    @property
    def remark(self):
        return self.info_item_content.seismic_line.remark
    
    def __init__(self, uwi, physical_item_id=None, seismic_line_name=None, average_velocity=None, shot_point_number=None, max_latitude=None, max_longitude=None, min_latitude=None, min_longitude=None, remark=None, **kwargs):
        
        self.seismic_line_name = seismic_line_name
        self.average_velocity = average_velocity
        self.shot_point_number = shot_point_number
        
        self.info_item_content = InformationItemContent(
            info_item_subtype = "RM_SEISMIC",
            information_item_id = str(uuid.uuid4()),
            content_obs_no = 1,
            seismic_line = PPDMSeismicLine(
                max_latitude = max_latitude,
                max_longitude = max_longitude,
                min_latitude = min_latitude,
                min_longitude = min_longitude,
                remark = remark,
            ),
            physical_item_id = physical_item_id
        )
        
        self.file_id = physical_item_id
        
        kwargs['well_instance_id'] = uwi
        
        super().__init__(**kwargs)
    
class WellCorePlan(WellDigitalData):
    __mapper_args__ = {
        'polymorphic_identity': WellDigitalDataType.WELL_CORE_PLAN,
    }
    
class PPDMWellCore(PPDMBase):
    
    __allow_recursive__ = False
    
    __table__ = ppdm_table("well_core")
    
    uwi = __table__.c.uwi
    core_id = __table__.c.core_id
    source = __table__.c.source
    
    top_depth = __table__.c.top_depth
    top_depth_ouom = __table__.c.top_depth_ouom
    
    base_depth = __table__.c.base_depth
    base_depth_ouom = __table__.c.base_depth_ouom
    
    core_diameter = __table__.c.core_diameter
    core_diameter_ouom = __table__.c.core_diameter_ouom
    
    core_type = __table__.c.core_type
    core_show_type = __table__.c.core_show_type
    
    remark = __table__.c.remark
    
    def __init__(self, uwi, unit_type, *args, **kwargs):
        
        kwargs["core_id"] = str(uuid.uuid4()) if kwargs.get("core_id", None) is None else kwargs.get("core_id", None)
        kwargs["source"] = "ApDPS" if kwargs.get("source", None) is None else kwargs.get("source", None)
        
        self.uwi = uwi
        self.top_depth_ouom = uom[unit_type]["Length"]
        self.base_depth = uom[unit_type]["Length"]
        self.core_diameter_ouom = uom[unit_type]["Diameter"]
        
        super().__init__(*args, **kwargs)

class WellCore(Base):
    
    __allow_recursive__ = False

    __tablename__ = 'well_cores'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    well_instance_id = ppdm_table_pk_to_fk("well")

    information_item_id = mapped_column(
        ppdm_table("rm_info_item_content").c.information_item_id.type,
        ForeignKey(ppdm_table("rm_info_item_content").c.information_item_id),
        use_existing_column=True
    )

    info_item_content = relationship(
        'InformationItemContent', 
        uselist=False, 
        foreign_keys=[
            information_item_id
        ]
    )
    
    image_file_id = Column(GUID(), ForeignKey('files.id'), nullable=True)
    image_file = relationship('FileRecord', foreign_keys=[image_file_id])
    
    unit_type = Column(Enum(UnitType), nullable=False)
    
    @property
    def physical_item_id(self):
        return self.info_item_content.physical_item.id
    
    @property
    def top_depth(self):
        return self.info_item_content.well_core.top_depth
    
    @property
    def base_depth(self):
        return self.info_item_content.well_core.base_depth
    
    @property
    def core_diameter(self):
        return self.info_item_content.well_core.core_diameter
    
    @property
    def core_type(self):
        return self.info_item_content.well_core.core_type
    
    @property
    def core_show_type(self):
        return self.info_item_content.well_core.core_show_type
    
    @property
    def remark(self):
        return self.info_item_content.well_core.remark
    
    def __init__(self, uwi, unit_type, physical_item_id=None, top_depth=None, base_depth=None, core_diameter=None, core_type=None, core_show_type=None, remark=None, **kwargs):
        
        self.unit_type = unit_type
            
        self.info_item_content = InformationItemContent(
            info_item_subtype = "RM_LITH_SAMPLE",
            information_item_id = str(uuid.uuid4()),
            content_obs_no = 1,
            well_core = PPDMWellCore(
                uwi = uwi,
                unit_type = unit_type,
                top_depth = top_depth,
                base_depth = base_depth,
                core_diameter = core_diameter,
                core_type = core_type,
                core_show_type = core_show_type,
                remark = remark
            ),
            physical_item_id = physical_item_id
        )
        
        self.image_file_id = physical_item_id
        
        kwargs['well_instance_id'] = uwi
        
        super().__init__(**kwargs)

class PPDMWellCement(PPDMBase):

    __table__ = ppdm_table("well_cement")
    
    # uwi = __table__.c.uwi
    
    cement_obs_no = __table__.c.cement_obs_no
    
    cement_type = __table__.c.cement_type

    cement_amount = __table__.c.cement_amount
    cement_amount_uom = __table__.c.cement_amount_uom
    
    
    def __init__(self, *args, **kwargs):
        
        self.cement_obs_no = 1
        
        super().__init__(*args, **kwargs)
    
class PPDMWellTubular(PPDMBase):
    
    __allow_recursive__ = False
    
    __table__ = ppdm_table("well_tubular")
    
    uwi = __table__.c.uwi
    source = __table__.c.source
    tubing_type = __table__.c.tubing_type
    tubing_obs_no = __table__.c.tubing_obs_no
    
    top_depth = __table__.c.hung_top_depth
    top_depth_ouom = __table__.c.hung_top_depth_ouom
    
    base_depth = __table__.c.base_depth
    base_depth_ouom = __table__.c.base_depth_ouom
    
    hole_size = __table__.c.hole_size
    hole_size_ouom = __table__.c.hole_size_ouom
    
    inside_diameter = __table__.c.inside_diameter
    inside_diameter_ouom = __table__.c.inside_diameter_ouom
    
    outside_diameter = __table__.c.outside_diameter
    outside_diameter_ouom = __table__.c.outside_diameter_ouom
    
    remark = __table__.c.remark
    
    cement = relationship('PPDMWellCement', uselist=False, cascade="all, delete")
    
    @property
    def cement_type(self):
        return self.cement.cement_type
    
    @property
    def cement_amount(self):
        return self.cement.cement_amount
    
    @property
    def cement_amount_uom(self):
        return self.cement.cement_amount_uom
    
    def __init__(self, uwi, tubing_obs_no, cement_type=None, cement_amount=None, cement_amount_uom=None, *args, **kwargs):
        
        self.tubing_obs_no = tubing_obs_no
        
        kwargs['source'] = "ApDPS"
        
        kwargs['tubing_type'] = "CASING"
        
        self.cement = PPDMWellCement(
            uwi = uwi,
            cement_type = cement_type,
            cement_amount = cement_amount,
            cement_amount_uom = cement_amount_uom,
        )
        
        super().__init__(*args, **kwargs)

class WellPressure(PPDMBase):
    
    __allow_recursive__ = False
    
    __table__ = ppdm_table("well_pressure")
    
    uwi = __table__.c.uwi
    source = __table__.c.source
    
    def __init__(self, *args, **kwargs):
        
        kwargs["source"] = "ApDPS" if kwargs.get("source", None) is None else kwargs.get("source", None)
        
        super().__init__(*args, **kwargs)

class WellTest(PPDMBase):
    
    __allow_recursive__ = False
    
    __table__ = ppdm_table("well_test")

    uwi = __table__.c.uwi
    source = __table__.c.source
    
    def __init__(self, *args, **kwargs):
        
        kwargs["source"] = "ApDPS" if kwargs.get("source", None) is None else kwargs.get("source", None)
        
        super().__init__(*args, **kwargs)

class WellCompletion(PPDMBase):
    
    __allow_recursive__ = False
    
    __table__ = ppdm_table("well_completion")
    
    uwi = __table__.c.uwi
    source = __table__.c.source
    
    def __init__(self, *args, **kwargs):
        
        kwargs["source"] = "ApDPS" if kwargs.get("source", None) is None else kwargs.get("source", None)
        
        super().__init__(*args, **kwargs)

class WellSchematic(Base):

    __tablename__ = 'job_well_schematics'

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    well_id = ppdm_table_pk_to_fk("well")
    # well_instance = relationship('WellInstance', back_populates='well_schematic')
    
    file_id = Column(GUID(), ForeignKey('files.id'), nullable=True)
    file = relationship('FileRecord', foreign_keys=[file_id])
    
    @property
    def filename(self):
        return self.file.filename
    @filename.setter
    def filename(self, value):
        pass

class WellStratigraphy(Base):
    
    __allow_recursive__ = False
    
    
    __tablename__ = 'well_stratigraphy'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    unit_type = Column(Enum(UnitType))
    
    well_id = ppdm_table_pk_to_fk("well")
    # well_instance = relationship("WellInstance", back_populates='well_stratigraphy')
    
    depth_datum = Column(Enum(DepthDatum))
    
    top_depth = Column(Float)
    bottom_depth = Column(Float)
    depth_uom = Column(String(20))
    
    formation_name = Column(String(50))
    lithology = Column(String(255))

    def __init__(self, unit_type: str, *args, **kwargs):
        self.unit_type = unit_type

        # Set depth_uom based on unit_type
        if unit_type in uom and 'Length' in uom[unit_type]:
            self.depth_uom = uom[unit_type]['Length']
        else:
            self.depth_uom = 'm'
        
        super().__init__(*args, **kwargs)

class WellDocumentType(PyEnum):
    WELL_REPORT = "Well Report"
    DRILLING_LOG = "Drilling Log"
    COMPLETION_REPORT = "Completion Report"
    WELLBORE_DIAGRAM = "Wellbore Diagram"
    WELL_TEST_REPORT = "Well Test Report"
    PRODUCTION_LOG = "Production Log"
    WELL_WORKOVER_REPORT = "Well Workover Report"
    WELLHEAD_INSPECTION = "Wellhead Inspection"
    CASING_REPORT = "Casing Report"
    CEMENTING_REPORT = "Cementing Report"
    PORE_PRESSURE_PREDICTION = "Pore Pressure Prediction"
    FRACTURE_GRADIENT_REPORT = "Fracture Gradient Report"
    WELL_TRAJECTORY = "Well Trajectory"
    LOGGING_REPORT = "Logging Report"
    MUD_LOGGING_REPORT = "Mud Logging Report"
    WELL_SITE_SURVEY = "Well Site Survey"
    GEOMECHANICAL_REPORT = "Geomechanical Report"
    RESERVOIR_CHARACTERIZATION = "Reservoir Characterization"
    CORE_ANALYSIS_REPORT = "Core Analysis Report"
    WELL_COMPLETION_SUMMARY = "Well Completion Summary"
    DRILLING_FLUID_REPORT = "Drilling Fluid Report"
    WELL_ABANDONMENT_REPORT = "Well Abandonment Report"
    HSE_REPORT = "HSE Report"

class WellDocument(Base):
    
    __tablename__ = 'well_documents'

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)

    file_id = Column(GUID(), ForeignKey('files.id'), nullable=True)
    file = relationship('FileRecord', foreign_keys=[file_id])

    well_id = ppdm_table_pk_to_fk("well")
    # actual_well = relationship('ActualWell', back_populates='well_documents')

    document_type = Column(Enum(WellDocumentType))
    
    @property
    def filename(self):
        return self.file.filename
    @filename.setter
    def filename(self, value):
        pass
    
    remark = Column(Text)
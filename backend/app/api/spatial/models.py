from shapely import area
from sqlalchemy.orm import relationship
from sqlalchemy import VARCHAR, Column, String, ForeignKey, JSON, Enum, Text, ForeignKeyConstraint
from enum import Enum as PyEnum
import uuid
from app.utils.models_utils import GUID
from app.core.ppdm_database import PPDMBase, ppdm_table,ppdm_table_pk_to_fk, table_fk_from_model
from app.core.public_database import Base

class AreaPhase(PyEnum):
    EXPLORATION = "EXPLORATION"
    DEVELOPMENT = "DEVELOPMENT"

class AreaType(PyEnum):
    CONVENTIONAL = "CONVENTIONAL"
    MNK = "MNK"
    GMB = "GMB"

class AreaPosition(PyEnum):
    ONSHORE = "ONSHORE"
    OFFSHORE = "OFFSHORE"
    ONSHORE_AND_OFFSHORE = "ONSHORE_AND_OFFSHORE"

class AreaProductionStatus(PyEnum):
    NONPRODUCTION = 'NONPRODUCTION'
    DEVELOPMENT = 'DEVELOPMENT'
    PRODUCTION = 'PRODUCTION'
    OFF = 'OFF'

class AreaRegion(PyEnum):
    REGION_I = 'REGION_I'
    REGION_II = 'REGION_II'
    REGION_III = 'REGION_III'
    REGION_IV = 'REGION_IV'
    REGION_V = 'REGION_V'
    REGION_VI = 'REGION_VI'

field_area = ppdm_table("field_area")

class Field(Base):

    __table__ = ppdm_table("field")
    
    id = __table__.c.field_id
    
    name = __table__.c.field_name
    type = __table__.c.field_type

    jobs = relationship("Job", back_populates='field', cascade="all, delete-orphan")
    well_instances = relationship("WellInstance", back_populates="field", cascade="all, delete-orphan")
    
    field_info = relationship("FieldInfo", back_populates="field", uselist=False)
    
    def __str__(self):
        return self.name
    
    def __init__(self, geojson, *args, **kwargs):
        
        self.field_info = FieldInfo(
            geojson=geojson
        )
        
        kwargs["id"] = str(uuid.uuid4()) if kwargs.get("id", None) is None else kwargs.get("id", None)
        
        super().__init__(*args, **kwargs)
        
    @property
    def geojson(self):
        return self.field_info.geojson

class FieldInfo(Base):
    
    __tablename__ = "field_info"
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    field_id = ppdm_table_pk_to_fk("field")
    field = relationship("Field", back_populates="field_info")
    
    geojson = Column(JSON)

class Area(PPDMBase):
    
    __table__ = ppdm_table("area")
    
    id = __table__.c.area_id
    area_type = __table__.c.area_type
    
    area_info = relationship("AreaInfo", back_populates='area', uselist=False)
    
    # Relationship to Field
    fields = relationship(
        'Field',
        secondary=field_area,
        primaryjoin=(
            (field_area.c.area_id == id) &
            (field_area.c.area_type == area_type)
        ),
        secondaryjoin=(field_area.c.field_id ==  Field.id)
    )
    
    jobs = relationship("Job", back_populates='area', cascade="all, delete-orphan")
    well_instances = relationship("WellInstance", back_populates="area", cascade="all, delete-orphan")
    
    name = __table__.c.preferred_name
    
    area_max_latitude = __table__.c.area_max_latitude
    area_max_longitude = __table__.c.area_max_longitude
    area_min_latitude = __table__.c.area_min_latitude
    area_min_longitude = __table__.c.area_min_longitude
    
    def __str__(self):
        return self.name
    
    def __init__(self, label, phase, type, position, production_status, region, geojson, *args, **kwargs):
        
        self.area_info = AreaInfo(
            label = label,
            phase = phase,
            type = type,
            position = position,
            production_status = production_status,
            region = region,
            geojson = geojson
        )
        
        kwargs["id"] = str(uuid.uuid4()) if kwargs.get("id", None) is None else kwargs.get("id", None)
        kwargs["area_type"] = "WILAYAH KERJA"
        
        super().__init__(*args, **kwargs)
    
    @property
    def label(self):
        return self.area_info.label
    
    @property
    def phase(self):
        return self.area_info.phase
    
    @property
    def type(self):
        return self.area_info.type
    
    @property
    def position(self):
        return self.area_info.position
    
    @property
    def production_status(self):
        return self.area_info.production_status
    
    @property
    def region(self):
        return self.area_info.region
    
    @property
    def geojson(self):
        return self.area_info.geojson

class AreaInfo(Base):
    
    __tablename__ = "area_info"
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    area_id = Column(VARCHAR(length=40))
    area_type = Column(VARCHAR(length=40))
    area = relationship("Area", back_populates="area_info")
    
    label = Column(String(50), unique=True)
    phase = Column(Enum(AreaPhase))
    type = Column(Enum(AreaType))
    position = Column(Enum(AreaPosition))
    production_status = Column(Enum(AreaProductionStatus))
    region = Column(Enum(AreaRegion))
    geojson = Column(JSON)
    
    __table_args__ = (
        ForeignKeyConstraint(
            [area_id, area_type],
            [Area.id, Area.area_type]),
        {})
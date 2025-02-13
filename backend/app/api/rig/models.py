from matplotlib import use
from sqlalchemy import Column, ForeignKey, Enum, Text, String, Integer, VARCHAR, ForeignKeyConstraint
from app.utils.models_utils import GUID
from sqlalchemy.orm import relationship
import uuid
from enum import Enum as PyEnum
from app.core.ppdm_database import PPDMBase, ppdm_table,ppdm_table_pk_to_fk, table_fk_from_model
from app.core.public_database import Base

class RigType(PyEnum):
    LAND = "Land"
    JACKUP = "Jackup"
    SEMI_SUBMERSIBLE = "Semi-Submersible"
    DRILLSHIP = "Drillship"
    PLATFORM = "Platform"
    TENDER = "Tender"
    BARGE = "Barge"
    INLAND_BARGE = "Inland Barge"
    SUBMERSIBLE = "Submersible"

class Rig(PPDMBase):
    
    __table__ = ppdm_table("sf_rig")
    
    id = __table__.c.rig_id

    rig_name = __table__.c.rig_name
    sf_subtype = __table__.c.sf_subtype
    
    rig_info = relationship("RigInfo", cascade="all, delete-orphan", uselist=False)
    
    jobs = relationship('JobInstance', back_populates='rig')
    
    def __init__(self, rig_horse_power, rig_type, *args, **kwargs):

        self.sf_subtype = "SF_RIG"

        self.rig_info = RigInfo(
            rig_horse_power = rig_horse_power,
            rig_type = rig_type
        )

        kwargs["id"] = str(uuid.uuid4()) if kwargs.get("id", None) is None else kwargs.get("id", None)
        
        super().__init__(*args, **kwargs)
    
    @property
    def rig_horse_power(self):
        return self.rig_info.rig_horse_power
    
    @property
    def rig_type(self):
        return self.rig_info.rig_type


class RigInfo(Base):
    
    __tablename__ = "rig_info"
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    rig_id = Column(VARCHAR(40))
    sf_subtype = Column(VARCHAR(30))
    rig_horse_power = Column(Integer)
    rig_type = Column(Enum(RigType))
    
    __table_args__ = (ForeignKeyConstraint(
        [rig_id, sf_subtype],
        [Rig.id, Rig.sf_subtype]),
    {})
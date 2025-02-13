from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.api.spatial.models import Area
from app.core.ppdm_database import PPDMBase, ppdm_table,ppdm_table_pk_to_fk, table_fk_from_model
from app.core.public_database import Base
from enum import Enum as PyEnum
import uuid
from app.utils.models_utils import GUID

class Role(PyEnum):
    Admin = "Admin"
    KKKS = "KKKS"

class User(Base):
    
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(128))
    role = Column(Enum(Role), nullable=False)
    
    is_superuser = Column(Boolean, default=False, nullable=False)

    def __str__(self):
        return self.username
    
    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": role
    }

class Admin(User):
    __tablename__ = 'user_admin'
    
    id = Column(GUID(), ForeignKey('users.id'), primary_key=True)
    
    __mapper_args__ = {
        "polymorphic_identity": Role.Admin,
    }

ba_component = ppdm_table("ba_component")

class KKKS(PPDMBase):
    __table__ = ppdm_table('business_associate')

    id = __table__.c.business_associate_id
    name = __table__.c.ba_long_name

    users = relationship("KKKSUser", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="kkks", cascade="all, delete-orphan")
    
    area = relationship(
        'Area',
        secondary=ba_component,
        primaryjoin=(
            (ba_component.c.business_associate_id == id)
        ),
        secondaryjoin=(
            (ba_component.c.area_id == Area.id) &
            (ba_component.c.area_type == Area.area_type)
        ),
        uselist=False
    )
    
    well_instances = relationship(
        "WellInstance",
        back_populates="kkks",
        foreign_keys="WellInstance.kkks_id"
    )
    
    def __str__(self):
        return self.name

class AdditionalKKKSInfo(Base):
    __tablename__ = 'kkks_info'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    kkks_id = ppdm_table_pk_to_fk("business_associate")

class KKKSUser(User):
    __tablename__ = 'user_kkks'
    
    id = Column(GUID(), ForeignKey('users.id'), primary_key=True)
    kkks_id = ppdm_table_pk_to_fk("business_associate")
    kkks = relationship("KKKS", back_populates="users")
    
    __mapper_args__ = {
        "polymorphic_identity": Role.KKKS
    }
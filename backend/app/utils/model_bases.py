from sqlalchemy.orm import relationship, declared_attr
from sqlalchemy import Column, String, ForeignKey, DateTime, func, select
from sqlalchemy.ext.hybrid import hybrid_property
from app.api.auth.models import KKKS
from app.api.spatial.models import Area, Field
from .models_utils import GUID

class CreateBase:
    
    time_created = Column(DateTime, default=func.now())
    
    @declared_attr
    def created_by_id(cls):
        return Column(GUID(), ForeignKey('users.id'))

    @declared_attr
    def created_by(cls):
        return relationship("User", foreign_keys=[cls.created_by_id])

class EditBase:
    
    last_edited = Column(DateTime, onupdate=func.now())
    
    @declared_attr
    def last_edited_by_id(cls):
        return Column(GUID(), ForeignKey('users.id'))
    
    @declared_attr
    def last_edited_by(cls):
        return relationship("User", foreign_keys=[cls.last_edited_by_id])

class KKKSInfoBase:

    @hybrid_property
    def kkks_name(self):
        return self.kkks.name if self.kkks else None
    
    @kkks_name.expression
    def kkks_name(cls):
        return select(KKKS.name).where(cls.kkks_id == KKKS.id).as_scalar()
    
class AreaInfoBase:
    
    @hybrid_property
    def area_name(self):
        return self.area.name if self.area else None
    
    @area_name.expression
    def area_name(cls):
        return select(Area.name).where(cls.area_id == Area.id).as_scalar()

    @hybrid_property
    def region(self):
        return self.area.region if self.area else None
    
    @region.expression
    def region(cls):
        return select(Area.region).where(cls.area_id == Area.id).as_scalar()

class FieldInfoBase:
    
    @hybrid_property
    def field_name(self):
        return self.field.name if self.field else None
    
    @field_name.expression
    def field_name(cls):
        return select(Field.name).where(cls.field_id == Field.id).as_scalar()
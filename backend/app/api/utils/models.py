import re
from sqlalchemy.orm import relationship
from sqlalchemy import Boolean, Column, String, ForeignKey
from app.core.ppdm_database import PPDMBase, ppdm_table,ppdm_table_pk_to_fk, table_fk_from_model
from app.core.public_database import Base
import uuid
from app.utils.models_utils import GUID
import pandas as pd

class FileRecord(Base):

    __tablename__ = 'files'

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    filename = Column(String(255))
    file_location = Column(String(255))
    file_extension = Column(String(5))

    uploaded_by_id = Column(GUID(), ForeignKey('users.id'))
    uploaded_by = relationship('User', foreign_keys=[uploaded_by_id])
    
    assigned = Column(Boolean, default=False)
    
    physical_item_id = ppdm_table_pk_to_fk("rm_physical_item")

class PhysicalItem(PPDMBase):
    
    __table__ = ppdm_table("rm_physical_item")
    
    id = __table__.c.physical_item_id
    
    digital_format = __table__.c.digital_format
    
    file_record = relationship('FileRecord', uselist=False)
    
    def __init__(self, id, filename, file_location, file_extension, uploaded_by_id, *args, **kwargs):

        self.file_record = FileRecord(
            id = id,
            filename = filename,
            uploaded_by_id = uploaded_by_id,
            file_location = file_location,
            file_extension = file_extension
        )
        
        self.digital_format = file_extension.replace(".", "")
        
        self.id = id
        
        super().__init__(*args, **kwargs)
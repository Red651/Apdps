from uuid import UUID
from sqlalchemy.orm import class_mapper, Session
import asyncio
from app.api.utils.models import FileRecord, PhysicalItem
import os
from app.core.database import sessionmanager
from app.core.schema_operations import is_pydantic, model_from_dict

def recursive_find_file_id(obj):
    
    file_ids = []

    if hasattr(obj, 'file_id'):
        file_ids.append(obj.file_id)
    
    obj = dict(obj)
    
    for key, value in obj.items():

        if isinstance(value, list) and len(value) and is_pydantic(value[0]):
            for item in value:
                file_ids.extend(recursive_find_file_id(item))
                if hasattr(item, 'file_id'):
                    file_ids.append(item.file_id)
        elif is_pydantic(value):
            file_ids.extend(recursive_find_file_id(value))

    return file_ids

def change_files_status_to_used(obj, db: Session):
    
    file_ids = recursive_find_file_id(obj)
    
    results = db.query(FileRecord).filter(FileRecord.id.in_(file_ids)).all()
    
    for file in results:
        
        file.assigned = True
        
def delete_files(obj, db: Session):
    
    file_ids = recursive_find_file_id(obj)
    
    results = db.query(FileRecord).filter(FileRecord.id.in_(file_ids)).all()
    
    for file in results:
        
        os.remove(file.file_location)

async def remove_unassigned_file(file_id: UUID):
    await asyncio.sleep(1800)
    with sessionmanager.sync_session() as db:
        file_record = db.query(FileRecord).filter(FileRecord.id == file_id).first()
        if file_record and file_record.assigned is None:
            os.remove(file_record.file_location)
            db.delete(file_record)
            db.commit()

async def remove_unassigned_physical_item(physical_item_id: str):
    await asyncio.sleep(1800)
    with sessionmanager.sync_session() as db:
        physical_item = db.query(PhysicalItem).filter(PhysicalItem.id == physical_item_id).first()
        if physical_item and physical_item.assigned is None:
            os.remove(physical_item.file_location)
            db.delete(physical_item)
            db.commit()
        
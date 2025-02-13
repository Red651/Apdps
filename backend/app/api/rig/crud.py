from sqlalchemy.orm import Session

from fastapi.exceptions import HTTPException
from sqlalchemy import func, case

from app.api.rig.models import *
from app.api.rig.schemas import *

from app.core.schema_operations import parse_schema

def create_rig(db: Session, rig: CreateRig, user):
    db_rig = Rig(**parse_schema(rig))
    db.add(db_rig)
    db.commit()

def get_rig_by_id(db: Session, id: UUID):
    rig = db.query(Rig).filter(Rig.id == id).first()
    return {
        "rig_name": rig.rig_name,
        "rig_type": rig.rig_type,
        "rig_horse_power": rig.rig_horse_power
    }

def get_rigs_by_name(db: Session, name: str):
    return db.query(Rig).filter(Rig.rig_name == name).first()

def get_all_rigs(db: Session) -> List[Rig]:
    return db.query(Rig).all()

def get_rigs_list(db: Session):
    rigs = db.query(
        Rig.id.label('value'),
        Rig.rig_name.label('name'),
    )
    return rigs

def delete_rig(db:Session, id: UUID):
    if db.query(Rig).filter(Rig.id==id).first() is None:
        raise HTTPException(status_code=404, detail="Rig not found")
    get_rig=db.query(Rig).filter(Rig.id==id).first()
    for job in get_rig.jobs:
        job.rig_id = None
    db.delete(get_rig) 
    db.commit()

def edit_rig(db:Session, id: UUID, rig: UpdateRig, user):
    old_rig = db.query(Rig).filter(Rig.id==id).first()
    if old_rig is None:
        raise HTTPException(status_code=404, detail="Rig not found")
    new_rig = Rig(**parse_schema(rig))
    new_rig.id = old_rig.id
    db.delete(old_rig)
    db.add(new_rig)
    db.commit()

def get_rig_summary(db: Session):
    
    query = db.query(
        func.count(Rig.id).label('total')
    )
    result = query.first()
    return {
        'total_recorded_rigs':result.total
    }

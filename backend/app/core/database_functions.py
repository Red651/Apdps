
from app.core.public_database import Base
from sqlalchemy import text
from app.core.config import settings
from sqlalchemy.orm import Session
from app.core.database import sessionmanager
from sqlalchemy.orm.attributes import flag_modified

def init_ppdm_db(db: Session):
    
    drop_ppdm_schema_query = text("DROP SCHEMA IF EXISTS ppdm CASCADE;")
    create_ppdm_schema_query = text("CREATE SCHEMA ppdm;")
    db.execute(drop_ppdm_schema_query)
    db.execute(create_ppdm_schema_query)
    with open("app/scripts/ddl.sql", 'r') as file:
        sql_script = file.read()
    db.execute(text(sql_script))
    db.commit()

def drop_existing_data(db: Session):
    if settings.ENVIRONMENT == "local":
        Base.metadata.drop_all(bind=sessionmanager._sync_engine)
    elif settings.ENVIRONMENT == "production":
        
        drop_schema_query = text("DROP SCHEMA IF EXISTS public CASCADE;")
        create_schema_query = text("CREATE SCHEMA public;")
        
        db.execute(drop_schema_query)
        db.execute(create_schema_query)
        
        db.commit()

def reset_ppdm_db():
    with sessionmanager.sync_session() as session:
        init_ppdm_db(session)

def create_support_data():
    from app.core.ppdm_database import ppdm_table
    from app.core.constants import uoms
    with sessionmanager.sync_session() as session:
        uom_table = ppdm_table("ppdm_unit_of_measure")
        session.execute(uom_table.insert().values([
            {'uom_id':uom} for uom in uoms
        ]))
        
        session.commit()

def reset_public_db():
    with sessionmanager.sync_session() as session:
        from app.core import main
        drop_existing_data(session)
        Base.metadata.create_all(bind=sessionmanager._sync_engine)

def update_object(target, source, exclude_fields=None):
    """
    Update the attributes of the target SQLAlchemy object with values from the source object.
    
    Args:
        target: The SQLAlchemy object to update.
        source: The SQLAlchemy object providing the new values.
        exclude_fields: A list of field names to exclude from the update.
    """
    exclude_fields = exclude_fields or []
    
    for attr in source.__dict__:
        if attr.startswith('_') or attr in exclude_fields:
            continue
        
        value = getattr(source, attr)
        setattr(target, attr, value)

    # Ensure SQLAlchemy detects the change
    flag_modified(target, attr)


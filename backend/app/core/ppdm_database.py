from app.core.database import sessionmanager, common_base
from sqlalchemy import MetaData, Column, ForeignKey
from typing import Any
from sqlalchemy.orm import DeclarativeBase

ppdm_metadata = MetaData(schema='ppdm')
ppdm_metadata.reflect(bind=sessionmanager._sync_engine)
ppdm_tables = ppdm_metadata.tables

def ppdm_table(name: str) -> Any:
    return ppdm_tables[f"ppdm.{name}"]

def ppdm_table_pk_to_fk(name: str) -> Any:
    primary_key = ppdm_table(name).primary_key.c[0]
    return Column(primary_key.type, ForeignKey(primary_key))

def table_fk_from_model(model: DeclarativeBase) -> Any:
    return Column(model.id.type, ForeignKey(model.id))

class PPDMBase(common_base):
    __abstract__ = True
    pass
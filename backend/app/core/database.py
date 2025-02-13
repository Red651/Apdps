from sqlalchemy.orm import Session
from sqlalchemy import Column, ForeignKey, create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings
import contextlib
from typing import Any, AsyncIterator, Iterator

from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from sqlalchemy import Connection
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import make_transient


# Custom Session class with additional functionality
class CustomSession(Session):
    def recursive_add(self, instance):
        """
        Add a parent model instance, flush it without relationships, 
        then assign and persist its relationships recursively.

        Args:
            instance: SQLAlchemy model instance to add.

        Returns:
            The added instance with all relationships handled.
        """
        try:

            # Detach relationships temporarily
            relationships = {}
            for rel in instance.__mapper__.relationships:
                relationships[rel.key] = getattr(instance, rel.key)
                if getattr(instance, rel.key) is not None:
                    if isinstance(relationships[rel.key], list):
                        setattr(instance, rel.key, [])  # Temporarily remove relationships
                    else:
                        setattr(instance, rel.key, None)  # Temporarily remove relationships

            # Add and flush the parent instance

            self.add(instance)
            self.flush()
            self.merge(instance)

            # Function to handle nested relationships recursively
            def add_relationships(obj):
                for key, related_objects in relationships.items():
                    if related_objects is not None:
                        if isinstance(related_objects, list):  # Handle one-to-many or many-to-many
                            for related_obj in related_objects:
                                if getattr(related_obj, "__allow_recursive__", True):
                                    self.recursive_add(related_obj)
                                    self.merge(related_obj)
                        else:  # Handle one-to-one or many-to-one
                            if getattr(related_objects, "__allow_recursive__", True):
                                self.recursive_add(related_objects)
                                self.merge(related_objects)
                        setattr(obj, key, related_objects)  # Reassign relationship
                    self.flush()  # Flush after assigning relationships
            
            add_relationships(instance)  # Call recursive function

            return instance

        except SQLAlchemyError as e:
            self.rollback()
            raise RuntimeError(f"Failed to add instance and assign relationships: {e}")
        
            

class DatabaseSessionManager:
    def __init__(self, sync_host: str, async_host: str, engine_kwargs: dict[str, Any] = {}):
        self._sync_engine = create_engine(sync_host, **engine_kwargs)
        self._sync_sessionmaker = sessionmaker(autocommit=False, bind=self._sync_engine, autoflush=True, class_=CustomSession)
        self._async_engine = create_async_engine(async_host, **engine_kwargs)
        self._async_sessionmaker = async_sessionmaker(autocommit=False, bind=self._async_engine, autoflush=True, class_=CustomSession)

    def sync_close(self):
        if self._sync_engine is None:
            raise Exception("DatabaseSessionManager is not initialized")
        self._sync_engine.dispose()
        self._sync_engine = None
        self._sync_sessionmaker = None
    
    async def async_close(self):
        if self._async_engine is None:
            raise Exception("DatabaseSessionManager is not initialized")
        await self._async_engine.dispose()
        self._async_engine = None
        self._async_sessionmaker = None

    @contextlib.asynccontextmanager
    async def async_connect(self) -> AsyncIterator[AsyncConnection]:
        if self._async_engine is None:
            raise Exception("DatabaseSessionManager is not initialized")

        async with self._engine.begin() as connection:
            try:
                yield connection
            except Exception:
                await connection.rollback()
                raise
    
    @contextlib.contextmanager
    def sync_connect(self) -> Iterator[Connection]:
        if self._sync_engine is None:            
            raise Exception("DatabaseSessionManager is not initialized")
        
        with self._sync_engine.begin() as connection:
            try:
                yield connection
            except Exception:
                connection.rollback()
                raise

    @contextlib.asynccontextmanager
    async def async_session(self) -> AsyncIterator[AsyncSession]:
        if self._async_sessionmaker is None:
            raise Exception("DatabaseSessionManager is not initialized")

        session = self._async_sessionmaker()
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
    
    @contextlib.contextmanager
    def sync_session(self) -> Iterator[Session]:
        if self._sync_engine is None:            
            raise Exception("DatabaseSessionManager is not initialized")
        
        session = self._sync_sessionmaker()
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

sessionmanager = DatabaseSessionManager(
    str(settings.SQLALCHEMY_PRODUCTION_SYNC_DATABASE_URI),
    str(settings.SQLALCHEMY_PRODUCTION_ASYNC_DATABASE_URI),
    {"echo": settings.SQL_ECHO}
)

async def get_async_db_session():
    async with sessionmanager.async_session() as session:
        yield session
        
def get_sync_db_session():
    with sessionmanager.sync_session() as session:
        yield session

common_base = declarative_base()
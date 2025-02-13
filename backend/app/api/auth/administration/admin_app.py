from sqlalchemy import select, update
from app.api.auth.administration.fastadmin import SqlAlchemyModelAdmin, WidgetType
from app.api.auth.administration.fastadmin import fastapi_app as admin_app
from app.api.auth.administration.fastadmin import register

from app.api.auth.models import User, Admin, KKKSUser, KKKS
from app.core.security import verify_password, pwd_context
from app.api.spatial.models import Area, Field
from app.core.database import sessionmanager

sqlalchemy_engine = sessionmanager._async_engine
sqlalchemy_sessionmaker = sessionmanager._async_sessionmaker

@register(Admin, sqlalchemy_sessionmaker=sqlalchemy_sessionmaker)
class UserModelAdmin(SqlAlchemyModelAdmin):
    exclude = ("role")
    list_display = ("id", "username", "is_superuser")
    list_display_links = ("id", "username")
    list_filter = ("id", "username", "is_superuser")
    search_fields = ("username",)
    formfield_overrides = {
        "username": (WidgetType.SlugInput, {"required": True}),
        "hashed_password": (WidgetType.PasswordInput, {}),
    }

    async def authenticate(self, username, hashed_password):
        sessionmaker = self.get_sessionmaker()
        async with sessionmaker() as session:
            query = select(self.model_cls).filter_by(username=username, is_superuser=True)
            result = await session.scalars(query)
            obj = result.first()
            if not obj or not verify_password(hashed_password, obj.hashed_password):
                return None
            
            return obj.id

    async def change_password(self, user_id, password):
        sessionmaker = self.get_sessionmaker()
        async with sessionmaker() as session:
            hashed_password = pwd_context.hash(password)
            query = update(User).where(self.model_cls.id.in_([user_id])).values(hashed_password=hashed_password)
            await session.execute(query)
            await session.commit()

    async def orm_save_obj(self, id, payload: dict):
        """This method is used to save orm/db model object.

        :params id: an id of object.
        :params payload: a dict of payload.
        :return: An object.
        """
        sessionmaker = self.get_sessionmaker()
        payload['hashed_password'] = pwd_context.hash(payload['hashed_password'])
        async with sessionmaker() as session:
            if id:
                obj = await session.get(self.model_cls, id)
                if not obj:
                    return None
                for k, v in payload.items():
                    setattr(obj, k, v)
                await session.merge(obj)
                await session.commit()
            else:
                obj = self.model_cls(**payload)
                session.add(obj)
                await session.commit()
            return await session.get(self.model_cls, getattr(obj, self.get_model_pk_name(self.model_cls)))


@register(KKKS, sqlalchemy_sessionmaker=sqlalchemy_sessionmaker)
class KKKSModelAdmin(SqlAlchemyModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("id", "name")
    list_filter = ("id", "name")
    search_fields = ("name",)

@register(Area, sqlalchemy_sessionmaker=sqlalchemy_sessionmaker)
class AreaModelAdmin(SqlAlchemyModelAdmin):
    list_display = ("id", "name", "phase", "type", "position", "production_status", "region")
    list_display_links = ("id", "name")
    list_filter = ("id", "name", "phase", "type", "position", "production_status", "region")
    search_fields = ("name", "phase", "type", "position", "production_status", "region")

@register(Field, sqlalchemy_sessionmaker=sqlalchemy_sessionmaker)
class FieldModelAdmin(SqlAlchemyModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("id", "name")
    list_filter = ("id", "name")
    search_fields = ("name",)

@register(KKKSUser, sqlalchemy_sessionmaker=sqlalchemy_sessionmaker)
class KKKSUserModelAdmin(SqlAlchemyModelAdmin):
    exclude = ("role", 'is_superuser')
    list_display = ("id", "username")
    list_display_links = ("id", "username")
    list_filter = ("id", "username")
    search_fields = ("username",)
    formfield_overrides = {
        "username": (WidgetType.SlugInput, {"required": True}),
        "hashed_password": (WidgetType.PasswordInput, {})
    }
    
    async def orm_save_obj(self, id, payload: dict):
        """This method is used to save orm/db model object.

        :params id: an id of object.
        :params payload: a dict of payload.
        :return: An object.
        """
        sessionmaker = self.get_sessionmaker()
        payload['hashed_password'] = pwd_context.hash(payload['hashed_password'])
        async with sessionmaker() as session:
            if id:
                obj = await session.get(self.model_cls, id)
                if not obj:
                    return None
                for k, v in payload.items():
                    setattr(obj, k, v)
                await session.merge(obj)
                await session.commit()
            else:
                obj = self.model_cls(**payload)
                session.add(obj)
                await session.commit()
            return await session.get(self.model_cls, getattr(obj, self.get_model_pk_name(self.model_cls)))

    async def change_password(self, user_id, password):
        sessionmaker = self.get_sessionmaker()
        async with sessionmaker() as session:
            hashed_password = pwd_context.hash(password)
            query = update(self.model_cls).where(User.id.in_([user_id])).values(hashed_password=hashed_password)
            await session.execute(query)
            await session.commit()
            
            
# async def init_db():
#     async with sqlalchemy_engine.begin() as c:
#         await c.run_sync(Base.metadata.drop_all)
#         await c.run_sync(Base.metadata.create_all)

ADMIN_APP = admin_app
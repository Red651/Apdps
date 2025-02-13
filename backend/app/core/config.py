import secrets
from typing import Annotated, Any, Literal
import os
from pydantic import (
    AnyUrl,
    BeforeValidator,
    PostgresDsn,
    computed_field,
    field_validator,
    ValidationInfo
)
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import Optional

def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )
    
    DOMAIN: str = "localhost"
    PORT: int = 8000
    
    ROOT_PATH: str = "/backend"
    EXTERNAL_PAGES_PATH: str = "/external"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    
    LIMITER_TIMES: int = 10
    LIMITER_SECONDS: int = 60
    
    DUMMY_DATA_CREATION: bool = True
    RANDOMIZE_DATA_CREATION: bool = True
    SQL_ECHO: bool = False
    REDIS_URL: str = "redis://localhost:6379"
    UPLOAD_DIR: str = str(Path(__file__).parent.parent.parent.joinpath("uploads"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    ENVIRONMENT: Literal["local", "production"] = "local"

    @computed_field
    @property
    def server_host(self) -> str:
        return f"https://{self.DOMAIN}"
    
    @computed_field
    @property
    def upload_dir(self) -> str:

        return os.path.join(
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')), 
            self.UPLOAD_DIR
            )

    APP_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    PROJECT_NAME: str = 'ApDPS'
    
    SUPERUSER_USERNAME: str = 'admin'
    SUPERUSER_PASSWORD: str = 'admin'
        
    LOCAL_DB_SCHEME: Literal['sqlite'] = 'sqlite'
    LOCAL_DB_DRIVER: str = 'aiosqlite'
    LOCAL_DB_SERVER: str = "/demo.db"
    LOCAL_DB_PORT: Optional[int] = None
    LOCAL_DB_USER: Optional[str] = None
    LOCAL_DB_PASSWORD: Optional[str] = None
    LOCAL_DB_DB: Optional[str] = None

    PRODUCTION_DB_SCHEME: Literal['postgresql'] = 'postgresql'
    PRODUCTION_DB_DRIVER: str = 'asyncpg'
    PRODUCTION_DB_SERVER: str = 'localhost'
    PRODUCTION_DB_PORT: int = 5432
    PRODUCTION_DB_USER: str = ""
    PRODUCTION_DB_PASSWORD: str = ""
    PRODUCTION_DB_DB: str = ""

    @computed_field
    @property
    def SQLALCHEMY_PRODUCTION_ASYNC_DATABASE_URI(self) -> PostgresDsn:
        return MultiHostUrl.build(
            scheme=f"{self.PRODUCTION_DB_SCHEME}+{self.PRODUCTION_DB_DRIVER}",
            username=self.PRODUCTION_DB_USER,
            password=self.PRODUCTION_DB_PASSWORD,
            host=self.PRODUCTION_DB_SERVER,
            port=self.PRODUCTION_DB_PORT,
            path=self.PRODUCTION_DB_DB,
        )

    @computed_field
    @property
    def SQLALCHEMY_PRODUCTION_SYNC_DATABASE_URI(self) -> PostgresDsn:
        return MultiHostUrl.build(
            scheme=self.PRODUCTION_DB_SCHEME,
            username=self.PRODUCTION_DB_USER,
            password=self.PRODUCTION_DB_PASSWORD,
            host=self.PRODUCTION_DB_SERVER,
            port=self.PRODUCTION_DB_PORT,
            path=self.PRODUCTION_DB_DB,
        )

    @computed_field
    @property
    def SQLALCHEMY_LOCAL_ASYNC_DATABASE_URI(self) -> str:
        return MultiHostUrl.build(
            scheme=f"{self.LOCAL_DB_SCHEME}+{self.LOCAL_DB_DRIVER}",
            username=self.LOCAL_DB_USER,
            password=self.LOCAL_DB_PASSWORD,
            host=self.LOCAL_DB_SERVER,
            port=self.LOCAL_DB_PORT,
            path=self.LOCAL_DB_DB,
        )
        
    @computed_field
    @property
    def SQLALCHEMY_LOCAL_SYNC_DATABASE_URI(self) -> str:
        return MultiHostUrl.build(
            scheme=self.LOCAL_DB_SCHEME,
            username=self.LOCAL_DB_USER,
            password=self.LOCAL_DB_PASSWORD,
            host=self.LOCAL_DB_SERVER,
            port=self.LOCAL_DB_PORT,
            path=self.LOCAL_DB_DB,
        )

    @computed_field
    @property
    def SQLALCHEMY_ASYNC_DATABASE_URI(self) -> str:
        if self.ENVIRONMENT == "local":
            return str(self.SQLALCHEMY_LOCAL_ASYNC_DATABASE_URI)
        elif self.ENVIRONMENT == "production":
            return str(self.SQLALCHEMY_PRODUCTION_ASYNC_DATABASE_URI)

    @computed_field
    @property
    def SQLALCHEMY_SYNC_DATABASE_URI(self) -> str:
        if self.ENVIRONMENT == "local":
            return str(self.SQLALCHEMY_LOCAL_SYNC_DATABASE_URI)
        elif self.ENVIRONMENT == "production":
            return str(self.SQLALCHEMY_PRODUCTION_SYNC_DATABASE_URI)

    #AdminApp
    ADMIN_PREFIX: str = f"{ROOT_PATH}/admin"
    ADMIN_USER_MODEL: str = "Admin"
    ADMIN_USER_MODEL_USERNAME_FIELD: str = "username"
    ADMIN_SECRET_KEY: str = SECRET_KEY
    ADMIN_SITE_NAME: str ="ApDPS Admin"
    ADMIN_SITE_SIGN_IN_LOGO: str = f"{ROOT_PATH}/static/images/sign-in-logo.svg"
    ADMIN_SITE_HEADER_LOGO: str= f"{ROOT_PATH}/static/images/header-logo.svg"
    ADMIN_SITE_FAVICON: str= f"{ROOT_PATH}/static/images/favicon.png"
    ADMIN_PRIMARY_COLOR: str = "#33b9de"

    ADMIN_SESSION_ID_KEY: str = "admin_session_id"
    ADMIN_SESSION_EXPIRED_AT: int = 144000 # in sec
    ADMIN_DATE_FORMAT: str = "YYYY-MM-DD"
    ADMIN_DATETIME_FORMAT: str = "YYYY-MM-DD HH:mm"
    ADMIN_TIME_FORMAT: str = "HH:mm:ss"

    @field_validator("*", mode="before")
    @classmethod
    def check_alphanumeric(cls, v: str, info: ValidationInfo) -> str:
        if isinstance(v, str):
            if v == "none":
                return None
            if v == "null":
                return None
            if v == "true":
                return True
            if v == "false":
                return False
        return v

settings = Settings()
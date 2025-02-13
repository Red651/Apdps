from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.api.auth import models
from jose import JWTError, jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from app.api.auth import crud, models
from functools import wraps
from app.core.config import settings
from app.core.database import get_sync_db_session

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.ROOT_PATH}/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_current_token_availability(token: str = Depends(oauth2_scheme), db: Session = Depends(get_sync_db_session)) -> models.User:

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return False

    except JWTError:
       return False
   
    return True
    
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_sync_db_session)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception
    
    user = crud.get_user(db,user_id=user_id)
    if user is None:
        raise credentials_exception
    
    return user

def authenticate_user(username: str, password: str, db: Session = Depends(get_sync_db_session)):
    user = crud.get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def authorize(role: list):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get("user")
            if user is not None:
                user_role = user.role
                if user_role not in role:
                    raise HTTPException(status_code=403, detail="User is not authorized to access this resource")
            else:
                raise HTTPException(status_code=401, detail="Unauthorized")
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def refresh_token(current_token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(current_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        new_payload = payload.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_payload["exp"] = expire
        new_token = jwt.encode(new_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return {"access_token": new_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token for refresh",
            headers={"WWW-Authenticate": "Bearer"},
        )
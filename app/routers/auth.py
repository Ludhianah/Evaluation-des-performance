from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from tortoise.exceptions import DoesNotExist
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
import os

from ..models import User, User_Pydantic
from ..schemas import UserCreate

# =========================
# CONFIGURATION
# =========================

SECRET_KEY = "super_secret_key_change_me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter(prefix="/auth", tags=["Authentification"])

# =========================
# FONCTIONS UTILITAIRES
# =========================

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str):
    # bcrypt has a 72-byte limit, truncate if necessary
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_user(username: str):
    return await User.get_or_none(username=username)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = await get_user(username)
    if user is None:
        raise credentials_exception

    return user

# =========================
# REGISTER
# =========================

@router.post("/register", response_model=User_Pydantic)
async def register(user: UserCreate):

    existing_user = await User.get_or_none(username=user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username déjà utilisé")

    # # Vérifier que le service existe
    # from ..models import Service
    # service = await Service.get_or_none(id=user.service_id)
    # if not service:
    #     raise HTTPException(status_code=400, detail="Service non trouvé")

    hashed = hash_password(user.password)

    new_user = await User.create(
        username=user.username,
        password=hashed,
    )

    return await User_Pydantic.from_tortoise_orm(new_user)


# =========================
# LOGIN
# =========================

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):

    user = await get_user(form_data.username)

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Nom d'utilisateur ou mot de passe incorrect"
        )

    access_token = create_access_token(
        data={
            "sub": user.username
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# =========================
# GET USER CONNECTÉ
# =========================

@router.get("/me", response_model=User_Pydantic)
async def read_me(current_user: User = Depends(get_current_user)):
    return await User_Pydantic.from_tortoise_orm(current_user)

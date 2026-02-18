from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel
from tortoise.exceptions import IntegrityError
from datetime import datetime, timedelta
from typing import Optional
from jwt import PyJWTError
import jwt
import os

from ..models import User, User_Pydantic
from ..schemas import UserCreate

# Pydantic model for JSON login
class LoginRequest(BaseModel):
    username: str
    password: str

# =========================
# CONFIGURATION
# =========================
SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter(prefix="/auth", tags=["Authentification"])

# =========================
# UTILITAIRES
# =========================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
        # Convert string to int for database query
        try:
            user_id_int = int(user_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
        
        user = await User.get_or_none(id=user_id_int)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur non trouvé")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expiré")
    except PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")


# =========================
# INSCRIPTION
# =========================
@router.post("/register", response_model=User_Pydantic, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Crée un utilisateur (ADMIN ou RESPONSABLE).
    Pour ADMIN, service_id peut être null.
    Pour RESPONSABLE, service_id doit être renseigné.
    """
    if user_data.role == "RESPONSABLE" and user_data.service_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un responsable doit appartenir à un service"
        )

    hashed_password = pwd_context.hash(user_data.password)

    try:
        user = await User.create(
            username=user_data.username,
            password=hashed_password,
            role=user_data.role,
            service_id=user_data.service_id
        )
        return await User_Pydantic.from_tortoise_orm(user)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce nom d'utilisateur existe déjà"
        )


# =========================
# CONNEXION (TOKEN JWT)
# =========================
@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.get_or_none(username=form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# Alternative endpoint for JSON login
@router.post("/login")
async def login_json(login_data: LoginRequest):
    user = await User.get_or_none(username=login_data.username)
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


# =========================
# UTILISATEUR COURANT
# =========================
@router.get("/me", response_model=User_Pydantic)
async def get_me(current_user: User = Depends(get_current_user)):
    return await User_Pydantic.from_tortoise_orm(current_user)

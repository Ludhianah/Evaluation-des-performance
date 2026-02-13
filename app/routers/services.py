from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from tortoise.exceptions import IntegrityError
from typing import List
import jwt
from passlib.context import CryptContext

from ..models import Service, Service_Pydantic, ServiceIn_Pydantic, User
from ..schemas import ServiceCreate

# Configuration pour JWT (copier depuis auth.py)
SECRET_KEY = "super_secret_key_change_me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user(username: str):
    return await User.get_or_none(username=username)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou manquant",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credentials_exception

    user = await get_user(username)
    if user is None:
        raise credentials_exception

    return user

router = APIRouter(prefix="/services", tags=["Services"])


# ================================
# 🔐 Créer un service (protégé)
# ================================
@router.post("/", response_model=Service_Pydantic)
async def creer_service(
    service_data: ServiceCreate,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    try:
        service = await Service.create(**service_data.dict())
        return await Service_Pydantic.from_tortoise_orm(service)
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Un service avec ce nom existe déjà"
        )


# ================================
# 📋 Lister tous les services
# ================================
@router.get("/", response_model=List[Service_Pydantic])
async def lister_services():
    return await Service_Pydantic.from_queryset(Service.all())


# ================================
# 🔍 Obtenir un service par ID
# ================================
@router.get("/{service_id}", response_model=Service_Pydantic)
async def obtenir_service(service_id: int):
    service = await Service.get_or_none(id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    return await Service_Pydantic.from_tortoise_orm(service)


# ================================
# ✏️ Mettre à jour un service (protégé)
# ================================
@router.put("/{service_id}", response_model=Service_Pydantic)
async def mettre_a_jour_service(
    service_id: int,
    service_data: ServiceIn_Pydantic,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    service = await Service.get_or_none(id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")

    await service.update_from_dict(service_data.dict(exclude_unset=True))
    await service.save()
    return await Service_Pydantic.from_tortoise_orm(service)


# ================================
# 🗑 Supprimer un service (protégé)
# ================================
@router.delete("/{service_id}")
async def supprimer_service(
    service_id: int,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    service = await Service.get_or_none(id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")

    await service.delete()
    return {"message": "Service supprimé avec succès"}

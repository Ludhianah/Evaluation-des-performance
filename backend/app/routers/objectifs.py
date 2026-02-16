from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from tortoise.exceptions import IntegrityError
from typing import List
import jwt
from passlib.context import CryptContext

from ..models import Objectif, Objectif_Pydantic, ObjectifIn_Pydantic, Service, User
from ..schemas import ObjectifCreate

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

router = APIRouter(prefix="/objectifs", tags=["Objectifs"])


# ================================
# 🔐 Créer un objectif (protégé)
# ================================
@router.post("/", response_model=Objectif_Pydantic)
async def creer_objectif(
    objectif_data: ObjectifCreate,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    # Vérifier si le service existe
    service = await Service.get_or_none(id=objectif_data.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")

    try:
        objectif = await Objectif.create(**objectif_data.dict())
        return await Objectif_Pydantic.from_tortoise_orm(objectif)
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Un objectif avec ce libellé existe déjà pour ce service et cette période"
        )


# ================================
# 📋 Lister tous les objectifs
# ================================
@router.get("/", response_model=List[Objectif_Pydantic])
async def lister_objectifs():
    return await Objectif_Pydantic.from_queryset(Objectif.all())


# ================================
# 🔍 Obtenir un objectif par ID
# ================================
@router.get("/{objectif_id}", response_model=Objectif_Pydantic)
async def obtenir_objectif(objectif_id: int):
    objectif = await Objectif.get_or_none(id=objectif_id)
    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")
    return await Objectif_Pydantic.from_tortoise_orm(objectif)


# ================================
# ✏️ Mettre à jour un objectif (protégé)
# ================================
@router.put("/{objectif_id}", response_model=Objectif_Pydantic)
async def mettre_a_jour_objectif(
    objectif_id: int,
    objectif_data: ObjectifIn_Pydantic,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    objectif = await Objectif.get_or_none(id=objectif_id)
    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    # Vérifier si le service existe (si le service_id est modifié)
    if hasattr(objectif_data, 'service_id') and objectif_data.service_id:
        service = await Service.get_or_none(id=objectif_data.service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")

    await objectif.update_from_dict(objectif_data.dict(exclude_unset=True))
    await objectif.save()
    return await Objectif_Pydantic.from_tortoise_orm(objectif)


# ================================
# 🗑 Supprimer un objectif (protégé)
# ================================
@router.delete("/{objectif_id}")
async def supprimer_objectif(
    objectif_id: int,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    objectif = await Objectif.get_or_none(id=objectif_id)
    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    await objectif.delete()
    return {"message": "Objectif supprimé avec succès"}
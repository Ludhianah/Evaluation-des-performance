from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from tortoise.exceptions import IntegrityError
from typing import List
import jwt
from passlib.context import CryptContext

from ..models import Indicateur, Indicateur_Pydantic, IndicateurIn_Pydantic, Objectif, User
from ..schemas import IndicateurCreate

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

router = APIRouter(prefix="/indicateurs", tags=["Indicateurs"])


# ================================
# 🔐 Créer un indicateur (protégé)
# ================================
@router.post("/", response_model=Indicateur_Pydantic)
async def creer_indicateur(
    indicateur_data: IndicateurCreate,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    # Vérifier si l'objectif existe
    objectif = await Objectif.get_or_none(id=indicateur_data.objectif_id)
    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    # Pour les indicateurs qualitatifs, la valeur_cible doit être NULL
    if indicateur_data.type == "QUALITATIF":
        indicateur_data.valeur_cible = None

    try:
        indicateur = await Indicateur.create(**indicateur_data.dict())
        return await Indicateur_Pydantic.from_tortoise_orm(indicateur)
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Un indicateur avec ce libellé existe déjà pour cet objectif"
        )


# ================================
# 📋 Lister tous les indicateurs
# ================================
@router.get("/", response_model=List[Indicateur_Pydantic])
async def lister_indicateurs():
    return await Indicateur_Pydantic.from_queryset(Indicateur.all())


# ================================
# 🔍 Obtenir un indicateur par ID
# ================================
@router.get("/{indicateur_id}", response_model=Indicateur_Pydantic)
async def obtenir_indicateur(indicateur_id: int):
    indicateur = await Indicateur.get_or_none(id=indicateur_id)
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")
    return await Indicateur_Pydantic.from_tortoise_orm(indicateur)


# ================================
# ✏️ Mettre à jour un indicateur (protégé)
# ================================
@router.put("/{indicateur_id}", response_model=Indicateur_Pydantic)
async def mettre_a_jour_indicateur(
    indicateur_id: int,
    indicateur_data: IndicateurIn_Pydantic,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    indicateur = await Indicateur.get_or_none(id=indicateur_id)
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    # Pour les indicateurs qualitatifs, la valeur_cible doit être NULL
    if hasattr(indicateur_data, 'type') and indicateur_data.type == "QUALITATIF":
        indicateur_data.valeur_cible = None

    await indicateur.update_from_dict(indicateur_data.dict(exclude_unset=True))
    await indicateur.save()
    return await Indicateur_Pydantic.from_tortoise_orm(indicateur)


# ================================
# 🗑 Supprimer un indicateur (protégé)
# ================================
@router.delete("/{indicateur_id}")
async def supprimer_indicateur(
    indicateur_id: int,
    current_user: User = Depends(get_current_user)  # ✅ protection JWT
):
    indicateur = await Indicateur.get_or_none(id=indicateur_id)
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    await indicateur.delete()
    return {"message": "Indicateur supprimé avec succès"}
from fastapi import APIRouter, HTTPException, Depends
from tortoise.exceptions import IntegrityError
from typing import List

from ..models import (
    Indicateur,
    Indicateur_Pydantic,
    IndicateurIn_Pydantic,
    Objectif,
    User,
    RoleEnum,
    TypeIndicateurEnum
)
from ..schemas import IndicateurCreate
from ..routers.auth import get_current_user

router = APIRouter(prefix="/indicateurs", tags=["Indicateurs"])

# ================================
# 🔐 Créer un indicateur (protégé)
# ================================
@router.post("/", response_model=Indicateur_Pydantic)
async def creer_indicateur(
    indicateur_data: IndicateurCreate,
    current_user: User = Depends(get_current_user)
):
    # Charger l'objectif avec son service
    objectif = await Objectif.get_or_none(id=indicateur_data.objectif_id).select_related("service")
    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    # Vérifier le rôle RESPONSABLE
    if current_user.role == RoleEnum.RESPONSABLE.value:
        user_service = await current_user.service.first()
        if not user_service or objectif.service.id != user_service.id:
            raise HTTPException(status_code=403, detail="Vous ne pouvez créer un indicateur que pour votre service")

    # Pour les indicateurs qualitatifs, valeur_cible = None
    if indicateur_data.type == TypeIndicateurEnum.QUALITATIF:
        indicateur_data.valeur_cible = None

    try:
        indicateur = await Indicateur.create(**indicateur_data.dict())
        return await Indicateur_Pydantic.from_tortoise_orm(indicateur)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Indicateur déjà existant pour cet objectif")

# ================================
# 📋 Lister tous les indicateurs
# ================================
@router.get("/", response_model=List[Indicateur_Pydantic])
async def lister_indicateurs(current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.RESPONSABLE.value:
        user_service = await current_user.service.first()
        if not user_service:
            return []
        return await Indicateur_Pydantic.from_queryset(
            Indicateur.filter(objectif__service_id=user_service.id)
        )
    # ADMIN voit tout
    return await Indicateur_Pydantic.from_queryset(Indicateur.all())

# ================================
# 🔍 Obtenir un indicateur par ID
# ================================
@router.get("/{indicateur_id}", response_model=Indicateur_Pydantic)
async def obtenir_indicateur(
    indicateur_id: int,
    current_user: User = Depends(get_current_user)
):
    indicateur = await Indicateur.get_or_none(id=indicateur_id).select_related("objectif__service")
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    if current_user.role == RoleEnum.RESPONSABLE.value:
        user_service = await current_user.service.first()
        if not user_service or indicateur.objectif.service.id != user_service.id:
            raise HTTPException(status_code=403, detail="Accès refusé à cet indicateur")

    return await Indicateur_Pydantic.from_tortoise_orm(indicateur)

# ================================
# ✏️ Mettre à jour un indicateur (protégé)
# ================================
@router.put("/{indicateur_id}", response_model=Indicateur_Pydantic)
async def mettre_a_jour_indicateur(
    indicateur_id: int,
    indicateur_data: IndicateurIn_Pydantic,
    current_user: User = Depends(get_current_user)
):
    indicateur = await Indicateur.get_or_none(id=indicateur_id).select_related("objectif__service")
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    if current_user.role == RoleEnum.RESPONSABLE.value:
        user_service = await current_user.service.first()
        if not user_service or indicateur.objectif.service.id != user_service.id:
            raise HTTPException(status_code=403, detail="Vous ne pouvez modifier que les indicateurs de votre service")

    if hasattr(indicateur_data, 'type') and indicateur_data.type == TypeIndicateurEnum.QUALITATIF:
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
    current_user: User = Depends(get_current_user)
):
    indicateur = await Indicateur.get_or_none(id=indicateur_id).select_related("objectif__service")
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    if current_user.role == RoleEnum.RESPONSABLE.value:
        user_service = await current_user.service.first()
        if not user_service or indicateur.objectif.service.id != user_service.id:
            raise HTTPException(status_code=403, detail="Vous ne pouvez supprimer que les indicateurs de votre service")

    await indicateur.delete()
    return {"message": "Indicateur supprimé avec succès"}
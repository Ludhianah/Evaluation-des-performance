from fastapi import APIRouter, HTTPException, Depends, status
from tortoise.exceptions import IntegrityError
from typing import List

from ..models import Objectif, Objectif_Pydantic, ObjectifIn_Pydantic, Service, User, RoleEnum
from ..schemas import ObjectifCreate
from ..routers.auth import get_current_user

router = APIRouter(prefix="/objectifs", tags=["Objectifs"])

# -----------------------------
# Vérification rôle ADMIN
# -----------------------------
async def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Action réservée aux administrateurs"
        )
    return current_user

# -----------------------------
# Vérification rôle RESPONSABLE ou ADMIN pour son service
# -----------------------------
async def responsable_or_admin_for_service(service_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.ADMIN.value:
        return current_user

    elif current_user.role == RoleEnum.RESPONSABLE.value:
        user_service = await current_user.service.first()

        if not user_service:
            raise HTTPException(
                status_code=403,
                detail="Vous n'avez pas de service assigné"
            )

        if user_service.id != service_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous ne pouvez gérer que les objectifs de votre service"
            )

        return current_user

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rôle non autorisé"
        )

# -----------------------------
# Permission pour créer un objectif
# -----------------------------
async def check_create_objectif_permissions(
    objectif_data: ObjectifCreate,
    current_user: User = Depends(get_current_user)
):
    return await responsable_or_admin_for_service(objectif_data.service_id, current_user)

# 🔐 Créer un objectif
@router.post("/", response_model=Objectif_Pydantic)
async def creer_objectif(
    objectif_data: ObjectifCreate,
    current_user: User = Depends(check_create_objectif_permissions)
):
    try:
        # Vérifier que le service existe
        service = await Service.get_or_none(id=objectif_data.service_id)
        if not service:
            raise HTTPException(
                status_code=400,
                detail="Service non trouvé"
            )
        
        objectif = await Objectif.create(**objectif_data.dict())

        # Charger le service
        await objectif.fetch_related("service")

        return await Objectif_Pydantic.from_tortoise_orm(objectif)

    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Un objectif avec ce libellé existe déjà pour ce service et cette période"
        )

# 📋 Lister tous les objectifs
@router.get("/", response_model=List[Objectif_Pydantic])
async def lister_objectifs(current_user: User = Depends(get_current_user)):

    if current_user.role == RoleEnum.RESPONSABLE.value:
        user_service = await current_user.service.first()

        if not user_service:
            return []

        return await Objectif_Pydantic.from_queryset(
            Objectif.filter(service_id=user_service.id)
            .select_related("service")   # ✅ CORRECTION ICI
        )

    return await Objectif_Pydantic.from_queryset(
        Objectif.all().select_related("service")   # ✅ CORRECTION ICI
    )

# 🔍 Obtenir un objectif par ID
@router.get("/{objectif_id}", response_model=Objectif_Pydantic)
async def obtenir_objectif(objectif_id: int, current_user: User = Depends(get_current_user)):

    objectif = await Objectif.get_or_none(id=objectif_id).select_related("service")

    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    if current_user.role == RoleEnum.RESPONSABLE.value:
        user_service = await current_user.service.first()

        if not user_service or user_service.id != objectif.service.id:
            raise HTTPException(
                status_code=403,
                detail="Accès refusé à cet objectif"
            )

    return await Objectif_Pydantic.from_tortoise_orm(objectif)

# ✏️ Mettre à jour un objectif
@router.put("/{objectif_id}", response_model=Objectif_Pydantic)
async def mettre_a_jour_objectif(
    objectif_id: int,
    objectif_data: ObjectifIn_Pydantic,
    current_user: User = Depends(get_current_user)
):

    objectif = await Objectif.get_or_none(id=objectif_id).select_related("service")

    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    # Vérification droits
    await responsable_or_admin_for_service(objectif.service.id, current_user)

    # Si le service change, vérifier aussi
    if hasattr(objectif_data, "service_id") and objectif_data.service_id:
        await responsable_or_admin_for_service(objectif_data.service_id, current_user)

    await objectif.update_from_dict(objectif_data.dict(exclude_unset=True))
    await objectif.save()

    # Recharger le service après modification
    await objectif.fetch_related("service")

    return await Objectif_Pydantic.from_tortoise_orm(objectif)

# 🗑 Supprimer un objectif
@router.delete("/{objectif_id}")
async def supprimer_objectif(
    objectif_id: int,
    current_user: User = Depends(get_current_user)
):

    objectif = await Objectif.get_or_none(id=objectif_id).select_related("service")

    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    # Vérification droits
    await responsable_or_admin_for_service(objectif.service.id, current_user)

    await objectif.delete()

    return {"message": "Objectif supprimé avec succès"}
from fastapi import APIRouter, HTTPException, Depends, status
from tortoise.exceptions import IntegrityError
from typing import List
import jwt

from ..models import Objectif, Objectif_Pydantic, ObjectifIn_Pydantic, Service, User
from ..schemas import ObjectifCreate
from ..routers.auth import get_current_user

router = APIRouter(prefix="/objectifs", tags=["Objectifs"])

# -----------------------------
# Vérification rôle ADMIN
# -----------------------------
async def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Action réservée aux administrateurs"
        )
    return current_user

# -----------------------------
# Vérification rôle RESPONSABLE ou ADMIN pour son service
# -----------------------------
async def responsable_or_admin_for_service(service_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role == "ADMIN":
        return current_user
    elif current_user.role == "RESPONSABLE":
        # Vérifier si le service appartient au responsable
        service = await Service.get_or_none(id=service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        if service.id != current_user.service_id:
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


# Dependency function for creating objectifs
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
        objectif = await Objectif.create(**objectif_data.dict())
        return await Objectif_Pydantic.from_tortoise_orm(objectif)
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Un objectif avec ce libellé existe déjà pour ce service et cette période"
        )


# 📋 Lister tous les objectifs (TOUS les utilisateurs)
@router.get("/", response_model=List[Objectif_Pydantic])
async def lister_objectifs():
    return await Objectif_Pydantic.from_queryset(Objectif.all())


# 🔍 Obtenir un objectif par ID (TOUS les utilisateurs)
@router.get("/{objectif_id}", response_model=Objectif_Pydantic)
async def obtenir_objectif(objectif_id: int):
    objectif = await Objectif.get_or_none(id=objectif_id)
    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")
    return await Objectif_Pydantic.from_tortoise_orm(objectif)


# ✏️ Mettre à jour un objectif
@router.put("/{objectif_id}", response_model=Objectif_Pydantic)
async def mettre_a_jour_objectif(
    objectif_id: int,
    objectif_data: ObjectifIn_Pydantic,
    current_user: User = Depends(get_current_user)
):
    objectif = await Objectif.get_or_none(id=objectif_id)
    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    # Vérification droits
    await responsable_or_admin_for_service(objectif.service_id, current_user)

    # Vérifier si le service change
    if hasattr(objectif_data, "service_id") and objectif_data.service_id:
        await responsable_or_admin_for_service(objectif_data.service_id, current_user)

    await objectif.update_from_dict(objectif_data.dict(exclude_unset=True))
    await objectif.save()
    return await Objectif_Pydantic.from_tortoise_orm(objectif)


# 🗑 Supprimer un objectif
@router.delete("/{objectif_id}")
async def supprimer_objectif(
    objectif_id: int,
    current_user: User = Depends(get_current_user)
):
    objectif = await Objectif.get_or_none(id=objectif_id)
    if not objectif:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    # Vérification droits
    await responsable_or_admin_for_service(objectif.service_id, current_user)

    await objectif.delete()
    return {"message": "Objectif supprimé avec succès"}

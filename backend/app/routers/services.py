from fastapi import APIRouter, HTTPException, Depends, status
from tortoise.exceptions import IntegrityError
from typing import List, Optional

from ..models import Service, Service_Pydantic, ServiceIn_Pydantic, User
from ..schemas import ServiceCreate
from ..routers.auth import get_current_user

router = APIRouter(prefix="/services", tags=["Services"])


# -----------------------------
# Vérification du rôle ADMIN
# -----------------------------
async def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Action réservée aux administrateurs"
        )
    return current_user


# 🔐 Créer un service (ADMIN seulement)
@router.post("/", response_model=Service_Pydantic)
async def creer_service(
    service_data: ServiceCreate,
    current_user: User = Depends(admin_required)
):
    # Vérification simple : nom non vide
    if not service_data.nom.strip():
        raise HTTPException(
            status_code=400,
            detail="Le nom du service ne peut pas être vide"
        )
    try:
        service = await Service.create(**service_data.dict())
        return await Service_Pydantic.from_tortoise_orm(service)
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Un service avec ce nom existe déjà"
        )


# 📋 Lister tous les services (TOUS les utilisateurs)
@router.get("/", response_model=List[Service_Pydantic])
async def lister_services():
    return await Service_Pydantic.from_queryset(Service.all())


# 🔍 Obtenir un service par ID (TOUS les utilisateurs)
@router.get("/{service_id}", response_model=Service_Pydantic)
async def obtenir_service(service_id: int):
    service = await Service.get_or_none(id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    return await Service_Pydantic.from_tortoise_orm(service)


# ✏️ Mettre à jour un service (ADMIN seulement)
@router.put("/{service_id}", response_model=Service_Pydantic)
async def mettre_a_jour_service(
    service_id: int,
    service_data: ServiceIn_Pydantic,
    current_user: User = Depends(admin_required)
):
    service = await Service.get_or_none(id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")

    # Évite de mettre un nom vide
    update_data = service_data.dict(exclude_unset=True)
    if "nom" in update_data and not update_data["nom"].strip():
        raise HTTPException(
            status_code=400,
            detail="Le nom du service ne peut pas être vide"
        )

    await service.update_from_dict(update_data)
    await service.save()
    return await Service_Pydantic.from_tortoise_orm(service)


# 🗑 Supprimer un service (ADMIN seulement)
@router.delete("/{service_id}")
async def supprimer_service(
    service_id: int,
    current_user: User = Depends(admin_required)
):
    service = await Service.get_or_none(id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")

    await service.delete()
    return {"message": "Service supprimé avec succès"}

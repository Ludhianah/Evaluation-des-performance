from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ..models import Employe, Employe_Pydantic, EmployeIn_Pydantic, User
from ..schemas import RoleEnum
from ..routers.auth import get_current_user


router = APIRouter(prefix="/employes", tags=["Employes"])


# =====================================================
# CREER UN EMPLOYE
# =====================================================
@router.post("/", response_model=Employe_Pydantic)
async def creer_employe(
    employe_data: EmployeIn_Pydantic,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.RESPONSABLE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul un responsable peut créer un employé"
        )

    # Vérifier si matricule existe déjà
    existing = await Employe.get_or_none(matricule=employe_data.matricule)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Matricule déjà utilisé"
        )

    employe = await Employe.create(
        matricule=employe_data.matricule,
        nom=employe_data.nom,
        poste=employe_data.poste,
        service_id=current_user.service_id
    )

    return await Employe_Pydantic.from_tortoise_orm(employe)


# =====================================================
# LISTER LES EMPLOYES
# =====================================================
@router.get("/", response_model=List[Employe_Pydantic])
async def lister_employes(current_user: User = Depends(get_current_user)):

    if current_user.role == RoleEnum.ADMIN.value:
        return await Employe_Pydantic.from_queryset(Employe.all())

    if current_user.role == RoleEnum.RESPONSABLE.value:
        return await Employe_Pydantic.from_queryset(
            Employe.filter(service_id=current_user.service_id)
        )

    raise HTTPException(status_code=403, detail="Accès refusé")


# =====================================================
# OBTENIR UN EMPLOYE
# =====================================================
@router.get("/{employe_id}", response_model=Employe_Pydantic)
async def obtenir_employe(
    employe_id: int,
    current_user: User = Depends(get_current_user)
):
    employe = await Employe.get_or_none(id=employe_id)

    if not employe:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    if current_user.role == RoleEnum.RESPONSABLE.value:
        if employe.service_id != current_user.service_id:
            raise HTTPException(status_code=403, detail="Accès refusé")

    return await Employe_Pydantic.from_tortoise_orm(employe)


# =====================================================
# MODIFIER UN EMPLOYE
# =====================================================
@router.put("/{employe_id}", response_model=Employe_Pydantic)
async def modifier_employe(
    employe_id: int,
    employe_data: EmployeIn_Pydantic,
    current_user: User = Depends(get_current_user)
):
    employe = await Employe.get_or_none(id=employe_id)

    if not employe:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    if current_user.role != RoleEnum.RESPONSABLE.value:
        raise HTTPException(status_code=403, detail="Seul un responsable peut modifier")

    if employe.service_id != current_user.service_id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    await employe.update_from_dict(employe_data.dict())
    await employe.save()

    return await Employe_Pydantic.from_tortoise_orm(employe)


# =====================================================
# SUPPRIMER UN EMPLOYE
# =====================================================
@router.delete("/{employe_id}")
async def supprimer_employe(
    employe_id: int,
    current_user: User = Depends(get_current_user)
):
    employe = await Employe.get_or_none(id=employe_id)

    if not employe:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    if current_user.role != RoleEnum.RESPONSABLE.value:
        raise HTTPException(status_code=403, detail="Seul un responsable peut supprimer")

    if employe.service_id != current_user.service_id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    await employe.delete()

    return {"message": "Employé supprimé avec succès"}
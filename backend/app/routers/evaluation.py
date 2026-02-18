from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from ..models import Evaluation, Indicateur, TypeIndicateurEnum, User
from ..schemas import EvaluationCreate, RoleEnum
from ..routers.auth import get_current_user

router = APIRouter(prefix="/evaluations", tags=["Évaluations"])

# ================================
# 🔐 Créer une évaluation (protégé)
# ================================
@router.post("/")
async def creer_evaluation(
    data: EvaluationCreate,
    current_user: User = Depends(get_current_user)
):
    # Vérifier si indicateur existe
    indicateur = await Indicateur.get_or_none(id=data.indicateur_id)
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    # Vérifier rôle RESPONSABLE
    if getattr(current_user, "role", None) == RoleEnum.RESPONSABLE.value:
        if indicateur.objectif.service_id != current_user.service_id:
            raise HTTPException(status_code=403, detail="Vous ne pouvez évaluer que les indicateurs de votre service")

    # Calcul automatique note
    if indicateur.type == TypeIndicateurEnum.QUANTITATIF:
        note = (data.realisation / indicateur.valeur_cible) * 100 if indicateur.valeur_cible else 0
    else:  # QUALITATIF
        note = data.realisation  # valeur fournie directement

    evaluation = await Evaluation.create(
        employe=data.employe,
        realisation=data.realisation,
        note=note,
        mois=data.mois,
        annee=data.annee,
        indicateur_id=data.indicateur_id,
        responsable_id=current_user.id  # on prend automatiquement le responsable connecté
    )

    return {"message": "Évaluation créée avec succès", "note": note}

# ================================
# 📋 Lister les évaluations
# ================================
@router.get("/", response_model=List[EvaluationCreate])
async def lister_evaluations(current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) == RoleEnum.RESPONSABLE.value:
        # Ne retourner que les évaluations de son service
        return await Evaluation.filter(indicateur__objectif__service_id=current_user.service_id).all()
    # ADMIN voit tout
    return await Evaluation.all()

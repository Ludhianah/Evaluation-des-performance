from fastapi import APIRouter, HTTPException, Depends
from typing import List

from ..models import (
    Evaluation,
    EvaluationDetail,
    Indicateur,
    Employe,
    TypeIndicateurEnum,
    User,
    RoleEnum
)
from ..schemas import EvaluationCreate
from ..routers.auth import get_current_user
from tortoise.contrib.pydantic import pydantic_model_creator

router = APIRouter(prefix="/evaluations", tags=["Évaluations"])


# ----------------------------
# ✅ Modèles Pydantic
# ----------------------------
EvaluationDetail_Pydantic = pydantic_model_creator(
    EvaluationDetail,
    name="EvaluationDetail",
    include=("id", "indicateur", "realisation", "note")
)

Evaluation_Pydantic = pydantic_model_creator(
    Evaluation,
    name="Evaluation",
    include=("id", "employe", "mois", "annee", "total_score", "details")
)


# ----------------------------
# 🔐 Créer une évaluation
# ----------------------------
@router.post("/", response_model=dict)
async def creer_evaluation(
    data: EvaluationCreate,
    current_user: User = Depends(get_current_user)
):

    # 🔹 Vérifier employé existe
    employe = await Employe.get_or_none(id=data.employe_id)
    if not employe:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    # 🔹 Vérifier indicateur
    indicateur = await Indicateur.get_or_none(id=data.indicateur_id).prefetch_related("objectif")
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    # 🔹 Vérification service pour RESPONSABLE
    if current_user.role == RoleEnum.RESPONSABLE:
        if employe.service_id != current_user.service_id:
            raise HTTPException(status_code=403, detail="Interdit pour ce service")

    # 🔹 Créer ou récupérer évaluation mensuelle
    evaluation, created = await Evaluation.get_or_create(
        employe=employe,
        mois=data.mois,
        annee=data.annee,
        defaults={"responsable_id": current_user.id}
    )

    # 🔹 Calcul note
    if indicateur.type == TypeIndicateurEnum.QUANTITATIF:
        note = (data.realisation / indicateur.valeur_cible) * 100 if indicateur.valeur_cible else 0
    else:
        note = data.realisation

    # 🔹 Créer détail
    await EvaluationDetail.create(
        evaluation=evaluation,
        indicateur=indicateur,
        realisation=data.realisation,
        note=note
    )

    # 🔹 Recalcul total
    details = await EvaluationDetail.filter(evaluation=evaluation)
    total = sum(d.note for d in details) / len(details)

    evaluation.total_score = total
    await evaluation.save()

    return {
        "message": "Évaluation ajoutée",
        "note_calculée": note,
        "total_actuel": total
    }


# ----------------------------
# 📋 Lister toutes les évaluations
# ----------------------------
@router.get("/", response_model=list[dict])
async def lister_evaluations(current_user: User = Depends(get_current_user)):

    query = Evaluation.all().prefetch_related(
        "employe",
        "details",
        "details__indicateur__objectif__service"
    )

    if current_user.role == RoleEnum.RESPONSABLE:
        query = query.filter(employe__service_id=current_user.service_id)

    evaluations = await query

    results = []
    for eval_item in evaluations:

        details_data = []
        for detail in eval_item.details:
            details_data.append({
                "id": detail.id,
                "indicateur": {
                    "id": detail.indicateur.id,
                    "libelle": detail.indicateur.libelle,
                    "type": detail.indicateur.type,
                    "valeur_cible": detail.indicateur.valeur_cible
                },
                "realisation": detail.realisation,
                "note": detail.note
            })

        results.append({
            "id": eval_item.id,
            "employe": {
                "id": eval_item.employe.id,
                "matricule": eval_item.employe.matricule,
                "nom": eval_item.employe.nom
            },
            "mois": eval_item.mois,
            "annee": eval_item.annee,
            "total_score": eval_item.total_score,
            "details": details_data
        })

    return results


# ----------------------------
# 🔍 Obtenir une évaluation
# ----------------------------
@router.get("/{evaluation_id}", response_model=Evaluation_Pydantic)
async def obtenir_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_user)
):

    evaluation = await Evaluation.get_or_none(id=evaluation_id).prefetch_related(
        "employe",
        "details",
        "details__indicateur__objectif__service"
    )

    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    if current_user.role == RoleEnum.RESPONSABLE:
        if evaluation.employe.service_id != current_user.service_id:
            raise HTTPException(status_code=403, detail="Accès refusé")

    return await Evaluation_Pydantic.from_tortoise_orm(evaluation)


# ----------------------------
# 🗑 Supprimer une évaluation
# ----------------------------
@router.delete("/{evaluation_id}", response_model=dict)
async def supprimer_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_user)
):

    evaluation = await Evaluation.get_or_none(id=evaluation_id).prefetch_related("employe")

    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    if current_user.role == RoleEnum.RESPONSABLE:
        if evaluation.employe.service_id != current_user.service_id:
            raise HTTPException(status_code=403, detail="Interdit pour ce service")

    await evaluation.delete()
    return {"message": "Évaluation supprimée avec succès"}
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from ..models import (
    Evaluation,
    EvaluationDetail,
    Indicateur,
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
# Inclut les détails et indicateurs
EvaluationDetail_Pydantic = pydantic_model_creator(
    EvaluationDetail,
    name="EvaluationDetail",
    include=("id", "indicateur", "realisation", "note")
)

Evaluation_Pydantic = pydantic_model_creator(
    Evaluation,
    name="Evaluation",
    include=("id", "employe_id", "mois", "annee", "total_score", "details")
)

# ----------------------------
# 🔐 Créer une évaluation
# ----------------------------
@router.post("/", response_model=dict)
async def creer_evaluation(
    data: EvaluationCreate,
    current_user: User = Depends(get_current_user)
):
    indicateur = await Indicateur.get_or_none(id=data.indicateur_id).prefetch_related("objectif")
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    # Vérification service si RESPONSABLE
    if current_user.role == RoleEnum.RESPONSABLE.value:
        if indicateur.objectif.service_id != current_user.service_id:
            raise HTTPException(status_code=403, detail="Interdit pour ce service")

    # Chercher ou créer l'évaluation mensuelle
    evaluation, created = await Evaluation.get_or_create(
        employe_id=data.employe_id,
        mois=data.mois,
        annee=data.annee,
        defaults={"responsable_id": current_user.id}
    )

    # Calcul automatique note
    if indicateur.type == TypeIndicateurEnum.QUANTITATIF:
        note = (data.realisation / indicateur.valeur_cible) * 100 if indicateur.valeur_cible else 0
    else:
        note = data.realisation

    # Créer la ligne détail
    await EvaluationDetail.create(
        evaluation=evaluation,
        indicateur=indicateur,
        realisation=data.realisation,
        note=note
    )

    # Recalcul total
    details = await EvaluationDetail.filter(evaluation=evaluation)
    notes = [d.note for d in details]
    total = sum(notes) / len(notes)
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
    query = Evaluation.all().prefetch_related("details", "details__indicateur__objectif__service")
    if current_user.role == RoleEnum.RESPONSABLE.value:
        # filtrer par service du responsable
        query = query.filter(details__indicateur__objectif__service_id=current_user.service.id)
    
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
            "employe_id": eval_item.employe_id,
            "mois": eval_item.mois,
            "annee": eval_item.annee,
            "total_score": eval_item.total_score,
            "details": details_data
        })
    
    return results

# ----------------------------
# 🔍 Obtenir une évaluation par ID
# ----------------------------
@router.get("/{evaluation_id}", response_model=Evaluation_Pydantic)
async def obtenir_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_user)
):
    evaluation = await Evaluation.get_or_none(id=evaluation_id).prefetch_related(
        "details",
        "details__indicateur__objectif__service"
    )
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    # Vérification service pour les responsables
    if current_user.role == RoleEnum.RESPONSABLE.value:
        service_ids = {d.indicateur.objectif.service_id for d in evaluation.details}
        if current_user.service.id not in service_ids:
            raise HTTPException(status_code=403, detail="Accès refusé à cette évaluation")

    return await Evaluation_Pydantic.from_tortoise_orm(evaluation)

# ----------------------------
# ✏️ Mettre à jour une évaluation
# ----------------------------
@router.put("/{evaluation_id}", response_model=Evaluation_Pydantic)
async def mettre_a_jour_evaluation(
    evaluation_id: int,
    data: EvaluationCreate,
    current_user: User = Depends(get_current_user)
):
    evaluation = await Evaluation.get_or_none(id=evaluation_id).prefetch_related(
        "details",
        "details__indicateur__objectif__service"
    )
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    # Vérification service pour les responsables
    if current_user.role == RoleEnum.RESPONSABLE.value:
        service_ids = {d.indicateur.objectif.service_id for d in evaluation.details}
        if current_user.service.id not in service_ids:
            raise HTTPException(status_code=403, detail="Interdit pour ce service")

    # Trouver le détail à mettre à jour
    detail = await EvaluationDetail.get_or_none(
        evaluation=evaluation,
        indicateur_id=data.indicateur_id
    )
    if not detail:
        raise HTTPException(status_code=404, detail="Détail indicateur non trouvé")

    # Calcul note
    if detail.indicateur.type == TypeIndicateurEnum.QUANTITATIF:
        note = (data.realisation / detail.indicateur.valeur_cible) * 100 if detail.indicateur.valeur_cible else 0
    else:
        note = data.realisation

    detail.realisation = data.realisation
    detail.note = note
    await detail.save()

    # Recalcul total
    details = await EvaluationDetail.filter(evaluation=evaluation)
    evaluation.total_score = sum(d.note for d in details) / len(details)
    await evaluation.save()

    return await Evaluation_Pydantic.from_tortoise_orm(evaluation)

# ----------------------------
# 🗑 Supprimer une évaluation
# ----------------------------
@router.delete("/{evaluation_id}", response_model=dict)
async def supprimer_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_user)
):
    evaluation = await Evaluation.get_or_none(id=evaluation_id).prefetch_related(
        "details",
        "details__indicateur__objectif__service"
    )
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    if current_user.role == RoleEnum.RESPONSABLE.value:
        service_ids = {d.indicateur.objectif.service_id for d in evaluation.details}
        if current_user.service.id not in service_ids:
            raise HTTPException(status_code=403, detail="Interdit pour ce service")

    await evaluation.delete()
    return {"message": "Évaluation supprimée avec succès"}
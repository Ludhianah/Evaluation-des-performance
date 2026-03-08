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

# =====================================================
# MODELES PYDANTIC
# =====================================================

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

# =====================================================
# CREER UNE EVALUATION
# =====================================================

@router.post("/", response_model=dict)
async def creer_evaluation(
    data: EvaluationCreate,
    current_user: User = Depends(get_current_user)
):
    employe = await Employe.get_or_none(id=data.employe_id)
    if not employe:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    indicateur = await Indicateur.get_or_none(id=data.indicateur_id).prefetch_related("objectif")
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    if current_user.role == RoleEnum.RESPONSABLE:
        employe_service = await employe.service
        current_user_service = await current_user.service
        if employe_service.id != current_user_service.id:
            raise HTTPException(status_code=403, detail="Interdit pour ce service")

    evaluation, created = await Evaluation.get_or_create(
        employe=employe,
        mois=data.mois,
        annee=data.annee,
        defaults={"responsable": current_user}
    )

    # calcul note
    if indicateur.type == TypeIndicateurEnum.QUANTITATIF:
        note = (data.realisation / indicateur.valeur_cible) * 100 if indicateur.valeur_cible else 0
    else:
        note = data.realisation  # pour qualitatif, la note peut être directement saisie ou mappée

    note = max(0, min(100, note))

    # vérifier doublon indicateur
    detail_existant = await EvaluationDetail.get_or_none(
        evaluation=evaluation,
        indicateur=indicateur
    )
    if detail_existant:
        raise HTTPException(
            status_code=400,
            detail="Cet indicateur est déjà évalué pour ce mois"
        )

    # créer détail
    await EvaluationDetail.create(
        evaluation=evaluation,
        indicateur=indicateur,
        realisation=data.realisation,
        note=note
    )

    # recalcul score total
    details = await EvaluationDetail.filter(evaluation=evaluation)
    total = sum(d.note for d in details) / len(details) if details else 0
    evaluation.total_score = total
    await evaluation.save()

    return {
        "message": "Évaluation ajoutée",
        "note_calculée": note,
        "total_actuel": total
    }

# =====================================================
# LISTER TOUTES LES EVALUATIONS
# =====================================================

@router.get("/", response_model=list[dict])
async def lister_evaluations(current_user: User = Depends(get_current_user)):
    query = Evaluation.all().prefetch_related(
        "employe",
        "details",
        "details__indicateur__objectif__service"
    ).order_by("-annee", "-mois")

    if current_user.role == RoleEnum.RESPONSABLE:
        current_user_service = await current_user.service
        query = query.filter(employe__service=current_user_service)

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

# =====================================================
# RESULTAT D'EVALUATION PAR EMPLOYE (QUALITATIF AMELIORE)
# =====================================================

@router.get("/employe/{employe_id}", response_model=list[dict])
async def resultat_par_employe(
    employe_id: int,
    current_user: User = Depends(get_current_user)
):

    employe = await Employe.get_or_none(id=employe_id)
    if not employe:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    if current_user.role == RoleEnum.RESPONSABLE:
        employe_service = await employe.service
        current_user_service = await current_user.service
        if employe_service.id != current_user_service.id:
            raise HTTPException(status_code=403, detail="Accès refusé")

    evaluations = await Evaluation.filter(
        employe=employe
    ).prefetch_related(
        "details",
        "details__indicateur",
        "details__indicateur__objectif"
    ).order_by("-annee", "-mois")

    results = []

    for ev in evaluations:
        lignes = []
        for d in ev.details:
            if d.indicateur.type == TypeIndicateurEnum.QUALITATIF:
                objectif = d.indicateur.objectif.libelle if d.indicateur.objectif else None
                realisation = d.realisation
            else:
                objectif = d.indicateur.valeur_cible
                realisation = d.realisation

            lignes.append({
                "indicateur": d.indicateur.libelle,
                "type": d.indicateur.type,
                "objectif": objectif,
                "realisation": realisation,
                "note": d.note
            })

        results.append({
            "evaluation_id": ev.id,
            "mois": ev.mois,
            "annee": ev.annee,
            "score_total": ev.total_score,
            "details": lignes
        })

    return results

# =====================================================
# OBTENIR UNE EVALUATION
# =====================================================

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
        employe_service = await evaluation.employe.service
        current_user_service = await current_user.service
        if employe_service.id != current_user_service.id:
            raise HTTPException(status_code=403, detail="Accès refusé")

    return await Evaluation_Pydantic.from_tortoise_orm(evaluation)

# =====================================================
# SUPPRIMER UNE EVALUATION
# =====================================================

@router.delete("/{evaluation_id}", response_model=dict)
async def supprimer_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_user)
):

    evaluation = await Evaluation.get_or_none(id=evaluation_id).prefetch_related("employe")

    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    if current_user.role == RoleEnum.RESPONSABLE:
        employe_service = await evaluation.employe.service
        current_user_service = await current_user.service
        if employe_service.id != current_user_service.id:
            raise HTTPException(status_code=403, detail="Interdit pour ce service")

    await evaluation.delete()

    return {"message": "Évaluation supprimée avec succès"}
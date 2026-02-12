from fastapi import APIRouter, HTTPException
from ..models import Evaluation, Indicateur, TypeIndicateurEnum
from ..schemas import EvaluationCreate

router = APIRouter(prefix="/evaluations", tags=["Évaluations"])

# Créer une évaluation
@router.post("/")
async def creer_evaluation(data: EvaluationCreate):
    # Vérifier si indicateur existe
    indicateur = await Indicateur.get_or_none(id=data.indicateur_id)
    if not indicateur:
        raise HTTPException(status_code=404, detail="Indicateur non trouvé")

    # Calcul automatique note
    if indicateur.type == TypeIndicateurEnum.QUANTITATIF:
        note = (data.realisation / indicateur.valeur_cible) * 100 if indicateur.valeur_cible else 0
    else:  # QUALITATIF
        # Ici on suppose que la réalisation = 100/85/70/50 selon la grille
        note = data.realisation

    evaluation = await Evaluation.create(
        employe=data.employe,
        realisation=data.realisation,
        note=note,
        mois=data.mois,
        annee=data.annee,
        indicateur_id=data.indicateur_id,
        responsable_id=data.responsable_id
    )

    return {"message": "Évaluation créée avec succès", "note": note}
from typing import Optional
from pydantic import BaseModel, Field, conint, model_validator, field_validator
from enum import Enum
from datetime import date

# =====================================================
# ENUM RÔLE
# =====================================================
class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    RESPONSABLE = "RESPONSABLE"

# =====================================================
# ENUM TYPE INDICATEUR
# =====================================================
class TypeIndicateurEnum(str, Enum):
    QUANTITATIF = "QUANTITATIF"
    QUALITATIF = "QUALITATIF"

# =====================================================
# USER
# =====================================================
class UserCreate(BaseModel):
    username: str
    password: str = Field(..., min_length=1, max_length=72, description="Mot de passe 1-72 caractères")
    role: RoleEnum
    service_id: Optional[int] = None  # Autorisé à None pour ADMIN

# =====================================================
# SERVICE
# =====================================================
class ServiceCreate(BaseModel):
    nom: str = Field(..., min_length=1, description="Nom du service")

# =====================================================
# OBJECTIF
# =====================================================
class ObjectifCreate(BaseModel):
    libelle: str
    date: date
    service_id: int
    
    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, v):
        if isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                raise ValueError("Date must be in YYYY-MM-DD format")
        return v

# Réponse simplifiée pour Objectif (sans description ni unité)
class ObjectifResponse(BaseModel):
    id: int
    libelle: str
    date: date

    class Config:
        orm_mode = True

# =====================================================
# INDICATEUR
# =====================================================
class IndicateurCreate(BaseModel):
    libelle: str
    type: TypeIndicateurEnum
    valeur_cible: Optional[float] = None
    objectif_id: int

    @model_validator(mode="after")
    def check_valeur_cible(cls, model):
        if model.type == TypeIndicateurEnum.QUALITATIF:
            model.valeur_cible = None
        return model

# Réponse complète pour un indicateur avec objectif
class IndicateurResponse(BaseModel):
    id: int
    libelle: str
    type: TypeIndicateurEnum
    valeur_cible: Optional[float] = None
    objectif: ObjectifResponse

    class Config:
        orm_mode = True

# =====================================================
# ÉVALUATION
# =====================================================
class EvaluationCreate(BaseModel):
    employe_id: int
    realisation: float
    indicateur_id: int
    mois: conint(ge=1, le=12)
    annee: conint(ge=2000)

# =====================================================
# ÉVALUATION DETAIL (lignes du tableau)
# =====================================================
class EvaluationDetailCreate(BaseModel):
    evaluation_id: int
    indicateur_id: int
    realisation: Optional[float] = None
    note: float
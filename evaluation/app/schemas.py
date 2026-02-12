from pydantic import BaseModel
from enum import Enum

# Enum rôle pour validation
class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    RESPONSABLE = "RESPONSABLE"

# Création d'utilisateur
class UserCreate(BaseModel):
    username: str
    password: str
    role: RoleEnum
    service_id: int

# Création Service
class ServiceCreate(BaseModel):
    nom: str

# Création Objectif
class ObjectifCreate(BaseModel):
    libelle: str
    mois: int
    annee: int
    service_id: int

# Création Indicateur
class TypeIndicateurEnum(str, Enum):
    QUANTITATIF = "QUANTITATIF"
    QUALITATIF = "QUALITATIF"

class IndicateurCreate(BaseModel):
    libelle: str
    type: TypeIndicateurEnum
    valeur_cible: float = None
    objectif_id: int

# Création Evaluation
class EvaluationCreate(BaseModel):
    employe: str
    realisation: float
    indicateur_id: int
    responsable_id: int
    mois: int
    annee: int

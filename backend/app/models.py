from tortoise.models import Model
from tortoise import fields
from tortoise.contrib.pydantic import pydantic_model_creator
from enum import Enum


# =====================================================
# ENUM ROLE
# =====================================================
class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    RESPONSABLE = "RESPONSABLE"


# =====================================================
# TABLE SERVICE
# =====================================================
class Service(Model):
    id = fields.IntField(pk=True)
    nom = fields.CharField(max_length=255, unique=True)

    utilisateurs: fields.ReverseRelation["User"]
    objectifs: fields.ReverseRelation["Objectif"]

    class Meta:
        table = "services"


# =====================================================
# TABLE USER (Admin / Responsable / Employé)
# =====================================================
class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=255, unique=True)
    password = fields.CharField(max_length=255)

    role = fields.CharEnumField(RoleEnum, default=RoleEnum.RESPONSABLE)

    service: fields.ForeignKeyRelation[Service] = fields.ForeignKeyField(
        "models.Service",
        related_name="utilisateurs",
        null=True
    )

    # Evaluations reçues en tant qu'employé
    evaluations_employe: fields.ReverseRelation["Evaluation"]

    # Evaluations faites en tant que responsable
    evaluations_responsable: fields.ReverseRelation["Evaluation"]

    class Meta:
        table = "users"


# =====================================================
# TABLE OBJECTIF
# =====================================================
class Objectif(Model):
    id = fields.IntField(pk=True)
    libelle = fields.CharField(max_length=255)
    date = fields.DateField()

    service: fields.ForeignKeyRelation[Service] = fields.ForeignKeyField(
        "models.Service",
        related_name="objectifs"
    )

    indicateurs: fields.ReverseRelation["Indicateur"]

    class Meta:
        table = "objectifs"


# =====================================================
# ENUM TYPE INDICATEUR
# =====================================================
class TypeIndicateurEnum(str, Enum):
    QUANTITATIF = "QUANTITATIF"
    QUALITATIF = "QUALITATIF"


# =====================================================
# TABLE INDICATEUR
# =====================================================
class Indicateur(Model):
    id = fields.IntField(pk=True)
    libelle = fields.CharField(max_length=255)
    type = fields.CharEnumField(TypeIndicateurEnum)

    valeur_cible = fields.FloatField(null=True)

    objectif: fields.ForeignKeyRelation[Objectif] = fields.ForeignKeyField(
        "models.Objectif",
        related_name="indicateurs"
    )

    details: fields.ReverseRelation["EvaluationDetail"]

    class Meta:
        table = "indicateurs"


# =====================================================
# TABLE EVALUATION (1 employé / 1 mois)
# =====================================================
class Evaluation(Model):
    id = fields.IntField(pk=True)

    employe: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User",
        related_name="evaluations_employe"
    )

    responsable: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User",
        related_name="evaluations_responsable"
    )

    mois = fields.IntField()
    annee = fields.IntField()

    # 🔥 TOTAL / MOYENNE GLOBALE
    total_score = fields.FloatField(null=True)

    details: fields.ReverseRelation["EvaluationDetail"]

    class Meta:
        table = "evaluations"
        unique_together = [("employe", "mois", "annee")]


# =====================================================
# TABLE EVALUATION DETAIL (LIGNES DU TABLEAU)
# =====================================================
class EvaluationDetail(Model):
    id = fields.IntField(pk=True)

    evaluation: fields.ForeignKeyRelation[Evaluation] = fields.ForeignKeyField(
        "models.Evaluation",
        related_name="details"
    )

    indicateur: fields.ForeignKeyRelation[Indicateur] = fields.ForeignKeyField(
        "models.Indicateur"
    )

    realisation = fields.FloatField(null=True)
    note = fields.FloatField()

    class Meta:
        table = "evaluation_details"


# =====================================================
# PYDANTIC MODELS
# =====================================================
Service_Pydantic = pydantic_model_creator(Service, name="Service")
ServiceIn_Pydantic = pydantic_model_creator(Service, name="ServiceIn", exclude_readonly=True)

User_Pydantic = pydantic_model_creator(User, name="User")
UserIn_Pydantic = pydantic_model_creator(User, name="UserIn", exclude_readonly=True)

Objectif_Pydantic = pydantic_model_creator(Objectif, name="Objectif")
ObjectifIn_Pydantic = pydantic_model_creator(Objectif, name="ObjectifIn", exclude_readonly=True)

Indicateur_Pydantic = pydantic_model_creator(Indicateur, name="Indicateur")
IndicateurIn_Pydantic = pydantic_model_creator(Indicateur, name="IndicateurIn", exclude_readonly=True)

Evaluation_Pydantic = pydantic_model_creator(Evaluation, name="Evaluation")
EvaluationIn_Pydantic = pydantic_model_creator(Evaluation, name="EvaluationIn", exclude_readonly=True)

EvaluationDetail_Pydantic = pydantic_model_creator(EvaluationDetail, name="EvaluationDetail")
EvaluationDetailIn_Pydantic = pydantic_model_creator(EvaluationDetail, name="EvaluationDetailIn", exclude_readonly=True)
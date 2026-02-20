from tortoise.models import Model
from tortoise import fields
from tortoise.contrib.pydantic import pydantic_model_creator
from enum import Enum


# -----------------------------
# ENUM ROLE
# -----------------------------
class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    RESPONSABLE = "RESPONSABLE"


# -----------------------------
# Table Service
# -----------------------------
class Service(Model):
    id = fields.IntField(pk=True)
    nom = fields.CharField(max_length=255, unique=True)

    utilisateurs: fields.ReverseRelation["User"]
    objectifs: fields.ReverseRelation["Objectif"]

    class Meta:
        table = "services"


# -----------------------------
# Table User (admin / responsable)
# -----------------------------
class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=255, unique=True)
    password = fields.CharField(max_length=255)

    role = fields.CharEnumField(RoleEnum, default=RoleEnum.RESPONSABLE)

    # 🔥 Un responsable appartient à un service
    service: fields.ForeignKeyRelation[Service] = fields.ForeignKeyField(
        "models.Service",
        related_name="utilisateurs",
        null=True
    )

    evaluations: fields.ReverseRelation["Evaluation"]

    class Meta:
        table = "users"


# -----------------------------
# Table Objectif
# -----------------------------
class Objectif(Model):
    id = fields.IntField(pk=True)
    libelle = fields.CharField(max_length=255)
    date = fields.DateField()


    service: fields.ForeignKeyRelation[Service] = fields.ForeignKeyField(
        "models.Service", related_name="objectifs"
    )

    indicateurs: fields.ReverseRelation["Indicateur"]

    class Meta:
        table = "objectifs"


# -----------------------------
# Table Indicateur
# -----------------------------
class TypeIndicateurEnum(str, Enum):
    QUANTITATIF = "QUANTITATIF"
    QUALITATIF = "QUALITATIF"


class Indicateur(Model):
    id = fields.IntField(pk=True)
    libelle = fields.CharField(max_length=255)
    type = fields.CharEnumField(TypeIndicateurEnum)
    valeur_cible = fields.FloatField(null=True)

    objectif: fields.ForeignKeyRelation[Objectif] = fields.ForeignKeyField(
        "models.Objectif", related_name="indicateurs"
    )

    evaluations: fields.ReverseRelation["Evaluation"]

    class Meta:
        table = "indicateurs"


# -----------------------------
# Table Evaluation mensuelle
# -----------------------------
class Evaluation(Model):
    id = fields.IntField(pk=True)
    employe = fields.CharField(max_length=255)
    realisation = fields.FloatField()
    note = fields.FloatField()
    mois = fields.IntField()
    annee = fields.IntField()

    indicateur: fields.ForeignKeyRelation[Indicateur] = fields.ForeignKeyField(
        "models.Indicateur", related_name="evaluations"
    )

    responsable: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User", related_name="evaluations"
    )

    class Meta:
        table = "evaluations"
        unique_together = [("employe", "indicateur", "mois", "annee")]


# -----------------------------
# Pydantic Models
# -----------------------------
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

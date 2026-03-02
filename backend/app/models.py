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
    employes: fields.ReverseRelation["Employe"]

    class Meta:
        table = "services"


# =====================================================
# TABLE USER
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

    evaluations_responsable: fields.ReverseRelation["Evaluation"]

    class Meta:
        table = "users"


# =====================================================
# TABLE EMPLOYE
# =====================================================
class Employe(Model):
    id = fields.IntField(pk=True)
    matricule = fields.CharField(max_length=50, unique=True)
    nom = fields.CharField(max_length=255)
    poste = fields.CharField(max_length=255, null=True)

    service: fields.ForeignKeyRelation[Service] = fields.ForeignKeyField(
        "models.Service",
        related_name="employes",
        on_delete=fields.CASCADE
    )

    evaluations: fields.ReverseRelation["Evaluation"]

    class Meta:
        table = "employes"


# =====================================================
# TABLE OBJECTIF
# =====================================================
class Objectif(Model):
    id = fields.IntField(pk=True)
    libelle = fields.CharField(max_length=255)
    date = fields.DateField()

    service: fields.ForeignKeyRelation[Service] = fields.ForeignKeyField(
        "models.Service",
        related_name="objectifs",
        on_delete=fields.CASCADE
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
        related_name="indicateurs",
        on_delete=fields.CASCADE
    )

    details: fields.ReverseRelation["EvaluationDetail"]

    class Meta:
        table = "indicateurs"


# =====================================================
# TABLE EVALUATION
# =====================================================
class Evaluation(Model):
    id = fields.IntField(pk=True)

    employe: fields.ForeignKeyRelation[Employe] = fields.ForeignKeyField(
        "models.Employe",
        related_name="evaluations",
        on_delete=fields.CASCADE
    )

    responsable: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User",
        related_name="evaluations_responsable",
        on_delete=fields.CASCADE
    )

    mois = fields.IntField()
    annee = fields.IntField()
    total_score = fields.FloatField(null=True)

    details: fields.ReverseRelation["EvaluationDetail"]

    class Meta:
        table = "evaluations"
        unique_together = [("employe", "mois", "annee")]


# =====================================================
# TABLE EVALUATION DETAIL
# =====================================================
class EvaluationDetail(Model):
    id = fields.IntField(pk=True)

    evaluation: fields.ForeignKeyRelation[Evaluation] = fields.ForeignKeyField(
        "models.Evaluation",
        related_name="details",
        on_delete=fields.CASCADE
    )

    indicateur: fields.ForeignKeyRelation[Indicateur] = fields.ForeignKeyField(
        "models.Indicateur",
        on_delete=fields.CASCADE
    )

    realisation = fields.FloatField(null=True)
    note = fields.FloatField()

    class Meta:
        table = "evaluation_details"


# =====================================================
# PYDANTIC MODELS OPTIMISÉS
# =====================================================

Service_Pydantic = pydantic_model_creator(Service, name="Service")
ServiceIn_Pydantic = pydantic_model_creator(Service, name="ServiceIn", exclude_readonly=True)

User_Pydantic = pydantic_model_creator(User, name="User")
UserIn_Pydantic = pydantic_model_creator(User, name="UserIn", exclude_readonly=True)

Employe_Pydantic = pydantic_model_creator(Employe, name="Employe")
EmployeIn_Pydantic = pydantic_model_creator(Employe, name="EmployeIn", exclude_readonly=True)

Objectif_Pydantic = pydantic_model_creator(
    Objectif,
    name="Objectif",
    include=("id", "libelle", "date")
)

ObjectifIn_Pydantic = pydantic_model_creator(
    Objectif,
    name="ObjectifIn",
    exclude_readonly=True
)

Indicateur_Pydantic = pydantic_model_creator(
    Indicateur,
    name="Indicateur",
    include=("id", "libelle", "type", "valeur_cible", "objectif")
)

IndicateurIn_Pydantic = pydantic_model_creator(
    Indicateur,
    name="IndicateurIn",
    exclude_readonly=True
)

Evaluation_Pydantic = pydantic_model_creator(Evaluation, name="Evaluation")
EvaluationIn_Pydantic = pydantic_model_creator(Evaluation, name="EvaluationIn", exclude_readonly=True)

EvaluationDetail_Pydantic = pydantic_model_creator(
    EvaluationDetail,
    name="EvaluationDetail"
)

EvaluationDetailIn_Pydantic = pydantic_model_creator(
    EvaluationDetail,
    name="EvaluationDetailIn",
    exclude_readonly=True
)
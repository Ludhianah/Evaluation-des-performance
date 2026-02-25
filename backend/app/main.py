from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise

# Import des routeurs
from .routers import auth, services, indicateurs, objectifs, evaluation, employes

app = FastAPI(
    title="API Évaluation Mensuelle",
    description="Suivi et évaluation mensuelle des employés",
    version="1.0"
)

# Configuration CORS pour autoriser les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"  # Pour Docker/conteneurs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API Évaluation opérationnelle"}

# Inclusion des routeurs
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(indicateurs.router)
app.include_router(objectifs.router)
app.include_router(evaluation.router)
app.include_router(employes.router)

# 🔥 Initialisation officielle Tortoise
import os

# Détection de l'environnement Docker
if os.environ.get("DATABASE_URL"):
    # Environnement Docker avec PostgreSQL
    db_url = os.environ.get("DATABASE_URL")
else:
    # Environnement de développement local avec SQLite
    db_url = "sqlite://db.sqlite3"

register_tortoise(
    app,
    db_url=db_url,
    modules={"models": ["app.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)

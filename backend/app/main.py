from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise

# Import des routeurs
from .routers import auth, services, indicateurs, objectifs, evaluation

app = FastAPI(
    title="API Évaluation Mensuelle",
    description="Suivi et évaluation mensuelle des employés",
    version="1.0"
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

# 🔥 Initialisation officielle Tortoise
register_tortoise(
    app,
    db_url="postgres://postgres:postgres@db:5432/postgres",
    modules={"models": ["app.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)

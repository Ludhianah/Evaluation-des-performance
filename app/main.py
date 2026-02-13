from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from .routers import evaluation, auth, services

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
app.include_router(evaluation.router)
app.include_router(services.router)

# 🔥 Initialisation officielle Tortoise
register_tortoise(
    app,
    db_url="postgres://postgres:postgres@db:5432/postgres",
    modules={"models": ["app.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)

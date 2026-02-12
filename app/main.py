from fastapi import FastAPI
from .database import init_db, close_db
from .routers import evaluation
from .routers import auth  

app = FastAPI(
    title="API Évaluation Mensuelle",
    description="Suivi et évaluation mensuelle des employés",
    version="1.0"
)


# Événements startup / shutdown


@app.on_event("startup")
async def startup_event():
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()


# Route de test


@app.get("/")
def home():
    return {"message": "API Évaluation opérationnelle"}


# Inclusion des routeurs

app.include_router(auth.router)        # ✅ Authentification
app.include_router(evaluation.router)  # ✅ Évaluations

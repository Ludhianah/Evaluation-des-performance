from fastapi import FastAPI
from .database import init_db, close_db
from .routers import evaluation

app = FastAPI(
    title="API Évaluation Mensuelle",
    description="Suivi et évaluation mensuelle des employés",
    version="1.0"
)

# Événements de démarrage et d'arrêt
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

# Inclusion du routeur
app.include_router(evaluation.router)
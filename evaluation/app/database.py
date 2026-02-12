from tortoise import Tortoise
import os

# Récupère l'URL depuis docker-compose
DATABASE_URL = os.getenv("DATABASE_URL")

# Configuration de Tortoise ORM
async def init_db():
    await Tortoise.init(
        db_url=DATABASE_URL,
        modules={'models': ['evaluation.app.models']}
    )
    await Tortoise.generate_schemas()

# Fonction pour fermer la connexion
async def close_db():
    await Tortoise.close_connections()
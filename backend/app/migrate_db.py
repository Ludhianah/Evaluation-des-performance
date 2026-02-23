import asyncio
import sys
import os
from passlib.context import CryptContext

# Add the current directory to Python path to allow importing app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tortoise import Tortoise
from models import Service, User, RoleEnum, Evaluation

async def migrate_database():
    await Tortoise.init(
        db_url="postgres://postgres:postgres@db:5432/evaluation_db",  # Use 'db' hostname for Docker
        modules={"models": ["models"]}  # Use relative path since we're in the app directory
    )
    
    # Check if total_score column exists by trying to query it
    try:
        # Try to select from evaluations table with total_score
        await Evaluation.raw("SELECT total_score FROM evaluations LIMIT 1")
        print("La colonne total_score existe déjà dans la table evaluations.")
    except Exception as e:
        if "column \"total_score\" does not exist" in str(e):
            print("Ajout de la colonne total_score à la table evaluations...")
            # Add the total_score column
            await Evaluation.raw("ALTER TABLE evaluations ADD COLUMN total_score DOUBLE PRECISION")
            print("Colonne total_score ajoutée avec succès !")
        else:
            print(f"Erreur lors de la vérification de la colonne total_score: {e}")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(migrate_database())
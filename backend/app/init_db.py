import asyncio
import sys
import os
from passlib.context import CryptContext

# Add the current directory to Python path to allow importing app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tortoise import Tortoise
from models import Service, User, RoleEnum, Evaluation

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init():
    await Tortoise.init(
        db_url="postgres://postgres:postgres@db:5432/evaluation_db",  # Use 'db' hostname for Docker
        modules={"models": ["models"]}  # Use relative path since we're in the app directory
    )
    # Crée les tables si elles n'existent pas
    await Tortoise.generate_schemas()
    print("Tables créées avec succès !")
    
    # Vérifie et ajoute la colonne total_score si elle n'existe pas
    try:
        # Essaye de sélectionner la colonne total_score
        await Evaluation.raw("SELECT total_score FROM evaluations LIMIT 1")
        print("La colonne total_score existe déjà dans la table evaluations.")
    except Exception as e:
        if "column \"total_score\" does not exist" in str(e):
            print("Ajout de la colonne total_score à la table evaluations...")
            # Ajoute la colonne total_score
            await Evaluation.raw("ALTER TABLE evaluations ADD COLUMN total_score DOUBLE PRECISION")
            print("Colonne total_score ajoutée avec succès !")
        else:
            print(f"Erreur lors de la vérification de la colonne total_score: {e}")
    
    # Crée des services par défaut si la table est vide
    service_count = await Service.all().count()
    if service_count == 0:
        # Crée quelques services par défaut
        await Service.create(nom="Service Informatique")
        await Service.create(nom="Service Commercial")
        await Service.create(nom="Service RH")
        await Service.create(nom="Service Comptabilité")
        print("Services par défaut créés avec succès !")
    
    # Crée un utilisateur admin par défaut si la table est vide
    user_count = await User.all().count()
    if user_count == 0:
        # Crée un utilisateur admin avec le premier service
        first_service = await Service.first()
        if first_service:
            # Hash the password properly
            hashed_password = pwd_context.hash("admin123")
            await User.create(
                username="admin",
                password=hashed_password,  # Use hashed password
                role=RoleEnum.ADMIN,
                service=first_service
            )
            print("Utilisateur admin par défaut créé avec succès !")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(init())

import asyncio
import sys
import os

# Add the current directory to Python path to allow importing app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tortoise import Tortoise
from models import Employe, Evaluation, EvaluationDetail

async def check_schema():
    await Tortoise.init(
        db_url="postgres://postgres:postgres@db:5432/evaluation_db",
        modules={"models": ["models"]}
    )
    
    print("=== Vérification du schéma de la base de données ===")
    
    # Check Employe table structure
    try:
        result = await Employe.raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employes' ORDER BY column_name")
        print("\nStructure de la table 'employes':")
        for row in result:
            print(f"  {row['column_name']}: {row['data_type']}")
    except Exception as e:
        print(f"Erreur lors de la vérification de la table employes: {e}")
    
    # Check Evaluation table structure
    try:
        result = await Evaluation.raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'evaluations' ORDER BY column_name")
        print("\nStructure de la table 'evaluations':")
        for row in result:
            print(f"  {row['column_name']}: {row['data_type']}")
    except Exception as e:
        print(f"Erreur lors de la vérification de la table evaluations: {e}")
    
    # Check EvaluationDetail table structure
    try:
        result = await EvaluationDetail.raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'evaluation_details' ORDER BY column_name")
        print("\nStructure de la table 'evaluation_details':")
        for row in result:
            print(f"  {row['column_name']}: {row['data_type']}")
    except Exception as e:
        print(f"Erreur lors de la vérification de la table evaluation_details: {e}")
    
    # Test a simple query to see if the issue persists
    try:
        print("\n=== Test de requête simple ===")
        employe = await Employe.get_or_none(id=1)
        if employe:
            print(f"Employé trouvé: {employe.nom} (ID: {employe.id})")
        else:
            print("Aucun employé trouvé avec l'ID 1")
    except Exception as e:
        print(f"Erreur lors de la requête simple: {e}")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check_schema())
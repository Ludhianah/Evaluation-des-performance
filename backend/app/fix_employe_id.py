import asyncio
import sys
import os

# Add the current directory to Python path to allow importing app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tortoise import Tortoise

async def fix_employe_id_column():
    await Tortoise.init(
        db_url="postgres://postgres:postgres@db:5432/evaluation_db",
        modules={"models": ["models"]}
    )
    
    print("=== Correction de la colonne employe_id ===")
    
    try:
        # Check current column type
        result = await Tortoise.get_connection("default").execute_query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'employe_id'"
        )
        
        if result[1]:  # If result exists
            current_type = result[1][0][1]  # Get data_type
            print(f"Type actuel de employe_id: {current_type}")
            
            if current_type != 'integer':
                print("Modification du type de employe_id en INTEGER...")
                await Tortoise.get_connection("default").execute_query(
                    "ALTER TABLE evaluations ALTER COLUMN employe_id TYPE INTEGER USING employe_id::integer"
                )
                print("Colonne employe_id convertie en INTEGER avec succès !")
            else:
                print("La colonne employe_id est déjà de type INTEGER")
        else:
            print("Colonne employe_id non trouvée dans la table evaluations")
            
    except Exception as e:
        print(f"Erreur lors de la correction: {e}")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(fix_employe_id_column())
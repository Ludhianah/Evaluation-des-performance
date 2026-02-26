import asyncio
import sys
import os

# Add the current directory to Python path to allow importing app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tortoise import Tortoise

async def fix_schema_migration():
    await Tortoise.init(
        db_url="postgres://postgres:postgres@db:5432/evaluation_db",
        modules={"models": ["models"]}
    )
    
    print("=== Migration: Correction du type de colonne employe_id ===")
    
    try:
        # Check current column type
        result = await Tortoise.get_connection("default").execute_query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'evaluations' AND column_name = 'employe_id'"
        )
        
        if result[1]:  # If result exists
            current_type = result[1][0][1]  # Get data_type
            print(f"Type actuel de employe_id: {current_type}")
            
            if current_type in ['character varying', 'varchar', 'text']:
                print("Conversion de employe_id en INTEGER...")
                # First, ensure all values can be converted to integer
                await Tortoise.get_connection("default").execute_query(
                    "UPDATE evaluations SET employe_id = employe_id::integer WHERE employe_id IS NOT NULL"
                )
                # Then alter the column type
                await Tortoise.get_connection("default").execute_query(
                    "ALTER TABLE evaluations ALTER COLUMN employe_id TYPE INTEGER USING employe_id::integer"
                )
                print("Colonne employe_id convertie en INTEGER avec succès !")
            elif current_type != 'integer':
                print(f"Type inattendu: {current_type}. Tentative de conversion...")
                await Tortoise.get_connection("default").execute_query(
                    "ALTER TABLE evaluations ALTER COLUMN employe_id TYPE INTEGER USING employe_id::integer"
                )
                print("Colonne employe_id convertie en INTEGER avec succès !")
            else:
                print("La colonne employe_id est déjà de type INTEGER")
        else:
            print("Colonne employe_id non trouvée dans la table evaluations")
            
        # Also check if there are any foreign key constraints that need to be updated
        print("\n=== Vérification des contraintes de clé étrangère ===")
        fk_result = await Tortoise.get_connection("default").execute_query(
            """
            SELECT constraint_name, column_name, referenced_table_name, referenced_column_name
            FROM information_schema.key_column_usage 
            WHERE table_name = 'evaluations' AND column_name = 'employe_id'
            """
        )
        
        if fk_result[1]:
            print("Contraintes de clé étrangère trouvées:")
            for row in fk_result[1]:
                print(f"  {row[0]}: {row[1]} -> {row[2]}.{row[3]}")
        else:
            print("Aucune contrainte de clé étrangère trouvée pour employe_id")
            
    except Exception as e:
        print(f"Erreur lors de la migration: {e}")
        import traceback
        traceback.print_exc()
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(fix_schema_migration())
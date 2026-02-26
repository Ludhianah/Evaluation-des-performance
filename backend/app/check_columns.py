import asyncio
import sys
import os
sys.path.append('/app')
from tortoise import Tortoise
from models import Evaluation

async def check_columns():
    await Tortoise.init(
        db_url='postgres://postgres:postgres@db:5432/evaluation_db',
        modules={'models': ['models']}
    )
    
    # Check what columns exist
    try:
        # Try to select from both columns to see which exist
        try:
            result = await Evaluation.raw('SELECT employe FROM evaluations LIMIT 1')
            print('✓ La colonne employe existe')
        except Exception:
            print('✗ La colonne employe n\'existe pas')
        
        try:
            result = await Evaluation.raw('SELECT employe_id FROM evaluations LIMIT 1')
            print('✓ La colonne employe_id existe')
        except Exception:
            print('✗ La colonne employe_id n\'existe pas')
            
    except Exception as e:
        print(f'Erreur lors de la vérification des colonnes: {e}')
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check_columns())
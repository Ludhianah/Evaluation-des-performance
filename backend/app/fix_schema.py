import asyncio
import sys
import os
sys.path.append('/app')
from tortoise import Tortoise
from models import Evaluation

async def fix_schema():
    await Tortoise.init(
        db_url='postgres://postgres:postgres@db:5432/evaluation_db',
        modules={'models': ['models']}
    )
    
    # Check if employe column exists
    try:
        await Evaluation.raw('SELECT employe FROM evaluations LIMIT 1')
        print('La colonne employe existe déjà.')
    except Exception as e:
        if 'column "employe" does not exist' in str(e):
            print('Ajout de la colonne employe...')
            await Evaluation.raw('ALTER TABLE evaluations ADD COLUMN employe INTEGER REFERENCES employes(id)')
            print('Colonne employe ajoutée avec succès !')
        else:
            print(f'Erreur: {e}')
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(fix_schema())
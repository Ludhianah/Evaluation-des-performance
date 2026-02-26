import asyncio
import sys
import os
sys.path.append('/app')
from tortoise import Tortoise
from models import Evaluation

async def fix_column_name():
    await Tortoise.init(
        db_url='postgres://postgres:postgres@db:5432/evaluation_db',
        modules={'models': ['models']}
    )
    
    # Rename the column from employe to employe_id to match Tortoise ORM expectations
    try:
        await Evaluation.raw('ALTER TABLE evaluations RENAME COLUMN employe TO employe_id')
        print('Colonne renommée avec succès de employe à employe_id')
    except Exception as e:
        print(f'Erreur lors du renommage de la colonne: {e}')
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(fix_column_name())
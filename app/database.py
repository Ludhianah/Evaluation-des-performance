from tortoise import Tortoise
import os
import asyncio
import logging

# Récupère l'URL depuis docker-compose
DATABASE_URL = os.getenv("DATABASE_URL")

# Configuration de Tortoise ORM
async def init_db():
    max_retries = 30  # 30 secondes max d'attente
    retry_delay = 1    # 1 seconde entre chaque tentative
    
    for attempt in range(max_retries):
        try:
            await Tortoise.init(
                db_url=DATABASE_URL,
                modules={'models': ['app.models']}
            )
            await Tortoise.generate_schemas()
            logging.info("Connexion à la base de données établie avec succès")
            return
        except Exception as e:
            if attempt == max_retries - 1:
                logging.error(f"Échec de la connexion à la base de données après {max_retries} tentatives: {e}")
                raise
            logging.warning(f"Tentative {attempt + 1}/{max_retries} échouée, nouvelle tentative dans {retry_delay} secondes...")
            await asyncio.sleep(retry_delay)

# Fonction pour fermer la connexion
async def close_db():
    await Tortoise.close_connections()

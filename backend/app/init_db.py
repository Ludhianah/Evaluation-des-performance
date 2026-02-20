import asyncio
from tortoise import Tortoise

async def init():
    await Tortoise.init(
        db_url="postgres://postgres:postgres@localhost:5432/evaluation_db",  # adapte user/password si besoin
        modules={"models": ["app.models"]}  # <-- ici on pointe vers models.py
    )
    # Crée les tables si elles n'existent pas
    await Tortoise.generate_schemas()
    print("Tables créées avec succès !")
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(init())

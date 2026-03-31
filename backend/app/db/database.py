from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

client: AsyncIOMotorClient = None


async def connect_to_mongo():
    global client
    client = AsyncIOMotorClient(settings.MONGO_URI)
    print(f"Connected to MongoDB at {settings.MONGO_URI}")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


def get_database():
    return client[settings.DB_NAME]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.database import connect_to_mongo, close_mongo_connection
from app.routes import groups, expenses, balances
from app.config.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Smart Expense Splitter API",
    description="A lightweight API for splitting expenses between group members.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow all origins in development; tighten for production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
PREFIX = settings.API_PREFIX  # "/api"

app.include_router(groups.router, prefix=PREFIX)
app.include_router(expenses.router, prefix=PREFIX)
app.include_router(balances.router, prefix=PREFIX)


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "Smart Expense Splitter API is running 🚀"}

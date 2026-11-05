import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import garments_router, orders_router, measure_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("apsarafit")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("ApsaraFit Backend started successfully on %s", settings.DATABASE_URL)
    yield
    logger.info("Shutting down ApsaraFit Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Mom's Traditional Tailor Shop & AI 3D Fitting Studio (ApsaraFit)",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(garments_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(measure_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ApsaraFit AI Tailoring Engine",
        "database": settings.DATABASE_URL.split(":///")[0]
    }

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ApsaraFit - Mom's Traditional Tailor Shop & AI 3D Fitting Studio"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tailor.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    SECRET_KEY: str = os.getenv("SECRET_KEY", "apsarafit-khmer-bespoke-secret-2026")
    SMPLX_MODEL_DIR: str = os.getenv("SMPLX_MODEL_DIR", "./models/smplx")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    STORAGE_PATH: str = "./storage"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    MAX_FILE_SIZE: int = 104857600  # 100MB
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Create storage directory if it doesn't exist
os.makedirs(settings.STORAGE_PATH, exist_ok=True)

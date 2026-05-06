from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent.parent / ".env",
        env_ignore_empty=True,
        extra="ignore",
    )
    DATA_DIR: Path = Path("./data")
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    API_PREFIX: str = "/api/v1"


settings = Settings()

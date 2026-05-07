from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.storage import ensure_data_dirs


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.AUTH_SECRET_KEY:
        raise RuntimeError("AUTH_SECRET_KEY must be set in .env")
    if not settings.AUTH_PASSWORD_HASH:
        raise RuntimeError("AUTH_PASSWORD_HASH must be set in .env")
    ensure_data_dirs()
    yield


app = FastAPI(title="AppTrail", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

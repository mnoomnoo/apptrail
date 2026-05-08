import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

ALGORITHM = "HS256"


def _auth_file_path() -> Path:
    return settings.DATA_DIR / "auth.json"


def get_auth_config() -> dict:
    if settings.AUTH_PASSWORD_HASH and settings.AUTH_SECRET_KEY:
        return {
            "username": settings.AUTH_USERNAME,
            "password_hash": settings.AUTH_PASSWORD_HASH,
            "secret_key": settings.AUTH_SECRET_KEY,
        }
    path = _auth_file_path()
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def needs_setup() -> bool:
    config = get_auth_config()
    return not config.get("password_hash") or not config.get("secret_key")


def complete_setup(username: str, password_hash: str, secret_key: str) -> None:
    data = {"username": username, "password_hash": password_hash, "secret_key": secret_key}
    path = _auth_file_path()
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
    os.replace(tmp, path)


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    config = get_auth_config()
    secret = config.get("secret_key") or settings.AUTH_SECRET_KEY
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(hours=settings.AUTH_TOKEN_EXPIRE_HOURS)
    )
    return jwt.encode({"sub": subject, "exp": expire}, secret, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    config = get_auth_config()
    secret = config.get("secret_key") or settings.AUTH_SECRET_KEY
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        username: str = payload.get("sub", "")
        if not username:
            raise credentials_exc
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise credentials_exc
    return username

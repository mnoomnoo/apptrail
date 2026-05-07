import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(tags=["auth"])


class Token(BaseModel):
    access_token: str
    token_type: str


class GenerateCredentialsRequest(BaseModel):
    new_password: str | None = None
    regenerate_key: bool = False


class GenerateCredentialsResponse(BaseModel):
    password_hash: str | None = None
    secret_key: str | None = None


@router.post("/token", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends()):
    if form.username != settings.AUTH_USERNAME or not verify_password(
        form.password, settings.AUTH_PASSWORD_HASH
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    return Token(access_token=create_access_token(form.username), token_type="bearer")


@router.post("/generate-credentials", response_model=GenerateCredentialsResponse)
def generate_credentials(
    body: GenerateCredentialsRequest, _: str = Depends(get_current_user)
):
    result = GenerateCredentialsResponse()
    if body.new_password:
        result.password_hash = hash_password(body.new_password)
    if body.regenerate_key:
        result.secret_key = secrets.token_hex(32)
    return result

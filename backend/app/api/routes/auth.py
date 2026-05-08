import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.core.security import (
    complete_setup,
    create_access_token,
    get_auth_config,
    get_current_user,
    hash_password,
    needs_setup,
    verify_password,
)

router = APIRouter(tags=["auth"])


class Token(BaseModel):
    access_token: str
    token_type: str


class SetupRequest(BaseModel):
    username: str
    password: str


class GenerateCredentialsRequest(BaseModel):
    new_password: str | None = None
    regenerate_key: bool = False


class GenerateCredentialsResponse(BaseModel):
    password_hash: str | None = None
    secret_key: str | None = None


@router.get("/status")
def auth_status():
    return {"needs_setup": needs_setup()}


@router.post("/setup", status_code=201)
def setup(body: SetupRequest):
    if not needs_setup():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Already configured")
    if not body.username.strip() or not body.password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username and password are required",
        )
    complete_setup(body.username.strip(), hash_password(body.password), secrets.token_hex(32))
    return {"ok": True}


@router.post("/token", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends()):
    config = get_auth_config()
    if (
        not config
        or form.username != config["username"]
        or not verify_password(form.password, config["password_hash"])
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

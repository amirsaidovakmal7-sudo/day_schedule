from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from database.auth import bearer_scheme, get_current_user
from database.models import User
from database.user_s import (
    UserSchema,
    authenticate,
    issue_token,
    register_user,
    revoke_token,
    update_password,
    update_username,
)

auth_router = APIRouter(prefix="/auth", tags=["Auth API"])


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsernameIn(BaseModel):
    username: str = Field(min_length=3, max_length=32)


class PasswordIn(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6, max_length=128)


@auth_router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterIn):
    user = await register_user(body.username, body.password)
    if user is None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Такой логин уже занят")
    return user


@auth_router.post("/login", response_model=TokenOut)
async def login(body: LoginIn):
    user = await authenticate(body.username, body.password)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверный логин или пароль")
    token = await issue_token(user.id)
    return TokenOut(access_token=token)


@auth_router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    _: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    await revoke_token(credentials.credentials)
    return None


@auth_router.get("/me", response_model=UserSchema)
async def me(user: User = Depends(get_current_user)):
    return user


@auth_router.put("/username", response_model=UserSchema)
async def change_username(body: UsernameIn, user: User = Depends(get_current_user)):
    updated = await update_username(user, body.username)
    if updated is None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Такой логин уже занят")
    return updated


@auth_router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(body: PasswordIn, user: User = Depends(get_current_user)):
    ok = await update_password(user, body.old_password, body.new_password)
    if not ok:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Неверный текущий пароль")
    return None

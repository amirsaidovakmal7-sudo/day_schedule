import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import async_session
from database.models import AuthToken, User

password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)


def generate_token() -> str:
    return secrets.token_urlsafe(32)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> User:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Не передан токен авторизации")

    async with async_session() as session:
        token_row = await session.scalar(
            select(AuthToken).where(AuthToken.token == credentials.credentials)
        )
        if token_row is None:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Токен недействителен")

        user = await session.get(User, token_row.user_id)
        if user is None:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Пользователь не найден")

        return user

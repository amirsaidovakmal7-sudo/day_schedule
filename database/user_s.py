from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import select

from database.auth import generate_token, hash_password, verify_password
from database.engine import async_session
from database.models import AuthToken, User


class UserSchema(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}


async def register_user(username: str, password: str) -> User | None:
    async with async_session() as session:
        existing = await session.scalar(select(User).where(User.username == username))
        if existing is not None:
            return None

        user = User(username=username, password_hash=hash_password(password))
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


async def issue_token(user_id: int) -> str:
    async with async_session() as session:
        token = generate_token()
        session.add(AuthToken(token=token, user_id=user_id))
        await session.commit()
        return token


async def authenticate(username: str, password: str) -> User | None:
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.username == username))
        if user is None or not verify_password(password, user.password_hash):
            return None
        return user


async def revoke_token(token: str) -> None:
    async with async_session() as session:
        token_row = await session.scalar(select(AuthToken).where(AuthToken.token == token))
        if token_row is not None:
            await session.delete(token_row)
            await session.commit()


async def update_username(user: User, new_username: str) -> User | None:
    async with async_session() as session:
        existing = await session.scalar(select(User).where(User.username == new_username))
        if existing is not None and existing.id != user.id:
            return None

        db_user = await session.get(User, user.id)
        db_user.username = new_username
        await session.commit()
        await session.refresh(db_user)
        return db_user


async def update_password(user: User, old_password: str, new_password: str) -> bool:
    async with async_session() as session:
        db_user = await session.get(User, user.id)
        if not verify_password(old_password, db_user.password_hash):
            return False

        db_user.password_hash = hash_password(new_password)
        await session.commit()
        return True

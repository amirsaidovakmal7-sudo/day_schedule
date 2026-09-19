from datetime import date as date_type, datetime, time as time_type

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.engine import Base, engine


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    username: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    days: Mapped[list["Day"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    tokens: Mapped[list["AuthToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class AuthToken(Base):
    __tablename__ = 'auth_tokens'

    token: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="tokens")


class Day(Base):
    __tablename__ = 'days'
    __table_args__ = (UniqueConstraint('user_id', 'date', name='uq_days_user_date'),)

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)

    user: Mapped["User"] = relationship(back_populates="days")
    tasks: Mapped[list["Tasks"]] = relationship(back_populates="day", cascade="all, delete-orphan")
    notes: Mapped[list["Notes"]] = relationship(back_populates="day", cascade="all, delete-orphan")


class Tasks(Base):
    __tablename__ = 'tasks'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    day_id: Mapped[int] = mapped_column(ForeignKey('days.id', ondelete='CASCADE'), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    day: Mapped["Day"] = relationship(back_populates="tasks")


class Notes(Base):
    __tablename__ = 'notes'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    day_id: Mapped[int] = mapped_column(ForeignKey('days.id', ondelete='CASCADE'), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)

    day: Mapped["Day"] = relationship(back_populates="notes")
    note_time: Mapped["NotesTime"] = relationship(
        back_populates="note", cascade="all, delete-orphan", uselist=False
    )


class NotesTime(Base):
    __tablename__ = 'note_time'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    note_id: Mapped[int] = mapped_column(ForeignKey('notes.id', ondelete='CASCADE'), nullable=False, unique=True)
    time_for_note: Mapped[time_type] = mapped_column(Time, nullable=False)

    note: Mapped["Notes"] = relationship(back_populates="note_time")


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

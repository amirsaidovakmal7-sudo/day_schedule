from datetime import date as date_type

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.engine import async_session
from database.models import Day, Notes
from database.schemas import DayDetailOut, DaySummaryOut, ScheduleEntryOut, TaskOut

_DAY_OPTIONS = (
    selectinload(Day.tasks),
    selectinload(Day.notes).selectinload(Notes.note_time),
)


def _serialize_day(day: Day) -> DayDetailOut:
    return DayDetailOut(
        id=day.id,
        date=day.date,
        is_editable=day.date == date_type.today(),
        tasks=[TaskOut.model_validate(t) for t in day.tasks],
        notes=[
            ScheduleEntryOut(
                id=n.id,
                day_id=n.day_id,
                time=n.note_time.time_for_note,
                description=n.description,
            )
            for n in day.notes
            if n.note_time is not None
        ],
    )


async def get_or_create_current_day(user_id: int) -> DayDetailOut:
    today = date_type.today()
    async with async_session() as session:
        day = await session.scalar(
            select(Day).where(Day.user_id == user_id, Day.date == today).options(*_DAY_OPTIONS)
        )
        if day is None:
            day = Day(user_id=user_id, date=today)
            session.add(day)
            await session.commit()
            day = await session.scalar(
                select(Day).where(Day.id == day.id).options(*_DAY_OPTIONS)
            )
        return _serialize_day(day)


async def list_past_days(user_id: int) -> list[DaySummaryOut]:
    today = date_type.today()
    async with async_session() as session:
        days = await session.scalars(
            select(Day)
            .where(Day.user_id == user_id, Day.date < today)
            .options(selectinload(Day.tasks), selectinload(Day.notes))
            .order_by(Day.date.desc())
        )
        return [
            DaySummaryOut(
                id=d.id,
                date=d.date,
                tasks_count=len(d.tasks),
                notes_count=len(d.notes),
            )
            for d in days
        ]


async def get_day_detail(user_id: int, day_id: int) -> DayDetailOut | None:
    async with async_session() as session:
        day = await session.scalar(
            select(Day).where(Day.id == day_id, Day.user_id == user_id).options(*_DAY_OPTIONS)
        )
        if day is None:
            return None
        return _serialize_day(day)

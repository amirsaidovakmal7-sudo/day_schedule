from datetime import date as date_type, time as time_type

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.engine import async_session
from database.models import Day, NotesTime, Notes
from database.schemas import ScheduleEntryOut


def _to_schema(note: Notes) -> ScheduleEntryOut:
    return ScheduleEntryOut(
        id=note.id,
        day_id=note.day_id,
        time=note.note_time.time_for_note,
        description=note.description,
    )


async def create_note(user_id: int, time_for_note: time_type, description: str) -> ScheduleEntryOut:
    today = date_type.today()
    async with async_session() as session:
        day = await session.scalar(select(Day).where(Day.user_id == user_id, Day.date == today))
        if day is None:
            day = Day(user_id=user_id, date=today)
            session.add(day)
            await session.flush()

        note = Notes(day_id=day.id, description=description)
        session.add(note)
        await session.flush()

        session.add(NotesTime(note_id=note.id, time_for_note=time_for_note))
        await session.commit()

        note = await session.scalar(
            select(Notes).where(Notes.id == note.id).options(selectinload(Notes.note_time))
        )
        return _to_schema(note)


async def _load_owned_note(session, user_id: int, note_id: int) -> Notes | None:
    note = await session.scalar(
        select(Notes)
        .where(Notes.id == note_id)
        .options(selectinload(Notes.day), selectinload(Notes.note_time))
    )
    if note is None or note.day.user_id != user_id:
        return None
    return note


async def update_note(
    user_id: int, note_id: int, time_for_note: time_type | None, description: str | None
) -> tuple[ScheduleEntryOut | None, str | None]:
    async with async_session() as session:
        note = await _load_owned_note(session, user_id, note_id)
        if note is None:
            return None, "not_found"
        if note.day.date != date_type.today():
            return None, "not_editable"

        if description is not None:
            note.description = description
        if time_for_note is not None:
            note.note_time.time_for_note = time_for_note

        await session.commit()
        await session.refresh(note)
        await session.refresh(note.note_time)
        return _to_schema(note), None


async def delete_note(user_id: int, note_id: int) -> str | None:
    async with async_session() as session:
        note = await _load_owned_note(session, user_id, note_id)
        if note is None:
            return "not_found"
        if note.day.date != date_type.today():
            return "not_editable"

        await session.delete(note)
        await session.commit()
        return None

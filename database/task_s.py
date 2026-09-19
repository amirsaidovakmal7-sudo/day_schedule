from datetime import date as date_type

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.engine import async_session
from database.models import Day, Tasks
from database.schemas import TaskOut

NOT_EDITABLE_MESSAGE = "Нельзя изменять задачи прошедшего дня"


async def create_task(user_id: int, title: str) -> TaskOut:
    today = date_type.today()
    async with async_session() as session:
        day = await session.scalar(select(Day).where(Day.user_id == user_id, Day.date == today))
        if day is None:
            day = Day(user_id=user_id, date=today)
            session.add(day)
            await session.flush()

        task = Tasks(day_id=day.id, title=title, completed=False)
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return TaskOut.model_validate(task)


async def _load_owned_task(session, user_id: int, task_id: int) -> Tasks | None:
    task = await session.scalar(
        select(Tasks).where(Tasks.id == task_id).options(selectinload(Tasks.day))
    )
    if task is None or task.day.user_id != user_id:
        return None
    return task


async def update_task(
    user_id: int, task_id: int, title: str | None, completed: bool | None
) -> tuple[TaskOut | None, str | None]:
    async with async_session() as session:
        task = await _load_owned_task(session, user_id, task_id)
        if task is None:
            return None, "not_found"
        if task.day.date != date_type.today():
            return None, "not_editable"

        if title is not None:
            task.title = title
        if completed is not None:
            task.completed = completed

        await session.commit()
        await session.refresh(task)
        return TaskOut.model_validate(task), None


async def delete_task(user_id: int, task_id: int) -> str | None:
    async with async_session() as session:
        task = await _load_owned_task(session, user_id, task_id)
        if task is None:
            return "not_found"
        if task.day.date != date_type.today():
            return "not_editable"

        await session.delete(task)
        await session.commit()
        return None

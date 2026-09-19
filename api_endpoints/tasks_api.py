from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from database.auth import get_current_user
from database.models import User
from database.schemas import TaskOut
from database.task_s import create_task, delete_task, update_task

task_router = APIRouter(prefix="/tasks", tags=["Tasks API"])


class TaskCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)


class TaskUpdateIn(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    completed: bool | None = None


def _raise_for_error(error: str | None) -> None:
    if error == "not_found":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Задача не найдена")
    if error == "not_editable":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Нельзя изменять задачи прошедшего дня")


@task_router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task_api(body: TaskCreateIn, user: User = Depends(get_current_user)):
    return await create_task(user.id, body.title)


@task_router.patch("/{task_id}", response_model=TaskOut)
async def update_task_api(task_id: int, body: TaskUpdateIn, user: User = Depends(get_current_user)):
    task, error = await update_task(user.id, task_id, body.title, body.completed)
    _raise_for_error(error)
    return task


@task_router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_api(task_id: int, user: User = Depends(get_current_user)):
    error = await delete_task(user.id, task_id)
    _raise_for_error(error)
    return None

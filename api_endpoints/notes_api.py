from datetime import time as time_type

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from database.auth import get_current_user
from database.models import User
from database.note_s import create_note, delete_note, update_note
from database.schemas import ScheduleEntryOut

notes_router = APIRouter(prefix="/notes", tags=["Notes API"])


class NoteCreateIn(BaseModel):
    time: time_type
    description: str = Field(min_length=1, max_length=500)


class NoteUpdateIn(BaseModel):
    time: time_type | None = None
    description: str | None = Field(default=None, min_length=1, max_length=500)


def _raise_for_error(error: str | None) -> None:
    if error == "not_found":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Запись не найдена")
    if error == "not_editable":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Нельзя изменять записи прошедшего дня")


@notes_router.post("", response_model=ScheduleEntryOut, status_code=status.HTTP_201_CREATED)
async def create_note_api(body: NoteCreateIn, user: User = Depends(get_current_user)):
    return await create_note(user.id, body.time, body.description)


@notes_router.put("/{note_id}", response_model=ScheduleEntryOut)
async def update_note_api(note_id: int, body: NoteUpdateIn, user: User = Depends(get_current_user)):
    note, error = await update_note(user.id, note_id, body.time, body.description)
    _raise_for_error(error)
    return note


@notes_router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note_api(note_id: int, user: User = Depends(get_current_user)):
    error = await delete_note(user.id, note_id)
    _raise_for_error(error)
    return None

from datetime import date as date_type, time as time_type

from pydantic import BaseModel


class TaskOut(BaseModel):
    id: int
    day_id: int
    title: str
    completed: bool

    model_config = {"from_attributes": True}


class ScheduleEntryOut(BaseModel):
    id: int
    day_id: int
    time: time_type
    description: str

    model_config = {"from_attributes": True}


class DayDetailOut(BaseModel):
    id: int
    date: date_type
    is_editable: bool
    tasks: list[TaskOut]
    notes: list[ScheduleEntryOut]


class DaySummaryOut(BaseModel):
    id: int
    date: date_type
    tasks_count: int
    notes_count: int

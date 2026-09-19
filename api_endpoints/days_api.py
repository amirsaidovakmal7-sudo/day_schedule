from fastapi import APIRouter, Depends, HTTPException, status

from database.auth import get_current_user
from database.days_task_s import get_day_detail, get_or_create_current_day, list_past_days
from database.models import User
from database.schemas import DayDetailOut, DaySummaryOut

days_router = APIRouter(prefix="/days", tags=["Days API"])


@days_router.get("/current", response_model=DayDetailOut)
async def get_current_day(user: User = Depends(get_current_user)):
    return await get_or_create_current_day(user.id)


@days_router.get("", response_model=list[DaySummaryOut])
async def get_archived_days(user: User = Depends(get_current_user)):
    return await list_past_days(user.id)


@days_router.get("/{day_id}", response_model=DayDetailOut)
async def get_day(day_id: int, user: User = Depends(get_current_user)):
    day = await get_day_detail(user.id, day_id)
    if day is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "День не найден")
    return day

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api_endpoints.auth_api import auth_router
from api_endpoints.days_api import days_router
from api_endpoints.notes_api import notes_router
from api_endpoints.tasks_api import task_router
from database.models import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print('Backend is ready')
    yield


app = FastAPI(title="TODO app", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(days_router)
app.include_router(task_router)
app.include_router(notes_router)

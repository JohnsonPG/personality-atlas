from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routers import game, presets, report


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="人格图鉴 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:10086",
        "http://localhost:10087",
        "http://127.0.0.1:10086",
        "http://127.0.0.1:10087",
        "http://192.168.1.143:10086",
        "http://192.168.1.143:10087",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(game.router)
app.include_router(presets.router)
app.include_router(report.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}

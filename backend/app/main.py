from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import re

from app.database import init_db
from app.routers import game, presets, report


def _parse_allowed_origins():
    raw = os.getenv("ALLOWED_ORIGINS", "").strip()
    origins = []
    if raw:
        for item in re.split(r"[,\s]+", raw):
            item = item.strip()
            if item:
                origins.append(item)
    # 默认开发环境常用精确端口（本地联调）
    defaults = [
        "http://localhost:10086",
        "http://127.0.0.1:10086",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]
    for d in defaults:
        if d not in origins:
            origins.append(d)
    return origins


def _parse_allowed_origin_regex():
    # 支持 ALLOWED_ORIGIN_REGEX 覆盖；默认只允许本地回环（localhost/127.0.0.1/0.0.0.0 任意端口）
    override = os.getenv("ALLOWED_ORIGIN_REGEX", "").strip()
    if override:
        return override
    # 安全：只匹配本地回环地址，不再允许公网任意域名跨域携带凭证
    return r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="人格图鉴 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_allowed_origins(),
    allow_origin_regex=_parse_allowed_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)


app.include_router(game.router)
app.include_router(presets.router)
app.include_router(report.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}

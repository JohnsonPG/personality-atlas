from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Presets(Base):
    __tablename__ = "presets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(50))
    primary_tag: Mapped[str] = mapped_column(String(20))
    secondary_tag: Mapped[str] = mapped_column(String(10))
    knowledge_json: Mapped[dict] = mapped_column(JSON, default={})
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class GameSessions(Base):
    __tablename__ = "game_sessions"

    session_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    preset_id: Mapped[int] = mapped_column(ForeignKey("presets.id"))
    current_stage: Mapped[str] = mapped_column(String(20), default="meet")
    current_score: Mapped[int] = mapped_column(Integer, default=100)
    status: Mapped[str] = mapped_column(String(20), default="playing")
    stage_history: Mapped[dict] = mapped_column(JSON, default={})
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class GameRecords(Base):
    __tablename__ = "game_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("game_sessions.session_id"), index=True)
    question_index: Mapped[int] = mapped_column(Integer)
    question_text: Mapped[str] = mapped_column(Text)
    options_json: Mapped[dict] = mapped_column(JSON)
    user_choice: Mapped[int] = mapped_column(Integer)
    is_correct: Mapped[bool] = mapped_column(Boolean)
    score_change: Mapped[int] = mapped_column(Integer)
    ai_feedback: Mapped[str] = mapped_column(Text)
    stage: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StatsCache(Base):
    __tablename__ = "stats_cache"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    preset_id: Mapped[int] = mapped_column(Integer, index=True)
    stage: Mapped[str] = mapped_column(String(20), index=True)
    question_index: Mapped[int] = mapped_column(Integer, index=True)
    total_answers: Mapped[int] = mapped_column(Integer, default=0)
    correct_count: Mapped[int] = mapped_column(Integer, default=0)
    choice_distribution: Mapped[dict] = mapped_column(JSON, default={})
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

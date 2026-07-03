from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Presets, GameSessions, GameRecords


def get_preset_by_tags(db: Session, category: str, primary: str, secondary: str):
    return db.query(Presets).filter(
        Presets.category == category,
        Presets.primary_tag == primary,
        Presets.secondary_tag == secondary,
    ).first()


def create_session(db: Session, preset_id: int) -> GameSessions:
    session_id = str(uuid.uuid4())
    session = GameSessions(
        session_id=session_id,
        preset_id=preset_id,
        current_stage="meet",
        current_score=100,
        status="playing",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session(db: Session, session_id: str) -> GameSessions | None:
    return db.query(GameSessions).filter(GameSessions.session_id == session_id).first()


def update_session(db: Session, session_id: str, **kwargs) -> GameSessions | None:
    session = get_session(db, session_id)
    if session is None:
        return None
    for key, value in kwargs.items():
        setattr(session, key, value)
    db.commit()
    db.refresh(session)
    return session


def create_record(
    db: Session,
    session_id: str,
    question_index: int,
    question_text: str,
    options_json: dict,
    user_choice: int,
    is_correct: bool,
    score_change: int,
    ai_feedback: str,
    stage: str,
) -> GameRecords:
    record = GameRecords(
        session_id=session_id,
        question_index=question_index,
        question_text=question_text,
        options_json=options_json,
        user_choice=user_choice,
        is_correct=is_correct,
        score_change=score_change,
        ai_feedback=ai_feedback,
        stage=stage,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_records_by_session(db: Session, session_id: str) -> list[GameRecords]:
    return db.query(GameRecords).filter(GameRecords.session_id == session_id).all()

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas
from app.models import Presets
from app.data.questions_seed import get_questions

router = APIRouter(prefix="/api/game", tags=["game"])

STAGE_ORDER = ["meet", "love", "conflict", "ending"]
SENSITIVE_FIELDS = {
    "correct_index",
    "is_redline",
    "score_change",
    "feedback_title",
    "feedback_knowledge_label",
    "feedback_knowledge_text",
    "feedback_advice",
}


def _filter_question(q: dict) -> dict:
    return {k: v for k, v in q.items() if k not in SENSITIVE_FIELDS}


@router.post("/start", response_model=schemas.GameStartResponse)
def start_game(body: schemas.GameStartRequest, db: Session = Depends(get_db)):
    preset = crud.get_preset_by_tags(db, body.preset_category, body.primary, body.secondary)
    if preset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preset not found")
    session = crud.create_session(db, preset.id)
    questions = get_questions(
        preset_category=preset.category,
        primary_tag=preset.primary_tag,
        secondary_tag=preset.secondary_tag,
        stage=session.current_stage,
    )
    filtered = [_filter_question(q) for q in questions]
    return schemas.GameStartResponse(
        session_id=session.session_id,
        stage=session.current_stage,
        questions=filtered,
        preset_info=schemas.PresetInfo(
            id=preset.id,
            category=preset.category,
            primary_tag=preset.primary_tag,
            secondary_tag=preset.secondary_tag,
        ),
    )


@router.post("/submit", response_model=schemas.GameSubmitResponse)
def submit_answer(body: schemas.GameSubmitRequest, db: Session = Depends(get_db)):
    session = crud.get_session(db, body.session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != "playing":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="session not playing")
    preset = db.query(Presets).filter(Presets.id == session.preset_id).first()
    questions = get_questions(
        preset_category=preset.category,
        primary_tag=preset.primary_tag,
        secondary_tag=preset.secondary_tag,
        stage=session.current_stage,
    )
    if body.question_index < 0 or body.question_index >= len(questions):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid question_index")
    q = questions[body.question_index]
    is_correct = (body.user_choice == q["correct_index"])
    if is_correct:
        raw_change = q["score_change"]
        new_score = min(session.current_score + raw_change, 100)
    else:
        raw_change = -q["score_change"]
        new_score = max(session.current_score + raw_change, 0)
    game_over = False
    is_redline_triggered = False
    if q["is_redline"] and not is_correct:
        is_redline_triggered = True
        game_over = True
        new_score = 0
    if new_score <= 0 and not game_over:
        game_over = True
    stage_finished = (body.question_index == len(questions) - 1)
    crud.create_record(
        db=db,
        session_id=session.session_id,
        question_index=body.question_index,
        question_text=q["dialogue_text"],
        options_json={"options": q["options"]},
        user_choice=body.user_choice,
        is_correct=is_correct,
        score_change=raw_change,
        ai_feedback=q["feedback_knowledge_text"],
        stage=session.current_stage,
    )
    update_kwargs = {"current_score": new_score}
    if game_over:
        update_kwargs["status"] = "failed"
        update_kwargs["finished_at"] = datetime.utcnow()
    crud.update_session(db, session.session_id, **update_kwargs)
    next_stage_val = None
    if stage_finished and not game_over:
        current_idx = STAGE_ORDER.index(session.current_stage)
        if current_idx < len(STAGE_ORDER) - 1:
            next_stage_val = STAGE_ORDER[current_idx + 1]
    warning_signals = []
    knowledge_text = q["feedback_knowledge_text"]
    for keyword in ["暗贬", "煤气灯", "三角", "冷战", "间歇性", "打压", "贬低", "边界"]:
        if keyword in knowledge_text:
            warning_signals.append(keyword)
    if not warning_signals:
        warning_signals.append("觉察自身情绪波动")
    coping_strategies = [q["feedback_advice"]] if q["feedback_advice"] else ["暂停并反思当前互动"]
    return schemas.GameSubmitResponse(
        is_correct=is_correct,
        score_change=raw_change,
        new_score=new_score,
        feedback_title=q["feedback_title"],
        feedback_knowledge_label=q["feedback_knowledge_label"],
        feedback_knowledge_text=q["feedback_knowledge_text"],
        feedback_advice=q["feedback_advice"],
        game_over=game_over,
        is_redline=is_redline_triggered,
        stage_finished=stage_finished,
        triggered_game_over=game_over,
        triggered_stage_end=stage_finished,
        next_stage=next_stage_val,
        question_explanation=schemas.QuestionExplanation(
            explanation=q["feedback_knowledge_text"][:80] if len(q["feedback_knowledge_text"]) > 80 else q["feedback_knowledge_text"],
            knowledge_point=q["feedback_knowledge_label"],
            psychological_impact=q["feedback_knowledge_text"],
            boundary_suggestion=q["feedback_advice"],
            warning_signals=warning_signals,
            coping_strategies=coping_strategies,
        ),
    )


@router.post("/next_stage", response_model=schemas.NextStageResponse)
def next_stage(body: schemas.NextStageRequest, db: Session = Depends(get_db)):
    session = crud.get_session(db, body.session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    current_stage = session.current_stage
    if current_stage not in STAGE_ORDER or current_stage == STAGE_ORDER[-1]:
        return schemas.NextStageResponse(
            next_stage=None,
            questions=[],
            all_finished=True,
        )
    current_idx = STAGE_ORDER.index(current_stage)
    next_stage_name = STAGE_ORDER[current_idx + 1]
    crud.update_session(db, session.session_id, current_stage=next_stage_name)
    preset = db.query(Presets).filter(Presets.id == session.preset_id).first()
    questions = get_questions(
        preset_category=preset.category,
        primary_tag=preset.primary_tag,
        secondary_tag=preset.secondary_tag,
        stage=next_stage_name,
    )
    filtered = [_filter_question(q) for q in questions]
    return schemas.NextStageResponse(
        next_stage=next_stage_name,
        questions=filtered,
        all_finished=False,
    )


@router.post("/end", response_model=schemas.GameEndResponse)
def end_game(body: schemas.GameEndRequest, db: Session = Depends(get_db)):
    crud.update_session(
        db,
        body.session_id,
        status=body.result,
        finished_at=datetime.utcnow(),
    )
    return schemas.GameEndResponse(ok=True)

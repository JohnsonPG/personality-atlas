from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class GameStartRequest(BaseModel):
    preset_category: str
    primary: str
    secondary: str


class PresetInfo(BaseModel):
    id: int
    category: str
    primary_tag: str
    secondary_tag: str


class QuestionOption(BaseModel):
    id: str
    stage: str
    scene: str
    scene_image: str
    dialogue_speaker: str
    dialogue_text: str
    options: list[str]


class GameStartResponse(BaseModel):
    session_id: str
    stage: str
    questions: list[dict]
    preset_info: PresetInfo


class GameSubmitRequest(BaseModel):
    session_id: str
    question_index: int
    user_choice: int


class QuestionExplanation(BaseModel):
    explanation: str
    knowledge_point: str
    psychological_impact: str
    boundary_suggestion: str
    warning_signals: list[str]
    coping_strategies: list[str]


class GameSubmitResponse(BaseModel):
    is_correct: bool
    score_change: int
    new_score: int
    feedback_title: str
    feedback_knowledge_label: str
    feedback_knowledge_text: str
    feedback_advice: str
    game_over: bool
    is_redline: bool
    stage_finished: bool
    triggered_game_over: bool
    triggered_stage_end: bool
    next_stage: Optional[str] = None
    question_explanation: QuestionExplanation


class NextStageRequest(BaseModel):
    session_id: str


class NextStageResponse(BaseModel):
    next_stage: Optional[str]
    questions: list[dict]
    all_finished: bool


class GameEndRequest(BaseModel):
    session_id: str
    result: str
    final_score: int
    answers: list[dict] = []


class GameEndResponse(BaseModel):
    ok: bool = True


class PresetOut(BaseModel):
    id: int
    category: str
    primary_tag: str
    secondary_tag: str


class StageBreakdownItem(BaseModel):
    stage: str
    stage_name_cn: str
    score_change: int
    correct_count: int
    total_count: int


class RadarData(BaseModel):
    empathy: int
    boundary: int
    communication: int
    self_awareness: int
    risk_detection: int


class ReportResponse(BaseModel):
    session_id: str
    final_score: int
    accuracy: int
    stage_count: int
    stage_breakdown: list[StageBreakdownItem]
    radar_data: RadarData
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    advice: str
    key_learnings: list[str]


class ParallelStatsResponse(BaseModel):
    session_id: str
    top_percentile: int
    total_players: int
    higher_than_players: int
    radar_data: RadarData
    average_scores: list[dict]

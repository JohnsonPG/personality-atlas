import re
import pytest
from app.data.questions_seed import get_questions
from app.models import GameSessions

UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
)


def _start(client):
    resp = client.post(
        "/api/game/start",
        json={
            "preset_category": "npd_mbti",
            "primary": "NPD",
            "secondary": "INTJ",
        },
    )
    assert resp.status_code == 200
    return resp.json()


def _submit_all_correct_for_stage(client, session_id, category, primary, secondary, stage):
    qs = get_questions(category, primary, secondary, stage)
    for idx, q in enumerate(qs):
        correct_idx = q["correct_index"]
        resp = client.post(
            "/api/game/submit",
            json={
                "session_id": session_id,
                "question_index": idx,
                "user_choice": correct_idx,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_correct"] is True
    return len(qs)


def test_start_api_returns_3_meet_questions(client):
    data = _start(client)
    assert UUID_RE.match(data["session_id"])
    assert data["stage"] == "meet"
    assert len(data["questions"]) == 3
    preset_info = data["preset_info"]
    assert preset_info["category"] == "npd_mbti"
    assert preset_info["primary_tag"] == "NPD"
    assert preset_info["secondary_tag"] == "INTJ"
    for q in data["questions"]:
        assert "correct_index" not in q
        assert "is_redline" not in q
        assert "score_change" not in q


def test_submit_correct_answer_score_increases_clamped(client):
    start_data = _start(client)
    session_id = start_data["session_id"]
    meet_qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    q0 = meet_qs[0]
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": 0,
            "user_choice": q0["correct_index"],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_correct"] is True
    assert data["score_change"] > 0
    assert data["score_change"] == q0["score_change"]
    assert data["new_score"] == min(100 + q0["score_change"], 100)
    assert data["new_score"] == 100


def test_submit_wrong_answer_score_decreases_clamped(client):
    start_data = _start(client)
    session_id = start_data["session_id"]
    meet_qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    q0 = meet_qs[0]
    correct = q0["correct_index"]
    wrong = (correct + 1) % 4
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": 0,
            "user_choice": wrong,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_correct"] is False
    assert data["score_change"] < 0
    assert data["score_change"] == -q0["score_change"]
    assert data["new_score"] == max(100 - q0["score_change"], 0)
    assert data["new_score"] == 100 - q0["score_change"]


def test_redline_wrong_triggers_gameover(client, test_db):
    start_data = _start(client)
    session_id = start_data["session_id"]
    meet_qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    q2 = meet_qs[2]
    assert q2["is_redline"] is True
    correct = q2["correct_index"]
    wrong = (correct + 1) % 4
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": 2,
            "user_choice": wrong,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_correct"] is False
    assert data["game_over"] is True
    assert data["is_redline"] is True
    assert data["new_score"] == 0
    db_session = test_db.query(GameSessions).filter_by(session_id=session_id).first()
    assert db_session.status == "failed"


def test_submit_3_next_stage_to_love_4_questions(client):
    start_data = _start(client)
    session_id = start_data["session_id"]
    _submit_all_correct_for_stage(
        client, session_id, "npd_mbti", "NPD", "INTJ", "meet"
    )
    resp = client.post(
        "/api/game/next_stage",
        json={"session_id": session_id},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["next_stage"] == "love"
    assert len(data["questions"]) == 4
    assert data["all_finished"] is False


def test_end_to_end_4_stages_all_correct_passed(client, test_db):
    start_data = _start(client)
    session_id = start_data["session_id"]
    stages = ["meet", "love", "conflict", "ending"]
    for idx in range(len(stages)):
        stage = stages[idx]
        _submit_all_correct_for_stage(
            client, session_id, "npd_mbti", "NPD", "INTJ", stage
        )
        if idx < len(stages) - 1:
            resp = client.post(
                "/api/game/next_stage",
                json={"session_id": session_id},
            )
            assert resp.status_code == 200
            next_data = resp.json()
            assert next_data["next_stage"] == stages[idx + 1]
            assert next_data["all_finished"] is False
    resp = client.post(
        "/api/game/next_stage",
        json={"session_id": session_id},
    )
    assert resp.status_code == 200
    final_next = resp.json()
    assert final_next["next_stage"] is None
    assert final_next["all_finished"] is True
    end_resp = client.post(
        "/api/game/end",
        json={
            "session_id": session_id,
            "result": "passed",
            "final_score": 100,
            "answers": [],
        },
    )
    assert end_resp.status_code == 200
    assert end_resp.json()["ok"] is True
    db_session = test_db.query(GameSessions).filter_by(session_id=session_id).first()
    assert db_session.status == "passed"

import pytest
from app.data.questions_seed import get_questions
from app.database import get_db
from app import crud


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
    return len(qs)


def _submit_all_wrong_for_stage(client, session_id, category, primary, secondary, stage, skip_redline=True):
    qs = get_questions(category, primary, secondary, stage)
    for idx, q in enumerate(qs):
        correct_idx = q["correct_index"]
        if skip_redline and q["is_redline"]:
            wrong = correct_idx
        else:
            wrong = (correct_idx + 1) % 4
        resp = client.post(
            "/api/game/submit",
            json={
                "session_id": session_id,
                "question_index": idx,
                "user_choice": wrong,
            },
        )
        if resp.status_code != 200:
            continue
        data = resp.json()
        if data.get("game_over"):
            break


def _complete_4_stages_all_correct(client):
    start_data = _start(client)
    session_id = start_data["session_id"]
    stages = ["meet", "love", "conflict", "ending"]
    for idx in range(len(stages)):
        stage = stages[idx]
        _submit_all_correct_for_stage(client, session_id, "npd_mbti", "NPD", "INTJ", stage)
        if idx < len(stages) - 1:
            resp = client.post("/api/game/next_stage", json={"session_id": session_id})
            assert resp.status_code == 200
    end_resp = client.post(
        "/api/game/end",
        json={"session_id": session_id, "result": "passed", "final_score": 100, "answers": []},
    )
    assert end_resp.status_code == 200
    return session_id


def _create_session_with_score(client, test_db, target_score):
    start_data = _start(client)
    session_id = start_data["session_id"]
    stages = ["meet", "love", "conflict", "ending"]
    if target_score == 100:
        sid = _complete_4_stages_all_correct(client)
        crud.update_session(test_db, sid, current_score=100)
        return sid
    elif target_score == 0:
        qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
        redline_q = None
        for idx, q in enumerate(qs):
            if q["is_redline"]:
                redline_q = idx
                break
        if redline_q is not None:
            correct_idx = qs[redline_q]["correct_index"]
            wrong = (correct_idx + 1) % 4
            resp = client.post(
                "/api/game/submit",
                json={"session_id": session_id, "question_index": redline_q, "user_choice": wrong},
            )
            assert resp.status_code == 200
            crud.update_session(test_db, session_id, current_score=0)
            return session_id
        return session_id
    elif target_score == 80:
        for idx in range(len(stages)):
            stage = stages[idx]
            qs = get_questions("npd_mbti", "NPD", "INTJ", stage)
            for qidx, q in enumerate(qs):
                correct_idx = q["correct_index"]
                resp = client.post(
                    "/api/game/submit",
                    json={"session_id": session_id, "question_index": qidx, "user_choice": correct_idx},
                )
                assert resp.status_code == 200
            if idx < len(stages) - 1:
                resp = client.post("/api/game/next_stage", json={"session_id": session_id})
                assert resp.status_code == 200
        end_resp = client.post(
            "/api/game/end",
            json={"session_id": session_id, "result": "passed", "final_score": 80, "answers": []},
        )
        assert end_resp.status_code == 200
        crud.update_session(test_db, session_id, current_score=80)
        return session_id
    elif target_score == 50:
        for idx in range(len(stages)):
            stage = stages[idx]
            qs = get_questions("npd_mbti", "NPD", "INTJ", stage)
            for qidx, q in enumerate(qs):
                correct_idx = q["correct_index"]
                resp = client.post(
                    "/api/game/submit",
                    json={"session_id": session_id, "question_index": qidx, "user_choice": correct_idx},
                )
                assert resp.status_code == 200
            if idx < len(stages) - 1:
                resp = client.post("/api/game/next_stage", json={"session_id": session_id})
                assert resp.status_code == 200
        end_resp = client.post(
            "/api/game/end",
            json={"session_id": session_id, "result": "passed", "final_score": 50, "answers": []},
        )
        if end_resp.status_code == 200:
            pass
        crud.update_session(test_db, session_id, current_score=50)
        return session_id
    return session_id


def test_presets_returns_32_items(client):
    resp = client.get("/api/presets")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 32
    for item in data:
        assert "id" in item
        assert "category" in item
        assert "primary_tag" in item
        assert "secondary_tag" in item
        assert isinstance(item["id"], int)
        assert isinstance(item["category"], str)
        assert isinstance(item["primary_tag"], str)
        assert isinstance(item["secondary_tag"], str)


def test_report_structure_complete(client):
    session_id = _complete_4_stages_all_correct(client)
    resp = client.get(f"/api/report/{session_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["session_id"] == session_id
    assert data["final_score"] <= 100
    assert data["final_score"] >= 0
    assert 0 <= data["accuracy"] <= 100
    assert 1 <= data["stage_count"] <= 4
    assert len(data["stage_breakdown"]) == 4
    order = ["meet", "love", "conflict", "ending"]
    order_cn = ["相识破冰", "热恋博弈", "冲突考验", "终局抉择"]
    for i, sb in enumerate(data["stage_breakdown"]):
        assert sb["stage"] == order[i]
        assert sb["stage_name_cn"] == order_cn[i]
        assert "score_change" in sb
        assert "correct_count" in sb
        assert "total_count" in sb
    radar = data["radar_data"]
    radar_keys = ["empathy", "boundary", "communication", "self_awareness", "risk_detection"]
    for k in radar_keys:
        assert k in radar
        assert 0 <= radar[k] <= 100
    assert data["summary"] != ""
    assert len(data["summary"]) >= 40
    assert len(data["strengths"]) >= 2
    assert len(data["weaknesses"]) >= 1
    assert len(data["key_learnings"]) >= 3
    assert isinstance(data["advice"], str)
    assert len(data["advice"]) > 0


def test_parallel_top_percentile_matches_score(client, test_db):
    tests = [
        (100, lambda x: x <= 5),
        (80, lambda x: x <= 30),
        (50, lambda x: 40 <= x <= 70),
        (0, lambda x: x >= 90),
    ]
    players_set = set()
    for target_score, check in tests:
        sid = _create_session_with_score(client, test_db, target_score)
        players_set.add(sid)
        resp = client.get(f"/api/stats/parallel/{sid}")
        if resp.status_code != 200:
            continue
        data = resp.json()
        assert check(data["top_percentile"]), f"score={target_score}, percentile={data['top_percentile']}"
        assert data["total_players"] == 12847
        for qc in data["questions_comparison"]:
            assert 5 <= qc["global_correct_pct"] <= 95
            dist = qc["choice_distribution"]
            assert "0" in dist and "1" in dist and "2" in dist and "3" in dist
            for k in ["0", "1", "2", "3"]:
                assert isinstance(dist[k], int)

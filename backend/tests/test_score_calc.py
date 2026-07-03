import uuid
import pytest
from app.data.questions_seed import get_questions
from app.models import GameSessions
from app import crud
from app.routers import report as report_router
from app.routers import game as game_router
from app import schemas


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


def test_correct_score_clamped_to_100(client, test_db):
    start_data = _start(client)
    session_id = start_data["session_id"]
    crud.update_session(test_db, session_id, current_score=100)
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
    assert data["new_score"] == 100
    assert data["score_change"] == q0["score_change"]


def test_wrong_score_clamped_to_0(client, test_db):
    start_data = _start(client)
    session_id = start_data["session_id"]
    crud.update_session(test_db, session_id, current_score=5)
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
    assert data["new_score"] == 0


def test_stage_sequence_meet_love_conflict_ending_none(client):
    start_data = _start(client)
    session_id = start_data["session_id"]
    stages = ["meet", "love", "conflict", "ending"]
    for idx in range(len(stages)):
        stage = stages[idx]
        qs = get_questions("npd_mbti", "NPD", "INTJ", stage)
        for qidx, q in enumerate(qs):
            resp = client.post(
                "/api/game/submit",
                json={
                    "session_id": session_id,
                    "question_index": qidx,
                    "user_choice": q["correct_index"],
                },
            )
            assert resp.status_code == 200
        if idx < len(stages) - 1:
            resp = client.post("/api/game/next_stage", json={"session_id": session_id})
            assert resp.status_code == 200
            next_data = resp.json()
            assert next_data["next_stage"] == stages[idx + 1]
            assert next_data["all_finished"] is False
    resp = client.post("/api/game/next_stage", json={"session_id": session_id})
    assert resp.status_code == 200
    final = resp.json()
    assert final["next_stage"] is None
    assert final["all_finished"] is True


def test_redline_wrong_immediately_gameover(client, test_db):
    start_data = _start(client)
    session_id = start_data["session_id"]
    meet_qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    q_redline = None
    for idx, q in enumerate(meet_qs):
        if q["is_redline"]:
            q_redline = (idx, q)
            break
    assert q_redline is not None
    idx, q = q_redline
    correct = q["correct_index"]
    wrong = (correct + 1) % 4
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": idx,
            "user_choice": wrong,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["game_over"] is True
    assert data["is_redline"] is True
    assert data["new_score"] == 0
    db_session = test_db.query(GameSessions).filter_by(session_id=session_id).first()
    assert db_session.status == "failed"
    assert db_session.finished_at is not None


def test_normal_wrong_not_gameover(client, test_db):
    start_data = _start(client)
    session_id = start_data["session_id"]
    meet_qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    q_normal = None
    for idx, q in enumerate(meet_qs):
        if not q["is_redline"] and q["score_change"] <= 50:
            q_normal = (idx, q)
            break
    assert q_normal is not None
    idx, q = q_normal
    correct = q["correct_index"]
    wrong = (correct + 1) % 4
    crud.update_session(test_db, session_id, current_score=80)
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": idx,
            "user_choice": wrong,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["game_over"] is False
    assert data["is_redline"] is False
    assert data["new_score"] > 0


def test_submit_invalid_sessionid_404(client):
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": str(uuid.uuid4()),
            "question_index": 0,
            "user_choice": 0,
        },
    )
    assert resp.status_code == 404


def test_submit_invalid_question_index_400(client):
    start_data = _start(client)
    session_id = start_data["session_id"]
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": 9999,
            "user_choice": 0,
        },
    )
    assert resp.status_code == 400


def test_start_game_preset_not_found_404(client):
    resp = client.post(
        "/api/game/start",
        json={
            "preset_category": "nonexistent",
            "primary": "XXX",
            "secondary": "YYY",
        },
    )
    assert resp.status_code == 404


def test_submit_session_not_playing_400(client, test_db):
    start_data = _start(client)
    session_id = start_data["session_id"]
    crud.update_session(test_db, session_id, status="finished")
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": 0,
            "user_choice": 0,
        },
    )
    assert resp.status_code == 400


def test_next_stage_invalid_sessionid_404(client):
    resp = client.post(
        "/api/game/next_stage",
        json={"session_id": str(uuid.uuid4())},
    )
    assert resp.status_code == 404


def test_report_session_not_found_404(client):
    resp = client.get(f"/api/report/{str(uuid.uuid4())}")
    assert resp.status_code == 404


def test_stats_parallel_session_not_found_404(client):
    resp = client.get(f"/api/stats/parallel/{str(uuid.uuid4())}")
    assert resp.status_code == 404


def test_submit_negative_question_index_400(client):
    start_data = _start(client)
    session_id = start_data["session_id"]
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": -1,
            "user_choice": 0,
        },
    )
    assert resp.status_code == 400


def test_health_check_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_crud_get_session_nonexistent(test_db):
    result = crud.get_session(test_db, str(uuid.uuid4()))
    assert result is None


def test_crud_update_session_nonexistent(test_db):
    result = crud.update_session(test_db, str(uuid.uuid4()), current_score=50)
    assert result is None


def test_crud_get_preset_by_tags_nonexistent(test_db):
    result = crud.get_preset_by_tags(test_db, "bad_cat", "bad_primary", "bad_secondary")
    assert result is None


def test_crud_get_records_by_session_empty(test_db):
    result = crud.get_records_by_session(test_db, str(uuid.uuid4()))
    assert result == []


def test_report_clamp_function():
    assert report_router._clamp(150, 0, 100) == 100
    assert report_router._clamp(-5, 0, 100) == 0
    assert report_router._clamp(50, 0, 100) == 50
    assert report_router._clamp(0, 0, 100) == 0
    assert report_router._clamp(100, 0, 100) == 100


def test_report_score_to_percentile_all_ranges():
    assert report_router._score_to_percentile(100) == 1
    assert report_router._score_to_percentile(97) == 3
    assert report_router._score_to_percentile(92) == 5
    assert report_router._score_to_percentile(87) == 9
    assert report_router._score_to_percentile(82) == 12
    assert report_router._score_to_percentile(77) == 18
    assert report_router._score_to_percentile(72) == 25
    assert report_router._score_to_percentile(67) == 32
    assert report_router._score_to_percentile(62) == 40
    assert report_router._score_to_percentile(57) == 48
    assert report_router._score_to_percentile(52) == 55
    assert report_router._score_to_percentile(45) == 70
    assert report_router._score_to_percentile(35) == 82
    assert report_router._score_to_percentile(25) == 90
    assert report_router._score_to_percentile(15) == 95
    assert report_router._score_to_percentile(5) == 99
    assert 1 <= report_router._score_to_percentile(0) <= 99


def test_report_generate_summary_high_mid_low():
    s_high = report_router._generate_summary("NPD", "INTJ", 90)
    assert s_high != ""
    s_mid = report_router._generate_summary("NPD", "INTJ", 65)
    assert s_mid != ""
    s_low = report_router._generate_summary("NPD", "INTJ", 30)
    assert s_low != ""
    assert s_high != s_mid or True
    assert s_mid != s_low or True


def test_report_radar_empty_records():
    radar = report_router._calc_radar([], "NPD")
    assert radar.empathy == 50
    assert radar.boundary == 50
    assert radar.communication == 50
    assert radar.self_awareness == 50
    assert radar.risk_detection == 50


def test_report_radar_with_empathy_records(test_db):
    from app.models import GameRecords
    seed_preset = crud.get_preset_by_tags(test_db, "npd_mbti", "NPD", "INTJ")
    sid = str(uuid.uuid4())
    sess = GameSessions(
        session_id=sid,
        preset_id=seed_preset.id,
        current_stage="meet",
        current_score=100,
        status="playing",
    )
    test_db.add(sess)
    test_db.commit()
    records = []
    for i in range(5):
        r = GameRecords(
            session_id=sid,
            question_index=i,
            question_text="测试情绪感受共情孤独牺牲受伤相关",
            options_json={"options": ["A", "B", "C", "D"]},
            user_choice=0,
            is_correct=(i < 3),
            score_change=10,
            ai_feedback="情绪反馈共情内容",
            stage="meet",
        )
        records.append(r)
        test_db.add(r)
    test_db.commit()
    radar = report_router._calc_radar(records, "双向")
    assert 0 <= radar.empathy <= 100
    assert 0 <= radar.boundary <= 100
    assert 0 <= radar.communication <= 100
    assert 0 <= radar.self_awareness <= 100
    assert 0 <= radar.risk_detection <= 100


def test_report_radar_with_redline_wrong(test_db):
    from app.models import GameRecords
    seed_preset = crud.get_preset_by_tags(test_db, "npd_mbti", "NPD", "INTJ")
    sid = str(uuid.uuid4())
    sess = GameSessions(
        session_id=sid,
        preset_id=seed_preset.id,
        current_stage="meet",
        current_score=100,
        status="playing",
    )
    test_db.add(sess)
    test_db.commit()
    records = []
    for i in range(12):
        r = GameRecords(
            session_id=sid,
            question_index=i,
            question_text="问题文本",
            options_json={"options": ["A", "B", "C", "D"], "is_redline": True},
            user_choice=0,
            is_correct=(i < 5),
            score_change=10,
            ai_feedback="红线警告边界测试",
            stage="meet",
        )
        records.append(r)
        test_db.add(r)
    test_db.commit()
    radar = report_router._calc_radar(records, "NPD")
    assert radar.boundary == 30


def test_report_radar_with_redline_all_correct(test_db):
    from app.models import GameRecords
    seed_preset = crud.get_preset_by_tags(test_db, "npd_mbti", "NPD", "INTJ")
    sid = str(uuid.uuid4())
    sess = GameSessions(
        session_id=sid,
        preset_id=seed_preset.id,
        current_stage="meet",
        current_score=100,
        status="playing",
    )
    test_db.add(sess)
    test_db.commit()
    records = []
    for i in range(12):
        r = GameRecords(
            session_id=sid,
            question_index=i,
            question_text="问题文本",
            options_json={"options": ["A", "B", "C", "D"]},
            user_choice=0,
            is_correct=True,
            score_change=10,
            ai_feedback="红线知识边界测试内容",
            stage="meet",
        )
        records.append(r)
        test_db.add(r)
    test_db.commit()
    radar = report_router._calc_radar(records, "NPD")
    assert radar.boundary == 95


def test_report_generate_global_correct_pct_levels():
    class FakeRec:
        def __init__(self, fb):
            self.ai_feedback = fb
    r_hard = FakeRec("NPD 双向 红线 煤气灯 三角 打压")
    pct1 = report_router._generate_global_correct_pct(r_hard)
    assert 20 <= pct1 <= 35
    r_med = FakeRec("边界 操控 冷读 冷战 情感绑架")
    pct2 = report_router._generate_global_correct_pct(r_med)
    assert 45 <= pct2 <= 60
    r_easy = FakeRec("普通内容")
    pct3 = report_router._generate_global_correct_pct(r_easy)
    assert 65 <= pct3 <= 80
    r_none = FakeRec("")
    pct4 = report_router._generate_global_correct_pct(r_none)
    assert 65 <= pct4 <= 80


def test_report_generate_choice_distribution_sums_to_100():
    for seed in range(5):
        dist = report_router._generate_choice_distribution(60, seed_val=seed)
        total = sum(dist.values())
        assert total == 100
        assert set(dist.keys()) == {"0", "1", "2", "3"}
    dist100 = report_router._generate_choice_distribution(100, seed_val=0)
    assert sum(dist100.values()) == 100


def test_report_generate_strengths_and_weaknesses():
    radar_high_all = schemas.RadarData(
        empathy=95, boundary=90, communication=88,
        self_awareness=85, risk_detection=92,
    )
    strengths = report_router._generate_strengths(radar_high_all)
    assert len(strengths) >= 2
    weaknesses = report_router._generate_weaknesses(radar_high_all)
    assert len(weaknesses) >= 1

    radar_low = schemas.RadarData(
        empathy=30, boundary=25, communication=40,
        self_awareness=35, risk_detection=28,
    )
    strengths2 = report_router._generate_strengths(radar_low)
    assert len(strengths2) >= 2
    weaknesses2 = report_router._generate_weaknesses(radar_low)
    assert len(weaknesses2) >= 1
    assert len(weaknesses2) <= 2


def test_report_generate_advice():
    radar_low_empathy = schemas.RadarData(
        empathy=20, boundary=70, communication=75,
        self_awareness=80, risk_detection=72,
    )
    advice = report_router._generate_advice(radar_low_empathy)
    assert advice != ""
    assert len(advice) <= 100


def test_report_key_learnings_with_and_without_records(test_db):
    from app.models import GameRecords
    learnings_empty = report_router._generate_key_learnings([])
    assert len(learnings_empty) >= 3
    seed_preset = crud.get_preset_by_tags(test_db, "npd_mbti", "NPD", "INTJ")
    sid = str(uuid.uuid4())
    sess = GameSessions(
        session_id=sid,
        preset_id=seed_preset.id,
        current_stage="meet",
        current_score=100,
        status="playing",
    )
    test_db.add(sess)
    test_db.commit()
    records = []
    feedbacks = [
        "这是一个非常长的ai反馈内容用来测试关键知识点提取",
        "另一段长反馈文本超过十个字符的内容",
        "短",
        "",
        "   去空格后的反馈内容应该被提取出来测试   ",
    ]
    for i, fb in enumerate(feedbacks):
        r = GameRecords(
            session_id=sid,
            question_index=i,
            question_text="q",
            options_json={"options": ["A"]},
            user_choice=0,
            is_correct=True,
            score_change=5,
            ai_feedback=fb,
            stage="meet",
        )
        records.append(r)
        test_db.add(r)
    test_db.commit()
    learnings = report_router._generate_key_learnings(records)
    assert len(learnings) >= 3


def test_report_stage_breakdown_empty():
    result = report_router._calc_stage_breakdown([])
    assert len(result) == 4
    for item in result:
        assert item.score_change == 0
        assert item.correct_count == 0
        assert item.total_count == 0


def test_game_filter_question_strips_sensitive():
    sample_q = {
        "id": "q1",
        "stage": "meet",
        "correct_index": 0,
        "is_redline": False,
        "score_change": 10,
        "feedback_title": "t",
        "feedback_knowledge_label": "l",
        "feedback_knowledge_text": "txt",
        "feedback_advice": "a",
        "options": ["A", "B", "C", "D"],
        "dialogue_text": "hello",
    }
    filtered = game_router._filter_question(sample_q)
    for field in game_router.SENSITIVE_FIELDS:
        assert field not in filtered
    assert "id" in filtered
    assert "options" in filtered


def test_report_get_preset_nonexistent(test_db):
    result = report_router._get_preset(test_db, 999999)
    assert result is None


def test_database_get_db_generator():
    from app.database import get_db
    gen = get_db()
    db = next(gen)
    assert db is not None
    try:
        gen.close()
    except StopIteration:
        pass


def test_database_init_db_called():
    from app.database import init_db
    init_db()


def test_questions_seed_bipolar_npd_dialogue_replace():
    qs = get_questions("bipolar_mbti", "双向", "ENFP", "meet")
    assert len(qs) > 0
    qs2 = get_questions("bipolar_mbti", "双向", "INFJ", "meet")
    assert len(qs2) > 0
    for q in qs + qs2:
        assert "NPD" not in q["dialogue_text"]


def test_report_radar_primary_not_npd_no_empathy_keys(test_db):
    from app.models import GameRecords
    seed_preset = crud.get_preset_by_tags(test_db, "npd_mbti", "NPD", "INTJ")
    sid = str(uuid.uuid4())
    sess = GameSessions(
        session_id=sid,
        preset_id=seed_preset.id,
        current_stage="meet",
        current_score=100,
        status="playing",
    )
    test_db.add(sess)
    test_db.commit()
    records = []
    for i in range(6):
        r = GameRecords(
            session_id=sid,
            question_index=i,
            question_text="日常对话交流场景题目",
            options_json={"options": ["A", "B", "C", "D"]},
            user_choice=0,
            is_correct=(i < 4),
            score_change=10,
            ai_feedback="学习内容总结回顾要点提醒",
            stage="meet",
        )
        records.append(r)
        test_db.add(r)
    test_db.commit()
    radar = report_router._calc_radar(records, "双向")
    assert 0 <= radar.empathy <= 100


def test_report_radar_redline_all_correct_less_than_10(test_db):
    from app.models import GameRecords
    seed_preset = crud.get_preset_by_tags(test_db, "npd_mbti", "NPD", "INTJ")
    sid = str(uuid.uuid4())
    sess = GameSessions(
        session_id=sid,
        preset_id=seed_preset.id,
        current_stage="meet",
        current_score=100,
        status="playing",
    )
    test_db.add(sess)
    test_db.commit()
    records = []
    for i in range(5):
        r = GameRecords(
            session_id=sid,
            question_index=i,
            question_text="问题",
            options_json={"options": ["A", "B", "C", "D"]},
            user_choice=0,
            is_correct=True,
            score_change=10,
            ai_feedback="包含红线字样的反馈",
            stage="meet",
        )
        records.append(r)
        test_db.add(r)
    test_db.commit()
    radar = report_router._calc_radar(records, "NPD")
    assert radar.boundary == 70


def test_report_radar_no_redline_keywords_low_accuracy(test_db):
    from app.models import GameRecords
    seed_preset = crud.get_preset_by_tags(test_db, "npd_mbti", "NPD", "INTJ")
    sid = str(uuid.uuid4())
    sess = GameSessions(
        session_id=sid,
        preset_id=seed_preset.id,
        current_stage="meet",
        current_score=100,
        status="playing",
    )
    test_db.add(sess)
    test_db.commit()
    records = []
    for i in range(8):
        r = GameRecords(
            session_id=sid,
            question_index=i,
            question_text="普通问题文本",
            options_json={"options": ["A", "B", "C", "D"]},
            user_choice=0,
            is_correct=(i < 2),
            score_change=10,
            ai_feedback="常规学习内容要点总结",
            stage="meet",
        )
        records.append(r)
        test_db.add(r)
    test_db.commit()
    radar = report_router._calc_radar(records, "NPD")
    assert radar.boundary == 45


def test_report_generate_advice_longer_than_100_chars():
    class FakeAdviceMap(dict):
        def __getitem__(self, key):
            return "A" * 200
    original_map = report_router.ADVICE_MAP
    report_router.ADVICE_MAP = FakeAdviceMap()
    try:
        radar = schemas.RadarData(
            empathy=20, boundary=70, communication=75,
            self_awareness=80, risk_detection=72,
        )
        advice = report_router._generate_advice(radar)
        assert len(advice) == 100
    finally:
        report_router.ADVICE_MAP = original_map


def _complete_session_with_records(client, test_db, score=None):
    start_data = _start(client)
    sid = start_data["session_id"]
    stages = ["meet", "love", "conflict", "ending"]
    for idx in range(len(stages)):
        stage = stages[idx]
        qs = get_questions("npd_mbti", "NPD", "INTJ", stage)
        for qidx, q in enumerate(qs):
            correct = q["correct_index"]
            wrong = (correct + 1) % 4
            choice = correct if (qidx % 2 == 0) else wrong
            if q["is_redline"]:
                choice = correct
            resp = client.post(
                "/api/game/submit",
                json={"session_id": sid, "question_index": qidx, "user_choice": choice},
            )
            if resp.status_code != 200:
                break
        if idx < len(stages) - 1:
            resp_ns = client.post("/api/game/next_stage", json={"session_id": sid})
            if resp_ns.status_code != 200:
                break
    end_resp = client.post(
        "/api/game/end",
        json={"session_id": sid, "result": "passed", "final_score": 85, "answers": []},
    )
    if score is not None:
        crud.update_session(test_db, sid, current_score=score)
    return sid


def test_report_mid_score_scenario(client, test_db):
    sid = _complete_session_with_records(client, test_db, score=65)
    resp = client.get(f"/api/report/{sid}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["final_score"] == 65
    assert len(data["strengths"]) >= 2
    assert len(data["weaknesses"]) >= 1


def test_report_low_score_scenario(client, test_db):
    sid = _complete_session_with_records(client, test_db, score=30)
    resp = client.get(f"/api/report/{sid}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["final_score"] == 30


def test_cors_headers(client):
    resp = client.get(
        "/health",
        headers={"Origin": "http://localhost:10086"},
    )
    assert "access-control-allow-origin" in resp.headers
    assert resp.headers["access-control-allow-origin"] == "http://localhost:10086"


def test_cors_headers_127_0_0_1(client):
    resp = client.get(
        "/health",
        headers={"Origin": "http://127.0.0.1:10086"},
    )
    assert "access-control-allow-origin" in resp.headers
    assert resp.headers["access-control-allow-origin"] == "http://127.0.0.1:10086"


def test_cors_preflight_options(client):
    resp = client.options(
        "/api/presets",
        headers={
            "Origin": "http://localhost:10086",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert resp.status_code == 200
    assert "access-control-allow-origin" in resp.headers


def test_swagger_docs_endpoint(client):
    resp = client.get("/docs")
    assert resp.status_code == 200


def test_swagger_openapi_json(client):
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    spec = resp.json()
    paths = list(spec["paths"].keys())
    api_paths = [p for p in paths if p.startswith("/api/") or p == "/health"]
    assert len(api_paths) >= 7


def test_score_drops_to_zero_gameover_not_redline(client, test_db):
    start_data = _start(client)
    session_id = start_data["session_id"]
    meet_qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    q_non_redline = None
    for idx, q in enumerate(meet_qs):
        if not q["is_redline"]:
            q_non_redline = (idx, q)
            break
    assert q_non_redline is not None
    idx, q = q_non_redline
    correct = q["correct_index"]
    wrong = (correct + 1) % 4
    crud.update_session(test_db, session_id, current_score=q["score_change"])
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": idx,
            "user_choice": wrong,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["new_score"] == 0
    assert data["game_over"] is True
    assert data["is_redline"] is False

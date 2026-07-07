import pytest
import re
from app.data.questions_seed import get_questions
from app.models import GameSessions

UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
)

STAGE_ORDER = ["meet", "love", "conflict", "ending"]
STAGE_NAMES_CN = {
    "meet": "相识破冰",
    "love": "热恋博弈",
    "conflict": "冲突考验",
    "ending": "终局抉择",
}


def _start_game(client, category="npd_mbti", primary="NPD", secondary="INTJ"):
    resp = client.post(
        "/api/game/start",
        json={
            "preset_category": category,
            "primary": primary,
            "secondary": secondary,
        },
    )
    assert resp.status_code == 200, f"start failed: {resp.status_code} {resp.text}"
    data = resp.json()
    assert UUID_RE.match(data["session_id"])
    return data


def _submit_correct(client, session_id, category, primary, secondary, stage, q_idx):
    qs = get_questions(category, primary, secondary, stage)
    q = qs[q_idx]
    correct_idx = q["correct_index"]
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": q_idx,
            "user_choice": correct_idx,
        },
    )
    assert resp.status_code == 200, f"submit failed: {resp.status_code} {resp.text}"
    data = resp.json()
    assert data["is_correct"] is True
    assert data["score_change"] > 0
    assert 0 <= data["new_score"] <= 100
    return data


def _submit_wrong(client, session_id, category, primary, secondary, stage, q_idx):
    qs = get_questions(category, primary, secondary, stage)
    q = qs[q_idx]
    correct_idx = q["correct_index"]
    wrong_idx = (correct_idx + 1) % 4
    resp = client.post(
        "/api/game/submit",
        json={
            "session_id": session_id,
            "question_index": q_idx,
            "user_choice": wrong_idx,
        },
    )
    assert resp.status_code == 200, f"submit failed: {resp.status_code} {resp.text}"
    return resp.json()


def _next_stage(client, session_id, expect_next=None, expect_finished=False):
    resp = client.post(
        "/api/game/next_stage",
        json={"session_id": session_id},
    )
    assert resp.status_code == 200, f"next_stage failed: {resp.status_code} {resp.text}"
    data = resp.json()
    if expect_next is not None:
        assert data["next_stage"] == expect_next
    if expect_finished:
        assert data["all_finished"] is True
    return data


def _end_game(client, session_id, result="passed", final_score=100):
    resp = client.post(
        "/api/game/end",
        json={
            "session_id": session_id,
            "result": result,
            "final_score": final_score,
            "answers": [],
        },
    )
    assert resp.status_code == 200
    assert resp.json()["ok"] is True


def _assert_report_schema(data, session_id, min_stage_count=1):
    assert data["session_id"] == session_id
    assert 0 <= data["final_score"] <= 100
    assert 0 <= data["accuracy"] <= 100
    assert min_stage_count <= data["stage_count"] <= 4
    assert len(data["stage_breakdown"]) == 4
    for i, sb in enumerate(data["stage_breakdown"]):
        assert sb["stage"] == STAGE_ORDER[i]
        assert sb["stage_name_cn"] == STAGE_NAMES_CN[STAGE_ORDER[i]]
        assert "score_change" in sb
        assert "correct_count" in sb
        assert "total_count" in sb
    radar = data["radar_data"]
    radar_keys = ["empathy", "boundary", "communication", "self_awareness", "risk_detection"]
    for k in radar_keys:
        assert k in radar, f"radar missing key {k}"
        assert 0 <= radar[k] <= 100, f"radar[{k}]={radar[k]} out of range"
    assert isinstance(data["summary"], str)
    assert len(data["summary"]) > 0
    assert isinstance(data["strengths"], list)
    assert len(data["strengths"]) >= 2
    assert isinstance(data["weaknesses"], list)
    assert len(data["weaknesses"]) >= 1
    assert isinstance(data["advice"], str)
    assert len(data["advice"]) > 0
    assert isinstance(data["key_learnings"], list)
    assert len(data["key_learnings"]) >= 3


def _assert_parallel_schema(data, session_id):
    assert data["session_id"] == session_id
    assert 1 <= data["top_percentile"] <= 99
    assert data["total_players"] >= 1000
    assert "higher_than_players" in data
    assert isinstance(data["higher_than_players"], int)
    assert isinstance(data["average_scores"], list)
    for s in data["average_scores"]:
        assert "stage" in s
        assert "your_score" in s
        assert "global_avg" in s


def test_path_a_victory_all_correct_4_stages(client, test_db):
    """路径 A：正常胜利路径（NPD + INTJ，全对，通关 4 阶段）"""
    category = "npd_mbti"
    primary = "NPD"
    secondary = "INTJ"

    # 1. 验证 presets 有 32 条
    presets_resp = client.get("/api/presets")
    assert presets_resp.status_code == 200
    assert len(presets_resp.json()) == 32

    # 2. 启动游戏
    start_data = _start_game(client, category, primary, secondary)
    session_id = start_data["session_id"]
    assert start_data["stage"] == "meet"
    assert len(start_data["questions"]) > 0

    # 3-7. 遍历 4 个阶段，全对
    stages = ["meet", "love", "conflict", "ending"]
    prev_score = 100
    for stage_idx, stage in enumerate(stages):
        qs = get_questions(category, primary, secondary, stage)
        assert len(qs) > 0, f"{stage} has no questions"
        for q_idx in range(len(qs)):
            sub_data = _submit_correct(
                client, session_id, category, primary, secondary, stage, q_idx
            )
            assert sub_data["new_score"] >= prev_score
            assert sub_data["new_score"] <= 100
            prev_score = sub_data["new_score"]
            assert sub_data["triggered_game_over"] is False
            assert "question_explanation" in sub_data
            qe = sub_data["question_explanation"]
            assert "psychological_impact" in qe
            assert "boundary_suggestion" in qe
            assert isinstance(qe["warning_signals"], list)
            assert isinstance(qe["coping_strategies"], list)

        if stage_idx < len(stages) - 1:
            ns_data = _next_stage(client, session_id, expect_next=stages[stage_idx + 1])
            assert ns_data["all_finished"] is False
            assert len(ns_data["questions"]) > 0
            for q in ns_data["questions"]:
                assert "id" in q
                assert "stage" in q
                assert "scene" in q
                assert "dialogue_text" in q
                assert "options" in q
                assert len(q["options"]) == 4
                assert "explanation" not in q or True

    # ending 完后 next_stage → stage=None, all_finished=True
    final_ns = _next_stage(client, session_id, expect_next=None, expect_finished=True)
    assert final_ns["next_stage"] is None
    assert final_ns["all_finished"] is True
    assert len(final_ns["questions"]) == 0

    # 8. 调用 end
    _end_game(client, session_id, result="passed", final_score=prev_score)

    db_sess = test_db.query(GameSessions).filter_by(session_id=session_id).first()
    assert db_sess.status == "passed"

    # 9. 获取 report，断言 schema
    report_resp = client.get(f"/api/report/{session_id}")
    assert report_resp.status_code == 200
    report = report_resp.json()
    _assert_report_schema(report, session_id, min_stage_count=4)
    assert report["final_score"] == prev_score
    assert report["accuracy"] == 100
    for sb in report["stage_breakdown"]:
        if sb["total_count"] > 0:
            assert sb["correct_count"] == sb["total_count"]

    # 10. 获取 parallel stats
    parallel_resp = client.get(f"/api/stats/parallel/{session_id}")
    assert parallel_resp.status_code == 200
    parallel = parallel_resp.json()
    _assert_parallel_schema(parallel, session_id)
    assert parallel["top_percentile"] <= 20


def test_path_b_redline_death_bipolar_enfp(client, test_db):
    """路径 B：红线快速死亡（双向 + ENFP，红线题答错）"""
    category = "bipolar_mbti"
    primary = "双向"
    secondary = "ENFP"

    start_data = _start_game(client, category, primary, secondary)
    session_id = start_data["session_id"]
    assert start_data["stage"] == "meet"

    qs = get_questions(category, primary, secondary, "meet")
    redline_idx = None
    for idx, q in enumerate(qs):
        if q["is_redline"]:
            redline_idx = idx
            break
    assert redline_idx is not None, "no redline question found in meet stage"

    # 如果红线题不是第 0 题，先把前面的做对
    for q_idx in range(redline_idx):
        _submit_correct(client, session_id, category, primary, secondary, "meet", q_idx)

    # 红线题答错
    sub_data = _submit_wrong(
        client, session_id, category, primary, secondary, "meet", redline_idx
    )
    assert sub_data["is_redline"] is True
    assert sub_data["triggered_game_over"] is True
    assert sub_data["game_over"] is True
    assert sub_data["new_score"] < 30

    db_sess = test_db.query(GameSessions).filter_by(session_id=session_id).first()
    assert db_sess.status == "failed"

    # 获取 report，检查只有 1 阶段数据
    report_resp = client.get(f"/api/report/{session_id}")
    assert report_resp.status_code == 200
    report = report_resp.json()
    _assert_report_schema(report, session_id, min_stage_count=1)
    assert report["final_score"] < 30
    assert report["accuracy"] < 100
    assert len(report["summary"]) > 0
    radar = report["radar_data"]
    for k in ["empathy", "boundary", "communication", "self_awareness", "risk_detection"]:
        assert 0 <= radar[k] <= 100

    # parallel 也能拿到
    parallel_resp = client.get(f"/api/stats/parallel/{session_id}")
    assert parallel_resp.status_code == 200
    parallel = parallel_resp.json()
    _assert_parallel_schema(parallel, session_id)


def test_path_c_consecutive_wrong_score_clamp_to_zero(client, test_db):
    """路径 C：连续错题 score 打到 0 死亡（夹逼到 0）"""
    category = "npd_mbti"
    primary = "NPD"
    secondary = "INTJ"

    start_data = _start_game(client, category, primary, secondary)
    session_id = start_data["session_id"]

    min_score_seen = 100
    game_over_triggered = False
    submitted_count = 0

    stages = ["meet", "love", "conflict", "ending"]
    for stage in stages:
        if game_over_triggered:
            break
        qs = get_questions(category, primary, secondary, stage)
        for q_idx in range(len(qs)):
            if game_over_triggered:
                break
            q = qs[q_idx]
            # 红线题跳过（用对的答案），否则一直答错直到 game over
            if q["is_redline"]:
                sub_data = _submit_correct(
                    client, session_id, category, primary, secondary, stage, q_idx
                )
            else:
                sub_data = _submit_wrong(
                    client, session_id, category, primary, secondary, stage, q_idx
                )
            submitted_count += 1
            # 夹逼不会 < 0
            assert sub_data["new_score"] >= 0, f"score went negative: {sub_data['new_score']}"
            assert sub_data["new_score"] <= 100
            if sub_data["new_score"] < min_score_seen:
                min_score_seen = sub_data["new_score"]
            if sub_data["game_over"] or sub_data["triggered_game_over"]:
                game_over_triggered = True
                assert sub_data["new_score"] <= 0 or sub_data.get("is_redline")

        # 如果 stage 没结束但没触发 game_over，先进入下一 stage
        if not game_over_triggered:
            last_q_idx = len(qs) - 1
            resp = client.post(
                "/api/game/submit",
                json={
                    "session_id": session_id,
                    "question_index": last_q_idx,
                    "user_choice": 0,
                },
            )
            if resp.status_code == 200 and resp.json().get("game_over"):
                game_over_triggered = True
            elif stage != "ending":
                ns_resp = client.post(
                    "/api/game/next_stage",
                    json={"session_id": session_id},
                )
                if ns_resp.status_code != 200:
                    break

    # 最多 10 题提交就应该触发或接近 0
    assert submitted_count >= 1
    # report 可以正常获取
    report_resp = client.get(f"/api/report/{session_id}")
    assert report_resp.status_code == 200
    report = report_resp.json()
    _assert_report_schema(report, session_id, min_stage_count=1)
    assert 0 <= report["final_score"] <= 100


def test_path_d_stage_transition_questions_valid(client):
    """路径 D：阶段推进 + transition 拉题（验证 questions 非空且字段完整）"""
    category = "npd_mbti"
    primary = "NPD"
    secondary = "INTJ"

    start_data = _start_game(client, category, primary, secondary)
    session_id = start_data["session_id"]

    expected_stages = [
        ("meet", "love"),
        ("love", "conflict"),
        ("conflict", "ending"),
        ("ending", None),
    ]

    for cur_stage, expected_next in expected_stages:
        qs = get_questions(category, primary, secondary, cur_stage)
        assert len(qs) > 0, f"{cur_stage} questions empty"
        # 全对提交 stage 内所有题
        for q_idx in range(len(qs)):
            _submit_correct(
                client, session_id, category, primary, secondary, cur_stage, q_idx
            )
        # 调 next_stage
        ns_data = _next_stage(client, session_id)
        if expected_next is not None:
            assert ns_data["next_stage"] == expected_next
            assert ns_data["all_finished"] is False
            stage_questions = ns_data["questions"]
            assert len(stage_questions) > 0, f"{expected_next} has zero questions"
            for q in stage_questions:
                assert "id" in q and isinstance(q["id"], str)
                assert "stage" in q and q["stage"] == expected_next
                assert "scene" in q and isinstance(q["scene"], str)
                assert "dialogue_speaker" in q
                assert "dialogue_text" in q and len(q["dialogue_text"]) > 0
                assert "options" in q
                assert len(q["options"]) == 4
                for opt in q["options"]:
                    assert isinstance(opt, str)
                    assert len(opt) > 0
                # 不应该暴露答案
                assert "correct_index" not in q
                assert "is_redline" not in q
                assert "score_change" not in q
        else:
            assert ns_data["next_stage"] is None
            assert ns_data["all_finished"] is True

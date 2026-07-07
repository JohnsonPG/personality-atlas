import pytest
from app.data.questions_seed import get_questions

STAGE_ORDER = ["meet", "love", "conflict", "ending"]


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


# ─── 路径 A: NPD+INTJ 全对 4 阶段通关 ─────────────────────────
def test_path_a_npd_intj_full_victory(client, test_db):
    category = "npd_mbti"
    primary = "NPD"
    secondary = "INTJ"

    r = client.post('/api/game/start', json={
        'preset_category': category, 'primary': primary, 'secondary': secondary
    })
    assert r.status_code == 200
    sid = r.json()['session_id']
    stages_expected = ['meet', 'love', 'conflict', 'ending']

    prev_score = 100
    for stage_idx, stage in enumerate(stages_expected):
        if stage == 'meet':
            questions_api = r.json()['questions']
        else:
            ns = client.post('/api/game/next_stage', json={'session_id': sid})
            assert ns.status_code == 200
            questions_api = ns.json()['questions']
        assert len(questions_api) >= 3

        raw_questions = get_questions(category, primary, secondary, stage)

        for i, q in enumerate(raw_questions):
            s = client.post('/api/game/submit', json={
                'session_id': sid, 'question_index': i,
                'user_choice': q['correct_index']
            })
            assert s.status_code == 200
            body = s.json()
            assert body['is_correct'] is True
            assert body['score_change'] >= 0
            assert 0 <= body['new_score'] <= 100
            assert body['new_score'] >= prev_score
            prev_score = body['new_score']
            assert body['triggered_game_over'] is False
            assert body['question_explanation']['knowledge_point']

    end_r = client.post('/api/game/end', json={
        'session_id': sid, 'result': 'passed', 'final_score': prev_score, 'answers': []
    })
    assert end_r.status_code == 200

    rep = client.get(f'/api/report/{sid}')
    assert rep.status_code == 200
    rb = rep.json()
    assert 0 <= rb['final_score'] <= 100
    assert 0 <= rb['accuracy'] <= 100
    assert rb['stage_count'] == 4
    assert len(rb['stage_breakdown']) == 4
    radar = rb['radar_data']
    for k in ['empathy', 'boundary', 'communication', 'self_awareness', 'risk_detection']:
        assert 0 <= radar[k] <= 100
    assert len(rb['summary']) > 0
    assert len(rb['strengths']) >= 1
    assert len(rb['weaknesses']) >= 1
    assert len(rb['advice']) > 0
    assert len(rb['key_learnings']) >= 3

    par = client.get(f'/api/stats/parallel/{sid}')
    assert par.status_code == 200
    pb = par.json()
    assert 1 <= pb['top_percentile'] <= 99
    assert pb['total_players'] >= 1000
    assert isinstance(pb['average_scores'], list)
    assert len(pb['average_scores']) >= 2


# ─── 路径 B: 双向+ENFP 第 2 阶段红线答错 game_over ─────────────────────────
def test_path_b_bipolar_enfp_redline_death(client, test_db):
    category = "bipolar_mbti"
    primary = "双向"
    secondary = "ENFP"

    r = client.post('/api/game/start', json={
        'preset_category': category, 'primary': primary, 'secondary': secondary
    })
    assert r.status_code == 200
    sid = r.json()['session_id']

    meet_raw = get_questions(category, primary, secondary, "meet")
    for i, q in enumerate(meet_raw):
        s = client.post('/api/game/submit', json={
            'session_id': sid, 'question_index': i, 'user_choice': q['correct_index']
        })
        assert s.status_code == 200

    ns = client.post('/api/game/next_stage', json={'session_id': sid})
    assert ns.status_code == 200
    love_raw = get_questions(category, primary, secondary, "love")

    redline_q = None
    for idx, q in enumerate(love_raw):
        if q.get('is_redline'):
            redline_q = (idx, q)
            break

    if not redline_q:
        for i, q in enumerate(love_raw):
            client.post('/api/game/submit', json={
                'session_id': sid, 'question_index': i, 'user_choice': q['correct_index']
            })
        ns2 = client.post('/api/game/next_stage', json={'session_id': sid})
        conf_raw = get_questions(category, primary, secondary, "conflict")
        redline_q = next(((i, q) for i, q in enumerate(conf_raw) if q.get('is_redline')), None)

    assert redline_q is not None, "题库必须至少有一道红线题"
    idx, q = redline_q

    wrong_choice = (q['correct_index'] + 1) % len(q['options'])
    s = client.post('/api/game/submit', json={
        'session_id': sid, 'question_index': idx, 'user_choice': wrong_choice
    })
    assert s.status_code == 200
    body = s.json()
    assert body['is_correct'] is False
    assert body['triggered_game_over'] is True, "红线答错必须触发 game_over"

    client.post('/api/game/end', json={
        'session_id': sid, 'result': 'failed', 'final_score': body['new_score'], 'answers': []
    })

    rep = client.get(f'/api/report/{sid}')
    assert rep.status_code == 200


# ─── 路径 C: NPD+ISFP 连续错题 score 扣 0 ─────────────────────────
def test_path_c_npd_isfp_score_zero_death(client, test_db):
    category = "npd_mbti"
    primary = "NPD"
    secondary = "ISFP"

    r = client.post('/api/game/start', json={
        'preset_category': category, 'primary': primary, 'secondary': secondary
    })
    assert r.status_code == 200
    sid = r.json()['session_id']

    last_score = None
    last_resp_json = None
    triggered = False

    for stage in STAGE_ORDER:
        if triggered:
            break
        qs = get_questions(category, primary, secondary, stage)
        for i, q in enumerate(qs):
            if triggered:
                break
            if q.get('is_redline'):
                choice = q['correct_index']
            else:
                choice = (q['correct_index'] + 1) % len(q['options'])
            s = client.post('/api/game/submit', json={
                'session_id': sid, 'question_index': i, 'user_choice': choice
            })
            assert s.status_code == 200
            last_resp_json = s.json()
            last_score = last_resp_json['new_score']
            assert 0 <= last_score <= 100
            if last_resp_json['triggered_game_over']:
                triggered = True

        if not triggered and stage != 'ending':
            ns = client.post('/api/game/next_stage', json={'session_id': sid})
            if ns.status_code != 200:
                break

    assert last_score is not None
    assert last_score >= 0, "score clamp 失败，出现负数"
    assert last_score <= 100

    rep = client.get(f'/api/report/{sid}')
    assert rep.status_code == 200


# ─── 路径 D: 边界 case（无 session、重复调 next_stage） ─────────────────
def test_path_d_api_boundary_cases(client, test_db):
    ns = client.post('/api/game/next_stage', json={'session_id': 'non-existent-uuid'})
    assert ns.status_code == 404

    s = client.post('/api/game/submit', json={
        'session_id': 'not-exist', 'question_index': 0, 'user_choice': 0
    })
    assert s.status_code == 404

    r = client.get('/api/report/not-exist')
    assert r.status_code == 404

    p = client.get('/api/stats/parallel/not-exist')
    assert p.status_code == 404

    ps = client.get('/api/presets')
    assert ps.status_code == 200
    assert len(ps.json()) >= 32

    bad = client.post('/api/game/start', json={
        'preset_category': '无效人格', 'primary': 'X', 'secondary': 'INTJ'
    })
    assert bad.status_code == 404

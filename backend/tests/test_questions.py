from app.data.questions_seed import get_questions, MBTI_TYPES

REQUIRED_FIELDS = [
    "id", "stage", "scene", "scene_image", "dialogue_speaker",
    "dialogue_text", "options", "correct_index", "score_change",
    "is_redline", "feedback_title", "feedback_knowledge_label",
    "feedback_knowledge_text", "feedback_advice",
]


def test_npd_intj_meet_3_questions():
    qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    assert len(qs) == 3
    for q in qs:
        assert len(q["options"]) == 4
        assert 0 <= q["correct_index"] <= 3
        assert q["feedback_knowledge_text"] is not None and len(q["feedback_knowledge_text"]) > 0
        assert q["feedback_advice"] is not None and len(q["feedback_advice"]) > 0
        assert q["scene_image"] is not None and len(q["scene_image"]) > 0
        assert q["id"] is not None and len(q["id"]) > 0
        assert q["dialogue_text"] is not None and len(q["dialogue_text"]) > 0


def test_npd_intj_all_stages_count():
    meet = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    love = get_questions("npd_mbti", "NPD", "INTJ", "love")
    conflict = get_questions("npd_mbti", "NPD", "INTJ", "conflict")
    ending = get_questions("npd_mbti", "NPD", "INTJ", "ending")
    assert len(meet) == 3
    assert len(love) == 4
    assert len(conflict) == 4
    assert len(ending) == 3
    total = len(meet) + len(love) + len(conflict) + len(ending)
    assert total == 14


def test_npd_intj_redline_exists():
    all_qs = []
    for stage in ["meet", "love", "conflict", "ending"]:
        all_qs.extend(get_questions("npd_mbti", "NPD", "INTJ", stage))
    redline = [q for q in all_qs if q["is_redline"] is True]
    assert len(redline) >= 2
    meet_qs = get_questions("npd_mbti", "NPD", "INTJ", "meet")
    assert meet_qs[-1]["is_redline"] is True
    conflict_qs = get_questions("npd_mbti", "NPD", "INTJ", "conflict")
    assert conflict_qs[2]["is_redline"] is True


def test_other_31_presets_nonempty():
    tested = 0
    for primary_tag, category in [("双向", "bipolar_mbti"), ("NPD", "npd_mbti")]:
        for secondary in MBTI_TYPES:
            if primary_tag == "NPD" and secondary == "INTJ":
                continue
            tested += 1
            for stage in ["meet", "love", "conflict", "ending"]:
                qs = get_questions(category, primary_tag, secondary, stage)
                assert len(qs) > 0, f"Empty: {primary_tag} x {secondary} x {stage}"
                for q in qs:
                    for field in REQUIRED_FIELDS:
                        assert field in q, f"Field {field} missing in {q.get('id')}"
                        assert q[field] is not None, f"Field {field} is None in {q.get('id')}"
                    assert len(q["options"]) == 4
                    assert 0 <= q["correct_index"] <= 3
    assert tested == 31


def test_all_score_change_reasonable():
    all_scores = []
    all_qs_npd_intj = []
    for stage in ["meet", "love", "conflict", "ending"]:
        all_qs_npd_intj.extend(get_questions("npd_mbti", "NPD", "INTJ", stage))
    for q in all_qs_npd_intj:
        all_scores.append(q["score_change"])
    for primary_tag, category in [("双向", "bipolar_mbti"), ("NPD", "npd_mbti")]:
        for secondary in MBTI_TYPES:
            if primary_tag == "NPD" and secondary == "INTJ":
                continue
            for stage in ["meet", "love", "conflict", "ending"]:
                for q in get_questions(category, primary_tag, secondary, stage):
                    all_scores.append(q["score_change"])
    assert len(all_scores) == 14 * 32
    for s in all_scores:
        assert 5 <= s <= 20, f"score_change {s} not in [5,20]"

import uuid
from sqlalchemy import inspect

from app.database import Base
from app.models import Presets, GameSessions, GameRecords, StatsCache
from app.data.presets_seed import seed_presets

MBTI_TYPES = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTP", "ISFP", "ESTP", "ESFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
]


def test_create_tables(test_engine):
    inspector = inspect(test_engine)
    tables = inspector.get_table_names()
    expected = {"presets", "game_sessions", "game_records", "stats_cache"}
    assert expected.issubset(set(tables))
    metadata_tables = set(Base.metadata.tables.keys())
    assert expected.issubset(metadata_tables)


def test_seed_32_presets(test_db):
    seed_presets(test_db)
    count = test_db.query(Presets).count()
    assert count == 32


def test_preset_combinations_complete(test_db):
    seed_presets(test_db)
    for mbti in MBTI_TYPES:
        npd_count = test_db.query(Presets).filter(
            Presets.primary_tag == "NPD",
            Presets.secondary_tag == mbti,
            Presets.category == "npd_mbti",
        ).count()
        assert npd_count == 1, f"NPD x {mbti} missing"
        bp_count = test_db.query(Presets).filter(
            Presets.primary_tag == "双向",
            Presets.secondary_tag == mbti,
            Presets.category == "bipolar_mbti",
        ).count()
        assert bp_count == 1, f"双向 x {mbti} missing"
    for mbti in MBTI_TYPES:
        total = test_db.query(Presets).filter(Presets.secondary_tag == mbti).count()
        assert total == 2, f"{mbti} should have 2 entries"


def test_session_crud(test_db):
    seed_presets(test_db)
    preset = test_db.query(Presets).first()
    session_id = str(uuid.uuid4())
    session = GameSessions(
        session_id=session_id,
        preset_id=preset.id,
        current_stage="meet",
        current_score=100,
        status="playing",
        stage_history={},
    )
    test_db.add(session)
    test_db.commit()
    test_db.refresh(session)

    fetched = test_db.query(GameSessions).filter_by(session_id=session_id).first()
    assert fetched is not None
    assert fetched.session_id == session_id
    assert fetched.preset_id == preset.id
    assert fetched.current_stage == "meet"
    assert fetched.current_score == 100
    assert fetched.status == "playing"
    assert fetched.stage_history == {}


def test_record_crud(test_db):
    seed_presets(test_db)
    preset = test_db.query(Presets).first()
    session_id = str(uuid.uuid4())
    session = GameSessions(
        session_id=session_id,
        preset_id=preset.id,
    )
    test_db.add(session)
    test_db.commit()

    options = {"options": ["A选项", "B选项", "C选项", "D选项"]}
    record = GameRecords(
        session_id=session_id,
        question_index=0,
        question_text="测试问题",
        options_json=options,
        user_choice=1,
        is_correct=True,
        score_change=10,
        ai_feedback="回答正确",
        stage="meet",
    )
    test_db.add(record)
    test_db.commit()
    test_db.refresh(record)

    fetched = test_db.query(GameRecords).filter_by(id=record.id).first()
    assert fetched is not None
    assert fetched.options_json == options
    assert fetched.session_id == session_id
    assert fetched.question_index == 0
    assert fetched.user_choice == 1
    assert fetched.is_correct is True
    assert fetched.score_change == 10


def test_stats_cache_crud(test_db):
    distribution = {"0": 23, "1": 45, "2": 12, "3": 8}
    stats = StatsCache(
        preset_id=1,
        stage="meet",
        question_index=0,
        total_answers=88,
        correct_count=45,
        choice_distribution=distribution,
    )
    test_db.add(stats)
    test_db.commit()
    test_db.refresh(stats)

    fetched = test_db.query(StatsCache).filter_by(id=stats.id).first()
    assert fetched is not None
    assert fetched.preset_id == 1
    assert fetched.stage == "meet"
    assert fetched.question_index == 0
    assert fetched.total_answers == 88
    assert fetched.correct_count == 45
    assert fetched.choice_distribution == distribution

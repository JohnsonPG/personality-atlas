from sqlalchemy.orm import Session
from app.models import Presets

MBTI_TYPES = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTP", "ISFP", "ESTP", "ESFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
]

PRESET_CONFIGS = [
    ("NPD", "npd_mbti"),
    ("双向", "bipolar_mbti"),
]


def seed_presets(db: Session):
    count = db.query(Presets).count()
    if count > 0:
        return
    presets = []
    for primary_tag, category in PRESET_CONFIGS:
        for mbti in MBTI_TYPES:
            presets.append(Presets(
                category=category,
                primary_tag=primary_tag,
                secondary_tag=mbti,
                knowledge_json={},
            ))
    db.add_all(presets)
    db.commit()

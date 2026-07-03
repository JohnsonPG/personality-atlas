from __future__ import annotations
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas
from app.models import Presets

router = APIRouter(prefix="/api", tags=["report"])

STAGE_ORDER = ["meet", "love", "conflict", "ending"]
STAGE_NAMES_CN = {
    "meet": "相识破冰",
    "love": "热恋博弈",
    "conflict": "冲突考验",
    "ending": "终局抉择",
}

SUMMARY_TEMPLATES_HIGH = [
    "恭喜你完成了{primary} × {secondary}的沉浸式关系模拟！最终得分{score}分，你的表现超过了绝大多数挑战者。在四个阶段中，你展现出了成熟的边界意识和敏锐的风险嗅觉，既能共情他人又不失自我保护能力。这段经历将成为你未来建立健康关系的重要参照。",
    "太棒了！你以{score}分的高分通过了{primary}+{secondary}组合的全部考验。你对暗贬操控、煤气灯效应等情感虐待手段的识别精准，边界建立既清晰又不极端。继续保持这份觉察，你已经具备了构建健康亲密关系的核心能力。",
]
SUMMARY_TEMPLATES_MID = [
    "你完成了{primary} × {secondary}的关系模拟，最终得分{score}分。整体表现中规中矩，对明显的边界入侵有一定辨识力，但对更隐蔽的操控手段（如间歇性强化、三角关系）仍有提升空间。建议重点关注自己容易妥协的场景。",
    "本次{primary}+{secondary}模拟你获得了{score}分，在部分阶段的决策展现了不错的觉察力，但也有几处被情感绑架或伪逻辑带偏的时刻。记住：健康关系的前提是平等，任何让你持续自我怀疑的信号都值得认真对待。",
]
SUMMARY_TEMPLATES_LOW = [
    "你完成了{primary} × {secondary}关系模拟，得分{score}分。从决策轨迹看，你在关系中容易过度共情、忽视自身边界，对NPD/双向类的典型操控手段不够熟悉。这不是你的错——建立健康的边界感和风险识别能力是可以通过练习获得的技能。",
    "本次{primary}+{secondary}模拟你的得分是{score}分，暴露了你在关系中容易被情感绑架、不敢坚持边界的模式。建议从最小的边界练习开始，记住：你的感受和需求永远值得被认真对待，不需要用讨好或妥协来换取被爱。",
]

STRENGTH_MAP = {
    "empathy": "共情能力出色，能敏锐感知他人情绪",
    "boundary": "边界建立意识强，不轻易被操控",
    "communication": "沟通方式成熟，能理性表达需求",
    "self_awareness": "自我觉察敏锐，能识别心理陷阱",
    "risk_detection": "风险识别精准，能预判操控手段",
}
WEAKNESS_MAP = {
    "empathy": "共情过度，容易忽略自身需求",
    "boundary": "边界感薄弱，易被入侵和操控",
    "communication": "沟通容易被带节奏，表达不够坚定",
    "self_awareness": "自我觉察不足，易陷入自我怀疑",
    "risk_detection": "风险识别能力有待提升，易忽视危险信号",
}
ADVICE_MAP = {
    "empathy": "记得把共情力分一半给自己，你的感受同样重要。练习在关心他人之前，先问自己一句「我现在舒服吗？」",
    "boundary": "从最小的「说不」开始练习边界，不需要解释理由。记住：真正尊重你的人，不会因为你有边界而离开。",
    "communication": "沟通前先在心里想好自己的底线，不被对方的逻辑框架带着走。用「我感到」代替「你总是」来表达。",
    "self_awareness": "每天花5分钟复盘当天的人际互动，记录让你「有点不舒服但说不上为什么」的时刻——这些就是你的觉察入口。",
    "risk_detection": "记住情感操控的三个信号：让你自我怀疑、让你不断妥协、让你不敢提需求。出现任意两个就要提高警惕。",
}


def _clamp(v: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, v))


def _get_preset(db: Session, preset_id: int):
    return db.query(Presets).filter(Presets.id == preset_id).first()


def _calc_stage_breakdown(records):
    by_stage = {s: {"items": [], "score_change": 0, "correct_count": 0, "total_count": 0} for s in STAGE_ORDER}
    for r in records:
        if r.stage in by_stage:
            by_stage[r.stage]["items"].append(r)
            by_stage[r.stage]["score_change"] += r.score_change
            by_stage[r.stage]["total_count"] += 1
            if r.is_correct:
                by_stage[r.stage]["correct_count"] += 1
    result = []
    for s in STAGE_ORDER:
        d = by_stage[s]
        result.append(schemas.StageBreakdownItem(
            stage=s,
            stage_name_cn=STAGE_NAMES_CN[s],
            score_change=d["score_change"],
            correct_count=d["correct_count"],
            total_count=d["total_count"],
        ))
    return result


def _calc_radar(records, preset_primary: str):
    total = len(records)
    if total == 0:
        return schemas.RadarData(empathy=50, boundary=50, communication=50, self_awareness=50, risk_detection=50)
    correct_total = sum(1 for r in records if r.is_correct)
    base_acc = correct_total / total

    empathy_keys = ["情绪", "孤独", "共情", "感受", "牺牲", "受伤"]
    empathy_total = 0
    empathy_correct = 0
    for r in records:
        text = (r.question_text or "") + (r.ai_feedback or "")
        if any(k in text for k in empathy_keys):
            empathy_total += 1
            if r.is_correct:
                empathy_correct += 1
    if empathy_total > 0:
        empathy = int((empathy_correct / empathy_total) * 100)
    else:
        if preset_primary == "NPD":
            empathy = random.randint(60, 80)
        else:
            empathy = int(base_acc * 100)
    empathy = _clamp(empathy)

    redline_total = 0
    redline_correct = 0
    redline_wrong = 0
    for r in records:
        text = r.ai_feedback or ""
        if "红线" in text or "边界测试" in text or "is_redline" in str(r.options_json):
            redline_total += 1
            if r.is_correct:
                redline_correct += 1
            else:
                redline_wrong += 1
    if redline_total > 0:
        if redline_wrong > 0:
            boundary = 30
        elif redline_correct == redline_total and total >= 10:
            boundary = 95
        else:
            boundary = 70
    else:
        if base_acc >= 0.8:
            boundary = 85
        elif base_acc >= 0.5:
            boundary = 65
        else:
            boundary = 45
    boundary = _clamp(boundary)

    comm_offset = random.randint(-5, 5)
    communication = int(base_acc * 100) + comm_offset
    communication = _clamp(communication)

    awareness_keys = ["NPD", "双向"]
    awareness_total = 0
    awareness_correct = 0
    for r in records:
        text = r.ai_feedback or ""
        if any(k in text for k in awareness_keys):
            awareness_total += 1
            if r.is_correct:
                awareness_correct += 1
    if awareness_total > 0:
        self_awareness = int((awareness_correct / awareness_total) * 100)
    else:
        self_awareness = int(base_acc * 90 + 5)
    self_awareness = _clamp(self_awareness)

    risk_keys = ["暗贬", "操控", "煤气灯", "三角", "冷战", "间歇性", "未来伪造", "打压", "贬低"]
    risk_total = 0
    risk_correct = 0
    for r in records:
        text = r.ai_feedback or ""
        if any(k in text for k in risk_keys):
            risk_total += 1
            if r.is_correct:
                risk_correct += 1
    if risk_total > 0:
        risk_detection = int((risk_correct / risk_total) * 100)
    else:
        risk_detection = int(base_acc * 85 + 10)
    risk_detection = _clamp(risk_detection)

    return schemas.RadarData(
        empathy=empathy,
        boundary=boundary,
        communication=communication,
        self_awareness=self_awareness,
        risk_detection=risk_detection,
    )


def _generate_summary(primary: str, secondary: str, score: int) -> str:
    if score >= 80:
        tmpl = random.choice(SUMMARY_TEMPLATES_HIGH)
    elif score >= 50:
        tmpl = random.choice(SUMMARY_TEMPLATES_MID)
    else:
        tmpl = random.choice(SUMMARY_TEMPLATES_LOW)
    return tmpl.format(primary=primary, secondary=secondary, score=score)


def _generate_strengths(radar: schemas.RadarData) -> list[str]:
    dims = [
        ("empathy", radar.empathy),
        ("boundary", radar.boundary),
        ("communication", radar.communication),
        ("self_awareness", radar.self_awareness),
        ("risk_detection", radar.risk_detection),
    ]
    dims.sort(key=lambda x: x[1], reverse=True)
    count = 2 if dims[1][1] < 70 else 3
    strengths = []
    for k, v in dims[:count]:
        if v >= 60:
            strengths.append(STRENGTH_MAP[k])
    if len(strengths) < 2:
        for k, v in dims:
            if len(strengths) >= 2:
                break
            if STRENGTH_MAP[k] not in strengths:
                strengths.append(STRENGTH_MAP[k])
    return strengths


def _generate_weaknesses(radar: schemas.RadarData) -> list[str]:
    dims = [
        ("empathy", radar.empathy),
        ("boundary", radar.boundary),
        ("communication", radar.communication),
        ("self_awareness", radar.self_awareness),
        ("risk_detection", radar.risk_detection),
    ]
    dims.sort(key=lambda x: x[1])
    weaknesses = []
    for k, v in dims:
        if v < 60:
            weaknesses.append(WEAKNESS_MAP[k])
    if len(weaknesses) < 1:
        weaknesses.append(WEAKNESS_MAP[dims[0][0]])
    if len(weaknesses) > 2:
        weaknesses = weaknesses[:2]
    return weaknesses


def _generate_advice(radar: schemas.RadarData) -> str:
    dims = [
        ("empathy", radar.empathy),
        ("boundary", radar.boundary),
        ("communication", radar.communication),
        ("self_awareness", radar.self_awareness),
        ("risk_detection", radar.risk_detection),
    ]
    dims.sort(key=lambda x: x[1])
    lowest_key = dims[0][0]
    base = "建立健康关系是一个持续练习的过程，不要因为一次结果否定自己。"
    specific = ADVICE_MAP[lowest_key]
    combined = base + specific
    if len(combined) > 100:
        combined = combined[:100]
    return combined


def _generate_key_learnings(records) -> list[str]:
    seen = set()
    learnings = []
    for r in records:
        text = r.ai_feedback or ""
        if not text:
            continue
        text = text.strip()
        if len(text) > 30:
            text = text[:30]
        if len(text) < 10:
            continue
        if text not in seen:
            seen.add(text)
            learnings.append(text)
        if len(learnings) >= 5:
            break
    fallbacks = [
        "识别暗贬操控：表面赞美实则隐含贬低，建立不平等的评价关系。",
        "煤气灯效应：系统性否认事实，让你丧失对自身感知的信任。",
        "边界建立：健康的边界不需要理由，不需要解释，不需要道歉。",
        "间歇性强化：先极致痛苦再突然甜蜜，形成创伤性联结的关键。",
        "三角操控：故意引入第三方制造嫉妒，提升自己议价权。",
    ]
    for fb in fallbacks:
        if len(learnings) >= 3:
            break
        if fb not in seen:
            learnings.append(fb)
            seen.add(fb)
    return learnings


def _score_to_percentile(score: int) -> int:
    if score >= 100:
        p = 1
    elif score >= 95:
        p = 3
    elif score >= 90:
        p = 5
    elif score >= 85:
        p = 9
    elif score >= 80:
        p = 12
    elif score >= 75:
        p = 18
    elif score >= 70:
        p = 25
    elif score >= 65:
        p = 32
    elif score >= 60:
        p = 40
    elif score >= 55:
        p = 48
    elif score >= 50:
        p = 55
    elif score >= 40:
        p = 70
    elif score >= 30:
        p = 82
    elif score >= 20:
        p = 90
    elif score >= 10:
        p = 95
    else:
        p = 99
    return _clamp(p, 1, 99)


def _generate_global_correct_pct(record) -> int:
    text = record.ai_feedback or ""
    hard_terms = ["NPD", "双向", "红线", "煤气灯", "三角", "间歇性", "打压", "贬低"]
    if any(t in text for t in hard_terms):
        return random.randint(20, 35)
    medium_terms = ["边界", "操控", "冷读", "冷战", "情感绑架"]
    if any(t in text for t in medium_terms):
        return random.randint(45, 60)
    return random.randint(65, 80)


def _generate_choice_distribution(correct_pct: int, seed_val: int = 0):
    rng = random.Random(seed_val)
    correct_choice = rng.randint(0, 3)
    remaining = 100 - correct_pct
    others = [0, 0, 0]
    if remaining > 0:
        parts = []
        total = 0
        for i in range(2):
            p = rng.randint(1, max(1, remaining - total - (2 - i)))
            parts.append(p)
            total += p
        parts.append(remaining - total)
        rng.shuffle(parts)
        oi = 0
        for i in range(3):
            others[i] = parts[oi]
            oi += 1
    dist = {}
    other_idx = 0
    for i in range(4):
        if i == correct_choice:
            dist[str(i)] = correct_pct
        else:
            dist[str(i)] = others[other_idx]
            other_idx += 1
    return dist


@router.get("/report/{session_id}", response_model=schemas.ReportResponse)
def get_report(session_id: str, db: Session = Depends(get_db)):
    session = crud.get_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    records = crud.get_records_by_session(db, session_id)
    final_score = session.current_score
    total_q = len(records)
    correct_q = sum(1 for r in records if r.is_correct)
    accuracy = int((correct_q / total_q) * 100) if total_q > 0 else 0
    accuracy = _clamp(accuracy)

    stages_present = {r.stage for r in records if r.stage in STAGE_ORDER}
    stage_count = max(1, min(4, len(stages_present)))

    stage_breakdown = _calc_stage_breakdown(records)
    preset = _get_preset(db, session.preset_id)
    primary_tag = preset.primary_tag if preset else "NPD"
    secondary_tag = preset.secondary_tag if preset else "INTJ"

    radar_data = _calc_radar(records, primary_tag)
    summary = _generate_summary(primary_tag, secondary_tag, final_score)
    strengths = _generate_strengths(radar_data)
    weaknesses = _generate_weaknesses(radar_data)
    advice = _generate_advice(radar_data)
    key_learnings = _generate_key_learnings(records)

    return schemas.ReportResponse(
        session_id=session.session_id,
        final_score=final_score,
        accuracy=accuracy,
        stage_count=stage_count,
        stage_breakdown=stage_breakdown,
        radar_data=radar_data,
        summary=summary,
        strengths=strengths,
        weaknesses=weaknesses,
        advice=advice,
        key_learnings=key_learnings,
    )


@router.get("/stats/parallel/{session_id}", response_model=schemas.ParallelStatsResponse)
def get_parallel_stats(session_id: str, db: Session = Depends(get_db)):
    session = crud.get_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    records = crud.get_records_by_session(db, session_id)

    top_percentile = _score_to_percentile(session.current_score)
    total_players = 12847

    preset = _get_preset(db, session.preset_id)
    primary_tag = preset.primary_tag if preset else "NPD"
    radar_data = _calc_radar(records, primary_tag)

    stage_breakdown = _calc_stage_breakdown(records)
    avg_rng = random.Random(hash(session_id) % 10000)
    average_scores: list[dict] = []
    running_score = 100
    for sb in stage_breakdown:
        if sb.total_count <= 0:
            continue
        running_score = _clamp(running_score + sb.score_change)
        global_avg = _clamp(55 + avg_rng.randint(-18, 12), 20, 85)
        average_scores.append({
            "stage": sb.stage_name_cn,
            "your_score": running_score,
            "global_avg": global_avg,
        })

    questions_comparison = []
    for idx, r in enumerate(records):
        qtext = r.question_text or ""
        if len(qtext) > 60:
            qtext = qtext[:60]
        global_correct_pct = _generate_global_correct_pct(r)
        choice_dist = _generate_choice_distribution(global_correct_pct, seed_val=idx + hash(session_id) % 10000)
        questions_comparison.append(schemas.QuestionComparison(
            question_index=r.question_index,
            question_text=qtext,
            is_correct=r.is_correct,
            global_correct_pct=_clamp(global_correct_pct, 5, 95),
            choice_distribution=choice_dist,
        ))

    higher_than_players = int(total_players * (100 - top_percentile) / 100)
    return schemas.ParallelStatsResponse(
        session_id=session.session_id,
        top_percentile=top_percentile,
        total_players=total_players,
        higher_than_players=higher_than_players,
        radar_data=radar_data,
        average_scores=average_scores,
        questions_comparison=questions_comparison,
    )

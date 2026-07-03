import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/game'
import { getReport, ReportResponse, ReportRadarData } from '../../services/game'
import './index.scss'

const mockReport: ReportResponse = {
  session_id: 'mock-session',
  final_score: 92,
  accuracy: 87,
  stage_count: 4,
  stage_breakdown: [
    { stage: '相识破冰', score: 24, correct_rate: 88, question_count: 8, correct_count: 7 },
    { stage: '暧昧试探', score: 22, correct_rate: 85, question_count: 8, correct_count: 7 },
    { stage: '热恋博弈', score: 23, correct_rate: 86, question_count: 8, correct_count: 7 },
    { stage: '长期承诺', score: 23, correct_rate: 88, question_count: 8, correct_count: 7 },
  ],
  radar_data: {
    empathy: 75,
    boundary: 90,
    communication: 80,
    self_awareness: 70,
    risk_detection: 85,
  },
  summary: '你在本次挑战中展现了极强的逻辑推理和情绪觉察能力。在边界管理维度上表现尤为突出，能够清晰识别有毒沟通模式并有效防御。建议在共情表达方面多加练习，尝试用更柔软的方式回应对方的情感需求。',
  strengths: [
    '边界感极强，能够清晰识别并拒绝越界行为',
    '风险识别敏锐，对隐蔽操控模式有很好的判断力',
    '沟通逻辑清晰，表达策略具有结构性',
  ],
  weaknesses: [
    '共情表达偏理性，情感连接感可以更柔软',
    '自我觉察在压力场景下稍显滞后',
  ],
  advice: '建议在接下来的 21 天中，每天花 10 分钟进行情绪复盘练习。当对方表达情感需求时，先给予情感认同（我理解你的感受）再提出解决方案，这样可以显著提升亲密关系中的安全感和连接感。',
  key_learnings: [
    '煤气灯效应的识别：当对方反复否定你的记忆和感受时要警觉',
    '爱情轰炸不是爱：过度的赞美和礼物常常是操控的序曲',
    '沉没成本不影响决策：已经投入的时间不应成为留下的理由',
    '灰度思维：人和关系不是非黑即白，允许中间状态存在',
  ],
}

const DIMENSION_LABELS = ['共情力', '沟通力', '边界感', '自我觉察', '风险识别']
const DIMENSION_COLORS = ['#5B7FFF', '#30D158', '#FF9F0A', '#AF52DE', '#FF3B30']
const DIMENSION_KEYS: Array<keyof ReportRadarData> = ['empathy', 'communication', 'boundary', 'self_awareness', 'risk_detection']

function pentagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 5; i++) {
    const angleDeg = 90 - i * 72
    const angleRad = (angleDeg * Math.PI) / 180
    const x = cx + r * Math.cos(angleRad)
    const y = cy - r * Math.sin(angleRad)
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

function radarDataPoints(cx: number, cy: number, r: number, data: ReportRadarData): string {
  const pts: string[] = []
  for (let i = 0; i < 5; i++) {
    const key = DIMENSION_KEYS[i]
    const value = data[key]
    const rr = (r * value) / 100
    const angleDeg = 90 - i * 72
    const angleRad = (angleDeg * Math.PI) / 180
    const x = cx + rr * Math.cos(angleRad)
    const y = cy - rr * Math.sin(angleRad)
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

function radarDataCircles(cx: number, cy: number, r: number, data: ReportRadarData): Array<{ cx: number; cy: number }> {
  const result: Array<{ cx: number; cy: number }> = []
  for (let i = 0; i < 5; i++) {
    const key = DIMENSION_KEYS[i]
    const value = data[key]
    const rr = (r * value) / 100
    const angleDeg = 90 - i * 72
    const angleRad = (angleDeg * Math.PI) / 180
    result.push({
      cx: cx + rr * Math.cos(angleRad),
      cy: cy - rr * Math.sin(angleRad),
    })
  }
  return result
}

function axisEndpoints(cx: number, cy: number, r: number): Array<{ x2: number; y2: number }> {
  const result: Array<{ x2: number; y2: number }> = []
  for (let i = 0; i < 5; i++) {
    const angleDeg = 90 - i * 72
    const angleRad = (angleDeg * Math.PI) / 180
    result.push({
      x2: cx + r * Math.cos(angleRad),
      y2: cy - r * Math.sin(angleRad),
    })
  }
  return result
}

function labelPositions(cx: number, cy: number, r: number): Array<{ x: number; y: number; anchor: string; dy?: string }> {
  const offset = 20
  const positions: Array<{ x: number; y: number; anchor: string; dy?: string }> = []
  for (let i = 0; i < 5; i++) {
    const angleDeg = 90 - i * 72
    const angleRad = (angleDeg * Math.PI) / 180
    const lr = r + offset
    const x = cx + lr * Math.cos(angleRad)
    const y = cy - lr * Math.sin(angleRad)
    let anchor = 'middle'
    let dy: string | undefined
    if (i === 0) { anchor = 'middle'; dy = '-4px' }
    else if (i === 1) { anchor = 'start' }
    else if (i === 2) { anchor = 'start' }
    else if (i === 3) { anchor = 'end' }
    else if (i === 4) { anchor = 'end' }
    positions.push({ x, y, anchor, dy })
  }
  return positions
}

export default function ReportPage() {
  const sessionId = useGameStore((s) => s.sessionId)
  const primaryTag = useGameStore((s) => s.primaryTag)
  const secondaryTag = useGameStore((s) => s.secondaryTag)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<ReportResponse>(mockReport)

  const applyDefaults = (raw: ReportResponse): ReportResponse => {
    const radar = raw.radar_data || mockReport.radar_data
    return {
      session_id: raw.session_id || mockReport.session_id,
      final_score: typeof raw.final_score === 'number' ? raw.final_score : mockReport.final_score,
      accuracy: typeof raw.accuracy === 'number' ? raw.accuracy : mockReport.accuracy,
      stage_count: typeof raw.stage_count === 'number' ? raw.stage_count : mockReport.stage_count,
      stage_breakdown: Array.isArray(raw.stage_breakdown) ? raw.stage_breakdown : mockReport.stage_breakdown,
      radar_data: {
        empathy: typeof radar.empathy === 'number' ? radar.empathy : mockReport.radar_data.empathy,
        boundary: typeof radar.boundary === 'number' ? radar.boundary : mockReport.radar_data.boundary,
        communication: typeof radar.communication === 'number' ? radar.communication : mockReport.radar_data.communication,
        self_awareness: typeof radar.self_awareness === 'number' ? radar.self_awareness : mockReport.radar_data.self_awareness,
        risk_detection: typeof radar.risk_detection === 'number' ? radar.risk_detection : mockReport.radar_data.risk_detection,
      },
      summary: raw.summary || mockReport.summary,
      strengths: Array.isArray(raw.strengths) && raw.strengths.length > 0 ? raw.strengths : mockReport.strengths,
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : mockReport.weaknesses,
      advice: raw.advice || mockReport.advice,
      key_learnings: Array.isArray(raw.key_learnings) ? raw.key_learnings : mockReport.key_learnings,
    }
  }

  const loadReport = async (sid: string) => {
    try {
      setLoading(true)
      const data = await getReport(sid)
      setReport(applyDefaults(data))
    } catch (e) {
      console.error('loadReport error', e)
      setReport(mockReport)
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    if (sessionId) {
      loadReport(sessionId)
    } else {
      setLoading(false)
      setReport(mockReport)
    }
  })

  useEffect(() => {
    if (sessionId) {
      loadReport(sessionId)
    } else {
      setLoading(false)
      setReport(mockReport)
    }
  }, [])

  const handleBack = () => Taro.navigateBack({ delta: 1 }).catch(() => {})
  const handleShare = () => Taro.showToast({ title: '分享功能开发中', icon: 'none' })
  const handleParallel = () => Taro.navigateTo({ url: '/pages/parallel/index' })
  const handleKnowledge = () => Taro.navigateTo({ url: '/pages/knowledge/index' })

  const cx = 160
  const cy = 160
  const r = 120
  const outerPts = pentagonPoints(cx, cy, r)
  const midPts = pentagonPoints(cx, cy, r * 0.5)
  const innerPts = pentagonPoints(cx, cy, r * 0.2)
  const dataPts = radarDataPoints(cx, cy, r, report.radar_data)
  const dataCircles = radarDataCircles(cx, cy, r, report.radar_data)
  const axes = axisEndpoints(cx, cy, r)
  const labels = labelPositions(cx, cy, r)

  return (
    <View className="page-report">
      <View className="nav-bar">
        <View className="nav-back" onClick={handleBack}>返回</View>
        <View className="nav-title">知识复盘报告</View>
        <View className="nav-share" onClick={handleShare}>分享</View>
      </View>

      <View className="page-title">知识复盘报告</View>

      <View className="tag-row">
        <View className="green-badge">✅ 模拟完成</View>
      </View>
      <View className="tag-row subtitle-row">
        <Text className="subtitle-text">🎭 {primaryTag || 'NPD'} · {secondaryTag || 'INTJ'}</Text>
      </View>

      <View className="ai-card">
        <View className="ai-header">
          <View className="ai-blue-badge">AI</View>
          <Text className="ai-header-text">智能分析师 · AI 生成</Text>
        </View>
        <View className="ai-summary-title">总结</View>
        <View className="ai-summary-text">{report.summary}</View>
        <View className="ai-footer">GPT-mini</View>
      </View>

      <View className="stats-grid">
        <View className="stat-card">
          <View className="stat-value stat-green">{report.final_score}</View>
          <View className="stat-label">最终自尊值</View>
        </View>
        <View className="stat-card">
          <View className="stat-value stat-blue">{report.accuracy}%</View>
          <View className="stat-label">正确率</View>
        </View>
        <View className="stat-card">
          <View className="stat-value stat-purple">{report.stage_count}/4</View>
          <View className="stat-label">通关阶段</View>
        </View>
      </View>

      <View className="radar-section">
        <View className="radar-wrapper">
          <svg viewBox="0 0 320 320" width="320" height="320">
            <polygon points={innerPts} stroke="#E5E5EA" fill="none" strokeWidth="1" />
            <polygon points={midPts} stroke="#E5E5EA" fill="none" strokeWidth="1" />
            <polygon points={outerPts} stroke="#E5E5EA" fill="none" strokeWidth="1" />
            {axes.map((a, i) => (
              <line key={`axis-${i}`} x1={cx} y1={cy} x2={a.x2} y2={a.y2} stroke="#E5E5EA" strokeWidth="1" />
            ))}
            <polygon
              points={dataPts}
              fill="rgba(0,122,255,0.12)"
              stroke="#007AFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {dataCircles.map((c, i) => (
              <circle key={`dot-${i}`} cx={c.cx} cy={c.cy} r="4" fill="#007AFF" stroke="#FFFFFF" strokeWidth="2" />
            ))}
            {labels.map((l, i) => {
              const key = DIMENSION_KEYS[i]
              return (
                <g key={`label-${i}`}>
                  <text
                    x={l.x}
                    y={l.y}
                    textAnchor={l.anchor}
                    fontSize="12"
                    fill="#8E8E93"
                    fontWeight="500"
                    dy={l.dy}
                  >
                    {DIMENSION_LABELS[i]}
                  </text>
                  <text
                    x={l.x}
                    y={l.y}
                    textAnchor={l.anchor}
                    fontSize="13"
                    fill="#1C1C1E"
                    fontWeight="700"
                    dy={(l.dy ? l.dy : '14px')}
                  >
                    {report.radar_data[key]}
                  </text>
                </g>
              )
            })}
          </svg>
        </View>
      </View>

      <View className="dimension-list">
        {DIMENSION_LABELS.map((name, i) => {
          const key = DIMENSION_KEYS[i]
          const val = report.radar_data[key]
          return (
            <View key={`dim-${i}`} className="dim-row">
              <View className="dim-name">{name}</View>
              <View className="dim-bar">
                <View
                  className="dim-fill"
                  style={{ width: `${val}%`, background: DIMENSION_COLORS[i] }}
                />
              </View>
              <View className="dim-value">{val}/100</View>
            </View>
          )
        })}
      </View>

      <View className="info-card strengths-card">
        <View className="info-header">
          <View className="info-icon-box strengths-icon">💪</View>
          <View className="info-title strengths-title">强项</View>
        </View>
        <View className="info-list">
          {report.strengths.map((s, i) => (
            <View key={`str-${i}`} className="info-item">
              <Text className="bullet">•</Text>
              <Text className="info-text">{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="info-card weaknesses-card">
        <View className="info-header">
          <View className="info-icon-box weaknesses-icon">⚠️</View>
          <View className="info-title weaknesses-title">弱项</View>
        </View>
        <View className="info-list">
          {report.weaknesses.map((s, i) => (
            <View key={`weak-${i}`} className="info-item">
              <Text className="bullet">•</Text>
              <Text className="info-text">{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="info-card learnings-card">
        <View className="info-header">
          <View className="info-icon-box learnings-icon">💡</View>
          <View className="info-title learnings-title">核心要点</View>
        </View>
        <View className="info-list">
          {report.key_learnings.map((s, i) => (
            <View key={`learn-${i}`} className="info-item">
              <Text className="bullet-number">{i + 1}.</Text>
              <Text className="info-text">{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="info-card advice-card">
        <View className="info-header">
          <View className="info-icon-box advice-icon">🎯</View>
          <View className="info-title advice-title">建议</View>
        </View>
        <View className="advice-text">{report.advice}</View>
      </View>

      <View className="btn-group">
        <View className="btn btn-primary" onClick={handleParallel}>
          查看平行宇宙排名 →
        </View>
        <View className="btn btn-secondary" onClick={handleKnowledge}>
          核心知识点总结
        </View>
      </View>
    </View>
  )
}

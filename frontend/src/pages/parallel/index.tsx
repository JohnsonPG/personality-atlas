import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/game'
import { getParallel, ParallelResponse, ReportRadarData } from '../../services/game'
import './index.scss'

const mockParallel: ParallelResponse = {
  session_id: 'mock-session',
  top_percentile: 12,
  total_players: 10347,
  higher_than_players: 9105,
  radar_data: {
    empathy: 75,
    boundary: 90,
    communication: 80,
    self_awareness: 70,
    risk_detection: 85,
  },
  average_scores: [
    { stage: '相识破冰', your_score: 88, global_avg: 62 },
    { stage: '暧昧试探', your_score: 85, global_avg: 58 },
    { stage: '热恋博弈', your_score: 86, global_avg: 54 },
    { stage: '长期承诺', your_score: 88, global_avg: 51 },
  ],
  questions_comparison: [
    { question_index: 1, is_correct: true, global_correct_pct: 45 },
    { question_index: 2, is_correct: true, global_correct_pct: 38 },
    { question_index: 3, is_correct: false, global_correct_pct: 28 },
    { question_index: 4, is_correct: true, global_correct_pct: 52 },
    { question_index: 5, is_correct: false, global_correct_pct: 22 },
    { question_index: 6, is_correct: true, global_correct_pct: 61 },
    { question_index: 7, is_correct: true, global_correct_pct: 33 },
    { question_index: 8, is_correct: false, global_correct_pct: 19 },
  ],
}

const DIMENSION_LABELS = ['共情力', '沟通力', '边界感', '自我觉察', '风险识别']
const DIMENSION_KEYS: Array<keyof ReportRadarData> = ['empathy', 'communication', 'boundary', 'self_awareness', 'risk_detection']
const GLOBAL_AVG: ReportRadarData = {
  empathy: 58,
  boundary: 48,
  communication: 52,
  self_awareness: 55,
  risk_detection: 49,
}

const QUESTION_TEXTS = [
  '当对方贬低你的爱好时，最恰当的应对策略是？',
  'NPD 三角关系中，"拯救者"角色的本质动机是什么？',
  '以下哪种行为不属于"隐蔽操控"的范畴？',
  '在面对"沉默对待"时，推荐的最佳应对方式是？',
  'INTJ 型人格在情感关系中最容易陷入的陷阱是？',
  '"爱情轰炸"行为最核心的危险信号是？',
  '关于健康边界，以下哪种描述是正确的？',
  '当对方说"你太敏感了"时，这属于哪种操控模式？',
]

export default function ParallelPage() {
  const sessionId = useGameStore((s) => s.sessionId)
  const [loading, setLoading] = useState(true)
  const [parallel, setParallel] = useState<ParallelResponse>(mockParallel)

  const applyDefaults = (raw: ParallelResponse): ParallelResponse => {
    const radar = raw.radar_data || mockParallel.radar_data
    return {
      session_id: raw.session_id || mockParallel.session_id,
      top_percentile: typeof raw.top_percentile === 'number' ? raw.top_percentile : mockParallel.top_percentile,
      total_players: typeof raw.total_players === 'number' ? raw.total_players : mockParallel.total_players,
      higher_than_players: typeof raw.higher_than_players === 'number' ? raw.higher_than_players : mockParallel.higher_than_players,
      radar_data: {
        empathy: typeof radar.empathy === 'number' ? radar.empathy : mockParallel.radar_data.empathy,
        boundary: typeof radar.boundary === 'number' ? radar.boundary : mockParallel.radar_data.boundary,
        communication: typeof radar.communication === 'number' ? radar.communication : mockParallel.radar_data.communication,
        self_awareness: typeof radar.self_awareness === 'number' ? radar.self_awareness : mockParallel.radar_data.self_awareness,
        risk_detection: typeof radar.risk_detection === 'number' ? radar.risk_detection : mockParallel.radar_data.risk_detection,
      },
      average_scores: Array.isArray(raw.average_scores) ? raw.average_scores : mockParallel.average_scores,
      questions_comparison: Array.isArray(raw.questions_comparison) ? raw.questions_comparison : mockParallel.questions_comparison,
    }
  }

  const loadParallel = async (sid: string) => {
    try {
      setLoading(true)
      const data = await getParallel(sid)
      setParallel(applyDefaults(data))
    } catch (e) {
      console.error('loadParallel error', e)
      setParallel(mockParallel)
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    if (sessionId) {
      loadParallel(sessionId)
    } else {
      setLoading(false)
      setParallel(mockParallel)
    }
  })

  useEffect(() => {
    if (sessionId) {
      loadParallel(sessionId)
    } else {
      setLoading(false)
      setParallel(mockParallel)
    }
  }, [])

  const handleBack = () => Taro.navigateBack({ delta: 1 }).catch(() => {})
  const handleShare = () => Taro.showToast({ title: '分享功能开发中', icon: 'none' })
  const handleGenPoster = () => Taro.showToast({ title: '生成分享海报开发中', icon: 'none' })

  const formatNumber = (n: number) => n.toLocaleString('en-US')

  return (
    <View className="page-parallel">
      <View className="nav-bar">
        <View className="nav-back" onClick={handleBack}>← 返回报告</View>
        <View className="nav-share" onClick={handleShare}>分享</View>
      </View>

      <View className="page-title">平行宇宙数据对比</View>
      <View className="page-subtitle">
        {formatNumber(parallel.total_players)} 位玩家 · 同一人格副本
      </View>

      <View className="top-percentile-card">
        <View className="top-percentile-value">Top {parallel.top_percentile}%</View>
        <View className="top-percentile-label">你超过了全球</View>
        <View className="top-percentile-subs">
          <View className="sub-line">{formatNumber(parallel.total_players)} 位玩家</View>
          <View className="sub-line">{formatNumber(parallel.higher_than_players)} 位不如你</View>
        </View>
      </View>

      <View className="section-title">五维能力对比</View>

      <View className="dim-compare-list">
        {DIMENSION_LABELS.map((name, i) => {
          const key = DIMENSION_KEYS[i]
          const yourVal = parallel.radar_data[key]
          const avgVal = GLOBAL_AVG[key]
          return (
            <View key={`dmc-${i}`} className="dim-compare-item">
              <View className="dim-compare-name">{name}</View>
              <View className="dim-compare-bars">
                <View className="compare-row">
                  <View className="compare-label you-label">你 {yourVal}</View>
                  <View className="compare-bar">
                    <View className="compare-fill you-fill" style={{ width: `${yourVal}%` }} />
                  </View>
                </View>
                <View className="compare-row">
                  <View className="compare-label avg-label">Avg {avgVal}</View>
                  <View className="compare-bar">
                    <View className="compare-fill avg-fill" style={{ width: `${avgVal}%` }} />
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      <View className="section-title">阶段得分对比</View>

      <View className="stage-compare-card">
        {parallel.average_scores.map((s, i) => (
          <View key={`stg-${i}`} className="stage-compare-row">
            <View className="stage-name">{s.stage}</View>
            <View className="stage-bars">
              <View className="stage-bar-row">
                <View className="stage-bar-fill you-fill" style={{ width: `${s.your_score}%` }} />
                <View className="stage-bar-val you-val">{s.your_score}</View>
              </View>
              <View className="stage-bar-row">
                <View className="stage-bar-fill avg-fill" style={{ width: `${s.global_avg}%` }} />
                <View className="stage-bar-val avg-val">{s.global_avg}</View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="section-title">题目表现对比</View>

      {parallel.questions_comparison.map((qc, i) => {
        const qText = QUESTION_TEXTS[qc.question_index - 1] || `题目 ${qc.question_index}`
        const pct = qc.global_correct_pct
        const fillColor = pct <= 40 ? '#FF3B30' : '#34C759'
        return (
          <View key={`qc-${i}`} className="question-card">
            <View className="question-text">
              Q{qc.question_index} · {qText}
            </View>
            <View className="question-progress">
              <View
                className="question-progress-fill"
                style={{ width: `${pct}%`, background: fillColor }}
              />
            </View>
            <View className="question-meta">
              <View className={`tag-result ${qc.is_correct ? 'tag-correct' : 'tag-wrong'}`}>
                {qc.is_correct ? '你 ✓' : '你 ✗'}
              </View>
              <View className="tag-dot">·</View>
              <View className="tag-global">全球仅 {pct}% 做对</View>
            </View>
          </View>
        )
      })}

      <View className="share-card">
        <View className="share-icon">📢</View>
        <View className="share-text">
          分享到朋友圈，告诉朋友你在人格图鉴中战胜了 {formatNumber(parallel.higher_than_players)} 人
        </View>
        <View className="share-btn" onClick={handleGenPoster}>
          生成分享海报（开发中）
        </View>
      </View>
    </View>
  )
}

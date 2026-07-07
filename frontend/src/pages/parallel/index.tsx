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

      <View className="top-stat-card">
        <View className="top-stat-value">Top {parallel.top_percentile}%</View>
        <View className="top-stat-label">你超过了全球 {formatNumber(parallel.higher_than_players)} 位玩家</View>
        <View className="top-stat-subtitle">共 {formatNumber(parallel.total_players)} 位同人格副本玩家参与</View>
      </View>

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

import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

const SEGMENTS = ['全部', '已通过', '失败']

const MOCK_RECORDS = [
  {
    id: 'r1',
    title: 'NPD + INTJ',
    tags: [
      { key: 'npd', label: 'NPD' },
      { key: 'strategic', label: '策略型' },
    ],
    meta: '4 阶段通关 · 2 小时前',
    score: 92,
    scoreLabel: '自尊值',
    passed: true,
  },
  {
    id: 'r2',
    title: 'NPD + ENFP',
    tags: [
      { key: 'npd', label: 'NPD' },
      { key: 'healthy', label: '高共情' },
    ],
    meta: '冲突阶段阵亡 · 昨天 21:38',
    score: 34,
    scoreLabel: '自尊值',
    passed: false,
  },
  {
    id: 'r3',
    title: '双向 + ISFJ',
    tags: [
      { key: 'dual', label: '双向' },
      { key: 'healthy', label: '守卫者' },
    ],
    meta: '4 阶段通关 · 前天',
    score: 88,
    scoreLabel: '自尊值',
    passed: true,
  },
  {
    id: 'r4',
    title: 'NPD + ISTP',
    tags: [
      { key: 'npd', label: 'NPD' },
      { key: 'strategic', label: '鉴赏家' },
    ],
    meta: '热恋阶段阵亡 · 07-05',
    score: 12,
    scoreLabel: '自尊值',
    passed: false,
  },
]

export default function ReviewCenterPage() {
  const [segment, setSegment] = useState(0)

  const handleBack = () => {
    Taro.navigateBack({ delta: 1 }).catch(() => {
      Taro.reLaunch({ url: '/pages/home/index' })
    })
  }

  const handleRecord = (id: string) => {
    Taro.navigateTo({ url: '/pages/report/index' })
  }

  const handleNewGame = () => {
    Taro.reLaunch({ url: '/pages/home/index' })
  }

  const handleProfile = () => {
    Taro.navigateTo({ url: '/pages/profile/index' })
  }

  const filtered = MOCK_RECORDS.filter(r => {
    if (segment === 0) return true
    if (segment === 1) return r.passed
    return !r.passed
  })

  return (
    <View className="screen-review">
      <View className="review-nav">
        <View className="nav-back" onClick={handleBack}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <Text>返回</Text>
        </View>
        <View className="nav-placeholder" />
        <View className="nav-profile" onClick={handleProfile}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </View>
      </View>

      <View className="large-title">复盘中心</View>

      <View className="segmented-control">
        <View
          className="segment-slider"
          style={{ transform: `translateX(${segment * 100}%)` }}
        />
        {SEGMENTS.map((s, i) => (
          <View
            key={s}
            className={`segment ${segment === i ? 'active' : ''}`}
            onClick={() => setSegment(i)}
          >
            {s}
          </View>
        ))}
      </View>

      <View className="record-list">
        {filtered.map((r) => (
          <View
            key={r.id}
            className="record-card"
            onClick={() => handleRecord(r.id)}
          >
            <View className={`record-icon ${r.passed ? 'pass' : 'fail'}`}>
              {r.passed ? (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#34C759">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#FF3B30">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              )}
            </View>
            <View className="record-info">
              <View className="record-title">{r.title}</View>
              <View className="record-meta">
                {r.tags.map((t) => (
                  <Text key={t.key} className={`tag-pill ${t.key}`}>
                    {t.label}
                  </Text>
                ))}
                <Text className="meta-dot">·</Text>
                <Text>{r.meta}</Text>
              </View>
            </View>
            <View className="record-score-wrap">
              <View className={`record-score ${r.passed ? 'high' : 'low'}`}>
                {r.score}
              </View>
              <View className="record-score-label">{r.scoreLabel}</View>
            </View>
          </View>
        ))}
      </View>

      <View className="bottom-actions">
        <View className="btn-gray" onClick={handleProfile}>
          查看个人成长
        </View>
        <View className="btn-blue" onClick={handleNewGame}>
          + 开始新挑战
        </View>
      </View>
    </View>
  )
}

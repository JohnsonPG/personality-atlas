import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

const PAGES = [
  {
    emoji: (
      <svg viewBox="0 0 24 24" width="64" height="64" fill="#007AFF">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    title: '低成本的情感试错',
    desc: '我们用高度还原的剧情，让你在安全的虚拟环境中识别操控者、练习边界设置。所有选择都不会影响真实世界。',
    accent: 'blue',
  },
  {
    emoji: (
      <svg viewBox="0 0 24 24" width="64" height="64" fill="#AF52DE">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    ),
    title: '心理学知识可操作化',
    desc: '每一个剧情节点都基于 DSM-5、依恋理论和 CBT 疗法编写，并配有专家级解析，让知识变成你的第一反应。',
    accent: 'purple',
  },
  {
    emoji: (
      <svg viewBox="0 0 24 24" width="64" height="64" fill="#34C759">
        <path d="M12,17.27L18.18,21l-1.64-7.03L22,9.24l-7.19-0.61L12,2L9.19,8.63L2,9.24l5.46,4.73L5.82,21L12,17.27z"/>
      </svg>
    ),
    title: '人格组合千人千面',
    desc: '23 种心理标签 × 16 型 MBTI × 4 阶段剧情引擎 = 每次挑战都是独一无二的博弈体验，持续进化你的「人际雷达」。',
    accent: 'green',
  },
]

export default function Onboarding2Page() {
  const [page, setPage] = useState(0)
  const current = PAGES[page]

  const handlePrev = () => {
    if (page > 0) setPage(page - 1)
  }

  const handleNext = () => {
    if (page < PAGES.length - 1) {
      setPage(page + 1)
    } else {
      Taro.reLaunch({ url: '/pages/home/index' })
    }
  }

  const handleSkip = () => {
    Taro.reLaunch({ url: '/pages/home/index' })
  }

  return (
    <View className="screen-15">
      <View className="blob-bg">
        <View className={`blob blob-a blob-${current.accent}`} />
        <View className={`blob blob-b blob-${current.accent}`} />
      </View>

      <View className="page-content">
        <View className="top-actions">
          <View className="skip-btn" onClick={handleSkip}>跳过</View>
        </View>

        <View className="hero-section">
          <View className={`emoji-big accent-${current.accent}`}>
            {current.emoji}
          </View>
          <View className="hero-title">{current.title}</View>
          <View className="hero-desc">{current.desc}</View>
        </View>

        <View className="page-dots">
          {PAGES.map((_, i) => (
            <View
              key={i}
              className={`page-dot ${i === page ? 'active' : ''}`}
            />
          ))}
        </View>

        <View className="cta-section">
          <View
            className={`nav-btn back ${page === 0 ? 'disabled' : ''}`}
            onClick={handlePrev}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </View>

          <View className="next-btn" onClick={handleNext}>
            {page === PAGES.length - 1 ? '开始旅程' : '下一页'}
            {page < PAGES.length - 1 && (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginLeft: 6 }}>
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

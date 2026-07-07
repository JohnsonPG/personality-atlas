import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useGameStore } from '../../store/game'
import './index.scss'

export default function DeathPage() {
  const score = useGameStore((s) => s.score)
  const lastExplanation = useGameStore((s) => s.lastExplanation)
  const reset = useGameStore((s) => s.reset)

  const warningText =
    (lastExplanation?.warning_signals && lastExplanation.warning_signals[0]) ||
    '你选择了直接迎合对方的贬低要求，导致自我价值系统被击穿。底线一旦被突破，后续的关系将充满压迫和不平等。'

  const psychologyText =
    lastExplanation?.psychological_impact ||
    '煤气灯效应（Gaslighting）：当一方长期通过否定你的感受、歪曲事实来让你怀疑自己的判断力时，你的自我认知会逐渐瓦解。这是情感虐待的典型形式，会导致焦虑、抑郁和自我价值感丧失。'

  const handleReport = () => {
    Taro.redirectTo({ url: '/pages/report/index' })
  }

  const handleRestart = () => {
    reset()
    Taro.reLaunch({ url: '/pages/home/index' })
  }

  return (
    <View className="screen-08">
      <View className="center-area">
        <View className="pill-badge redline-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#FF3B30">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          REDLINE 触发
        </View>

        <View className="heartbreak-icon">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="#FF3B30">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            <path d="M16.5 3c-.44 0-.89.08-1.32.23-.26.09-.5.22-.73.39l-.45.32-.45-.32c-.23-.17-.47-.3-.73-.39C12.39 3.08 11.94 3 11.5 3v.01L16.5 9l5-5.99v-.01C20.09 5.59 18.45 4 16.5 4z" opacity="0"/>
            <path d="M16.5 4L11.5 9v.01L16.5 3C14.07 3 12.17 4.53 11.5 6.7L11.5 9 16.5 4z" fill="#FFFFFF" opacity="0.4"/>
            <line x1="3" y1="21" x2="21" y2="3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </View>

        <View className="death-title">模拟结束</View>
        <View className="death-subtitle">你的自尊值降至危险阈值以下，本次恋爱模拟终止</View>

        <View className="score-bar-container">
          <View className="score-bar-label">
            <Text>自尊值</Text>
            <Text className="score-bar-value">{score} / 100</Text>
          </View>
          <View className="score-bar-bg">
            <View
              className="score-bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            />
          </View>
          <View className="score-bar-caption">底线崩塌 · 红线触发</View>
        </View>

        <View className="card reason-card">
          <View className="card-title card-title-red">💥 触发红线</View>
          <View className="card-body">{warningText}</View>
        </View>

        <View className="card knowledge-card">
          <View className="card-title card-title-blue">📘 心理学知识</View>
          <View className="card-body">{psychologyText}</View>
        </View>

        <View className="btn-group">
          <View className="btn btn-primary" onClick={handleReport}>
            查看完整报告
          </View>
          <View className="btn btn-secondary" onClick={handleRestart}>
            再来一局
          </View>
        </View>
      </View>
    </View>
  )
}

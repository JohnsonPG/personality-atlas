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
          ⚠ REDLINE 触发
        </View>

        <View className="heartbreak-icon">💔</View>

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

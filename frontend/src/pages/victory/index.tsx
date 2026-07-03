import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useGameStore } from '../../store/game'
import './index.scss'

const STAGE_NAMES = ['相识破冰', '暧昧试探', '热恋博弈', '长期承诺']
const STAGE_DETAILS = ['初次印象建立', '边界与信号解码', '冲突管理与妥协', '未来规划与信任深化']
const QUESTIONS_PER_STAGE = 8

function estimateStageScores(score: number, answers: Array<{ is_correct: boolean }>) {
  const stageScores: number[] = [0, 0, 0, 0]
  let runningTotal = 100

  for (let s = 0; s < 4; s++) {
    const startIdx = s * QUESTIONS_PER_STAGE
    const endIdx = Math.min(startIdx + QUESTIONS_PER_STAGE, answers.length)
    let stageDelta = 0

    for (let i = startIdx; i < endIdx; i++) {
      const a = answers[i]
      if (a?.is_correct) {
        const base = [7, 6, 5, 5][s] || 5
        stageDelta += base
      } else {
        const base = [5, 6, 7, 8][s] || 6
        stageDelta -= base
      }
    }

    if (s === 3 && answers.length < 32) {
      stageDelta = Math.round((score - runningTotal) / 2) || [24, 22, 23, 23][s]
    }

    if (stageDelta === 0) {
      stageDelta = [24, 22, 23, 23][s] || 22
    }

    stageScores[s] = stageDelta
    runningTotal += stageDelta
  }

  return stageScores
}

export default function VictoryPage() {
  const score = useGameStore((s) => s.score)
  const answers = useGameStore((s) => s.answers)
  const stageAccuracy = useGameStore((s) => s.stageAccuracy)

  const totalCorrect = answers.filter(a => a.is_correct).length
  const totalCount = Math.max(answers.length, 1)
  const accuracyPct = Math.round((totalCorrect / totalCount) * 100)

  const stageScores = estimateStageScores(score, answers)

  const handleReport = () => {
    Taro.redirectTo({ url: '/pages/report/index' })
  }

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' })
  }

  return (
    <View className="screen-09">
      <View className="center-area">
        <View className="victory-bg" />

        <View className="victory-content">
          <View className="pill-badge cleared-badge">
            ✅ ALL STAGES CLEARED
          </View>

          <View className="party-icon">🎉</View>

          <View className="victory-title">成功通关</View>
          <View className="victory-subtitle">恭喜！你已完美通过所有恋爱博弈阶段</View>

          <View className="card stats-card">
            <View className="stats-row">
              <View className="stat-col">
                <View className="stat-value stat-green">{score}</View>
                <View className="stat-label">最终得分</View>
              </View>
              <View className="stat-col">
                <View className="stat-value stat-blue">{accuracyPct}%</View>
                <View className="stat-label">正确率</View>
              </View>
              <View className="stat-col">
                <View className="stat-value stat-purple">4/4</View>
                <View className="stat-label">阶段通关</View>
              </View>
            </View>
          </View>

          <View className="card breakdown-card">
            <View className="breakdown-header">阶段详情</View>

            {STAGE_NAMES.map((name, i) => {
              const stageStart = i * QUESTIONS_PER_STAGE
              const stageEnd = Math.min(stageStart + QUESTIONS_PER_STAGE, answers.length)
              const stageAnswers = answers.slice(stageStart, stageEnd)
              const stageCorrect = stageAnswers.filter(a => a.is_correct).length
              const stageTotal = Math.max(stageAnswers.length, QUESTIONS_PER_STAGE)
              const acc = stageAccuracy[i]

              return (
                <View key={i} className="breakdown-row">
                  <View className="breakdown-check">
                    <svg viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2.5,7 5.5,10 11.5,4"
                        stroke="#34C759"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </View>
                  <View className="breakdown-info">
                    <View className="breakdown-name">{name}</View>
                    <View className="breakdown-detail">
                      {acc !== undefined ? `正确率 ${acc}%` : `正确 ${stageCorrect} / ${stageTotal} 题`}
                    </View>
                  </View>
                  <View className="breakdown-score">+{stageScores[i]}</View>
                </View>
              )
            })}
          </View>

          <View className="btn-group">
            <View className="btn btn-primary" onClick={handleReport}>
              查看完整报告
            </View>
            <View className="btn btn-secondary-outline" onClick={handleShare}>
              分享战绩
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useGameStore } from '../../store/game'
import './index.scss'

const STAGE_ORDER = ['meet', 'love', 'conflict', 'ending']
const PREV_STAGE_LABEL: Record<string, string> = {
  meet: '相识破冰阶段',
  love: '热恋升温阶段',
  conflict: '冲突爆发阶段',
  ending: '最终结局阶段',
}
const NEXT_STAGE_TITLE: Record<string, string> = {
  love: '热恋博弈',
  conflict: '冲突爆发',
  ending: '最终结局',
}
const NEXT_STAGE_SUBTITLE: Record<string, string> = {
  love: '进入更高难度的情感博弈挑战',
  conflict: '关系升温，边界面临考验',
  ending: '最后的考验，决定最终结局',
}
const STAGE_LABEL: Record<string, string> = {
  meet: '相识',
  love: '热恋',
  conflict: '冲突',
  ending: '结局',
}
const STAGE_DIFFICULTY: Record<string, number> = {
  love: 3,
  conflict: 4,
  ending: 5,
}

export default function TransitionPage() {
  const router = useRouter()
  const nextStage = router.params.next || 'love'
  const score = useGameStore((s) => s.score)
  const answers = useGameStore((s) => s.answers)

  const prevStageIndex = Math.max(0, STAGE_ORDER.indexOf(nextStage) - 1)
  const prevStageKey = STAGE_ORDER[prevStageIndex]

  const correctCount = answers.filter(a => a.is_correct).length
  const totalCount = Math.max(answers.length, 1)
  const accuracy = Math.round((correctCount / totalCount) * 100)

  const currentStageIndex = STAGE_ORDER.indexOf(nextStage)
  const difficulty = STAGE_DIFFICULTY[nextStage] ?? 3

  const handleClick = () => {
    useGameStore.setState({
      currentStage: nextStage,
      currentQuestionIndex: 0,
      questions: [],
      status: 'idle',
      selectedOption: null,
      scoreChange: null,
    })
    Taro.redirectTo({ url: '/pages/game/index' })
  }

  return (
    <View className="screen-07" onClick={handleClick}>
      <View className="center-area">
        <View className="prev-stage-label">
          「{PREV_STAGE_LABEL[prevStageKey]}」阶段完成
        </View>

        <svg className="arrow-icon" viewBox="0 0 32 32" fill="none">
          <path d="M16 6 L16 22" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 17 L16 23 L22 17" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <View className="new-stage-title">{NEXT_STAGE_TITLE[nextStage]}</View>
        <View className="new-stage-sub">{NEXT_STAGE_SUBTITLE[nextStage]}</View>

        <View className="progress-track">
          {STAGE_ORDER.map((stage, i) => {
            const isDone = i < currentStageIndex
            const isActive = i === currentStageIndex
            const nodeCls = isDone ? 'done' : isActive ? 'active' : 'pending'
            const connectorBefore = i > 0 ? (
              <View
                key={`c-${i}`}
                className={`progress-connector ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}
              />
            ) : null
            return (
              <>
                {connectorBefore}
                <View key={stage} className={`progress-node ${nodeCls}`}>
                  {isDone && (
                    <svg viewBox="0 0 14 14" fill="none">
                      <polyline points="2.5,7 5.5,10 11.5,4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                  {isActive && (
                    <svg viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="2.5" fill="#fff" stroke="none"/>
                    </svg>
                  )}
                </View>
                <View className={`node-label label-${nodeCls}`}>
                  {STAGE_LABEL[stage]}
                </View>
              </>
            )
          })}
        </View>

        <View className="card score-summary">
          <View className="score-col">
            <View className="score-value">{score}</View>
            <View className="score-label">自尊值</View>
          </View>
          <View className="score-col">
            <View className="score-value value-blue">{correctCount}/{totalCount}</View>
            <View className="score-label">上一阶段</View>
          </View>
          <View className="score-col">
            <View className="score-value value-green">{accuracy}%</View>
            <View className="score-label">正确率</View>
          </View>
        </View>

        <View className="difficulty-row">
          <span className="difficulty-label">难度</span>
          <View className="difficulty-dots">
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} className={`difficulty-dot ${i < difficulty ? 'filled' : ''}`} />
            ))}
          </View>
        </View>

        <View className="continue-hint">点击任意处继续</View>
      </View>
    </View>
  )
}

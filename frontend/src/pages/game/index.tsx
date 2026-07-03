import { useEffect, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useGameStore } from '../../store/game'
import { nextStage } from '../../services/game'
import sceneMeet from '../../assets/scene-meet.jpg'
import sceneLove from '../../assets/scene-love.jpg'
import sceneConflict from '../../assets/scene-conflict.jpg'
import sceneRedline from '../../assets/scene-redline.jpg'
import './index.scss'

const STAGE_ORDER = ['meet', 'love', 'conflict', 'ending']
const STAGE_LABEL: Record<string, string> = {
  meet: '相识',
  love: '热恋',
  conflict: '冲突',
  ending: '结局',
}

function getSceneImage(stage: string, _sceneImage: string) {
  switch (stage) {
    case 'meet': return sceneMeet
    case 'love': return sceneLove
    case 'conflict': return sceneConflict
    case 'ending': return sceneRedline
    default: return sceneMeet
  }
}

function getScoreBarGradient(score: number) {
  if (score >= 70) return 'linear-gradient(90deg,#34C759,#30D158,#34C759)'
  if (score >= 30) return 'linear-gradient(90deg,#FF9500,#FFCC00)'
  return 'linear-gradient(90deg,#FF3B30,#FF453A,#FF3B30)'
}

export default function GamePage() {
  const status = useGameStore((s) => s.status)
  const startSession = useGameStore((s) => s.startSession)
  const questions = useGameStore((s) => s.questions)
  const currentQuestionIndex = useGameStore((s) => s.currentQuestionIndex)
  const currentStage = useGameStore((s) => s.currentStage)
  const score = useGameStore((s) => s.score)
  const scoreChange = useGameStore((s) => s.scoreChange)
  const selectedOption = useGameStore((s) => s.selectedOption)
  const setSelectedOption = useGameStore((s) => s.setSelectedOption)
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const advanceStage = useGameStore((s) => s.advanceStage)
  const lastIsCorrect = useGameStore((s) => s.lastIsCorrect)
  const lastExplanation = useGameStore((s) => s.lastExplanation)
  const stageAccuracy = useGameStore((s) => s.stageAccuracy)

  const question = questions[currentQuestionIndex]

  const sessionId = useGameStore((s) => s.sessionId)

  useEffect(() => {
    const gameStore = useGameStore.getState()
    if (gameStore.status === 'idle' && !gameStore.sessionId) {
      gameStore.startSession()
    } else if (gameStore.status === 'idle' && gameStore.sessionId && gameStore.questions.length === 0) {
      ;(async () => {
        try {
          const res = await nextStage(gameStore.sessionId)
          useGameStore.setState({
            currentStage: res.stage,
            questions: res.questions,
            currentQuestionIndex: 0,
            scoreChange: null,
            status: 'playing',
            selectedOption: null,
          })
        } catch (e) {
          console.error(e)
          Taro.showToast({ title: '加载失败', icon: 'none' })
        }
      })()
    }
    // eslint-disable-next-line
  }, [])

  const stageIndex = useMemo(() => {
    const idx = STAGE_ORDER.indexOf(currentStage)
    return idx >= 0 ? idx : 0
  }, [currentStage])

  const handleOptionClick = (idx: number) => {
    if (status !== 'playing') return
    setSelectedOption(idx)
    submitAnswer(idx)
  }

  const totalQuestions = questions.length
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1
  const isGameOver = status === 'feedback' && score <= 0

  let btnText = '继续下一题 →'
  if (isLastQuestion) btnText = '完成本阶段 →'
  if (isGameOver) btnText = '查看结局...'

  return (
    <View className="screen-game">
      {status === 'loading' && (
        <View className="game-loading">
          <View className="ai-spinner" />
          <Text className="ai-loading-text">正在生成剧本...</Text>
        </View>
      )}

      {status !== 'loading' && question && (
        <View className="game-scroll">
          <View className="game-top-bar">
            <View
              className="nav-back"
              onClick={() => {
                Taro.navigateBack().catch(() => {
                  Taro.reLaunch({ url: '/pages/home/index' })
                })
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </View>
            <View className="stage-pill">
              <Text>{STAGE_LABEL[currentStage] || '相识'} · 第 {currentQuestionIndex + 1}/{totalQuestions} 题</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          <View className="game-scene-wrap">
            <Image
              className="game-scene-img"
              src={getSceneImage(question.stage, question.scene_image)}
              mode="aspectFill"
            />
          </View>

          <View className="game-score-area">
            <View className="game-score-row">
              <Text className="game-score-label">自尊值</Text>
              <View className="game-score-right">
                {scoreChange !== null && scoreChange !== undefined && (
                  <View className={`game-score-change ${scoreChange >= 0 ? 'positive' : 'negative'}`}>
                    <Text>{scoreChange >= 0 ? '+' : ''}{scoreChange}</Text>
                  </View>
                )}
                <Text className="game-score-value">{score}</Text>
              </View>
            </View>
            <View className="game-score-bar">
              <View
                className="game-score-fill"
                style={{
                  width: `${Math.max(0, Math.min(100, score))}%`,
                  background: getScoreBarGradient(score),
                }}
              />
            </View>
          </View>

          <View className="game-stage-dots">
            {STAGE_ORDER.map((s, i) => {
              const passed = i < stageIndex || (i === stageIndex && stageAccuracy.length > i)
              const current = i === stageIndex
              const cls = passed ? 'done' : current ? 'current' : 'pending'
              const labelCls = passed ? 'label-done' : current ? 'label-current' : 'label-pending'
              return (
                <View key={s} className="stage-dot-col">
                  <View className={`stage-dot ${cls}`}>
                    {passed && <Text className="dot-check">✓</Text>}
                  </View>
                  <Text className={`stage-dot-label ${labelCls}`}>{STAGE_LABEL[s]}</Text>
                </View>
              )
            })}
          </View>

          <View className="game-dialogue">
            <Text className="game-dialogue-speaker">{question.dialogue_speaker}</Text>
            <Text className="game-dialogue-text">{question.dialogue_text}</Text>
          </View>

          <View className="game-options">
            {question.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx)
              const selected = selectedOption === idx
              return (
                <View
                  key={idx}
                  className={`game-option ${selected ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(idx)}
                >
                  <View className={`game-option-letter ${selected ? 'letter-selected' : ''}`}>
                    <Text>{letter}</Text>
                  </View>
                  <Text className="game-option-text">{opt}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {status === 'feedback' && lastExplanation && (
        <View className="feedback-overlay">
          <View className="feedback-bg" />
          <View className={`feedback-sheet ${lastIsCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
            <View className="feedback-handle" />
            <View className="feedback-header">
              <View className={`feedback-icon-wrap ${lastIsCorrect ? 'icon-correct' : 'icon-wrong'}`}>
                <Text className="feedback-icon-text">{lastIsCorrect ? '✓' : '✗'}</Text>
              </View>
              <View className="feedback-title-row">
                <Text className="feedback-title">{lastIsCorrect ? '回答正确' : '回答错误'}</Text>
                {scoreChange !== null && scoreChange !== undefined && (
                  <View className={`score-badge ${scoreChange >= 0 ? 'badge-positive' : 'badge-negative'}`}>
                    <Text>{scoreChange >= 0 ? '+' : ''}{scoreChange}</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="feedback-card card-psychology">
              <Text className="feedback-card-title">📘 心理学知识</Text>
              <Text className="feedback-card-body">{lastExplanation.psychological_impact}</Text>
            </View>

            <View className="feedback-card card-warning">
              <Text className="feedback-card-title card-title-warning">⚠️ 避雷建议</Text>
              <Text className="feedback-card-body">{lastExplanation.boundary_suggestion}</Text>
            </View>

            {lastExplanation.warning_signals && lastExplanation.warning_signals.length > 0 && (
              <View className="feedback-signals">
                <Text className="feedback-signals-title">警告信号</Text>
                {lastExplanation.warning_signals.map((s, i) => (
                  <View key={i} className="feedback-signal-item">
                    <Text className="signal-dot">•</Text>
                    <Text className="signal-text">{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {lastExplanation.coping_strategies && lastExplanation.coping_strategies.length > 0 && (
              <View className="feedback-signals" style={{ marginTop: 12 }}>
                <Text className="feedback-signals-title">应对策略</Text>
                {lastExplanation.coping_strategies.map((s, i) => (
                  <View key={i} className="feedback-signal-item">
                    <Text className="signal-dot">•</Text>
                    <Text className="signal-text">{s}</Text>
                  </View>
                ))}
              </View>
            )}

            <View className="feedback-btn-wrap">
              <View
                className={`feedback-btn ${isGameOver ? 'btn-disabled' : ''}`}
                onClick={() => {
                  if (isGameOver) return
                  advanceStage()
                }}
              >
                <Text>{btnText}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

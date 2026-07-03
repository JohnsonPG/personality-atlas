import { create } from 'zustand'
import { Question, startGame, submitAnswer as apiSubmit, nextStage as apiNextStage, endGame as apiEndGame } from '../services/game'
import Taro from '@tarojs/taro'

export interface AnswerRecord {
  question_index: number
  user_choice: number
  is_correct: boolean
}

export interface Explanation {
  explanation: string
  knowledge_point: string
  psychological_impact: string
  boundary_suggestion: string
  warning_signals: string[]
  coping_strategies: string[]
}

interface GameState {
  sessionId: string | null
  presetCategory: string
  primaryTag: string
  secondaryTag: string
  currentStage: string
  currentQuestionIndex: number
  questions: Question[]
  score: number
  scoreChange: number | null
  answers: AnswerRecord[]
  status: 'idle' | 'loading' | 'playing' | 'feedback' | 'transition' | 'victory' | 'failed'
  lastExplanation: Explanation | null
  lastIsCorrect: boolean
  stageAccuracy: number[]
  selectedOption: number | null

  selectPreset: (category: string, primary: string, secondary: string) => void
  startSession: () => Promise<void>
  submitAnswer: (userChoice: number) => Promise<void>
  advanceStage: () => Promise<void>
  endGame: (result: 'victory' | 'failed') => void
  reset: () => void
  setSelectedOption: (idx: number | null) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  sessionId: null,
  presetCategory: '',
  primaryTag: '',
  secondaryTag: '',
  currentStage: '',
  currentQuestionIndex: 0,
  questions: [],
  score: 100,
  scoreChange: null,
  answers: [],
  status: 'idle',
  lastExplanation: null,
  lastIsCorrect: false,
  stageAccuracy: [],
  selectedOption: null,

  selectPreset: (c, p, s) => set({ presetCategory: c, primaryTag: p, secondaryTag: s }),

  setSelectedOption: (idx) => set({ selectedOption: idx }),

  startSession: async () => {
    const { presetCategory, primaryTag, secondaryTag } = get()
    set({ status: 'loading' })
    try {
      const res = await startGame({
        preset_category: presetCategory,
        primary: primaryTag,
        secondary: secondaryTag,
      })
      set({
        sessionId: res.session_id,
        currentStage: res.stage,
        questions: res.questions,
        currentQuestionIndex: 0,
        score: 100,
        answers: [],
        status: 'playing',
        selectedOption: null,
      })
    } catch (e) {
      console.error('startSession error', e)
      Taro.showToast({ title: '启动失败', icon: 'none' })
      set({ status: 'idle' })
    }
  },

  submitAnswer: async (userChoice: number) => {
    const { sessionId, currentQuestionIndex, score, answers } = get()
    if (!sessionId) return
    try {
      const res = await apiSubmit({
        session_id: sessionId,
        question_index: currentQuestionIndex,
        user_choice: userChoice,
      })
      set({
        score: res.new_score,
        scoreChange: res.score_change,
        answers: [...answers, { question_index: currentQuestionIndex, user_choice: userChoice, is_correct: res.is_correct }],
        lastIsCorrect: res.is_correct,
        lastExplanation: res.question_explanation,
        status: 'feedback',
      })
      if (res.triggered_game_over) {
        setTimeout(() => {
          set({ status: 'failed' })
          try { apiEndGame(sessionId, 'failed', get().score) } catch {}
          Taro.redirectTo({ url: '/pages/death/index' })
        }, 3500)
      }
    } catch (e) {
      console.error('submitAnswer error', e)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  advanceStage: async () => {
    const { sessionId, currentQuestionIndex, questions, answers } = get()
    if (!sessionId) return
    if (currentQuestionIndex >= questions.length - 1) {
      set({ status: 'transition' })
      try {
        const res = await apiNextStage(sessionId)
        if (res.all_finished || !res.next_stage) {
          set({ status: 'victory' })
          try { await apiEndGame(sessionId, 'passed', get().score) } catch {}
          Taro.redirectTo({ url: '/pages/victory/index' })
        } else {
          const acc = answers.filter(a => a.is_correct).length / Math.max(answers.length, 1)
          set({ stageAccuracy: [...get().stageAccuracy, Math.round(acc * 100)] })
          set({
            currentStage: res.next_stage,
            questions: res.questions || [],
            currentQuestionIndex: 0,
          })
          Taro.redirectTo({ url: '/pages/transition/index?next=' + res.next_stage })
        }
      } catch (e) {
        console.error('advanceStage error', e)
        Taro.showToast({ title: '切阶段失败', icon: 'none' })
      }
    } else {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        scoreChange: null,
        status: 'playing',
        selectedOption: null,
      })
    }
  },

  endGame: (r) => {
    const { sessionId, score } = get()
    set({ status: r })
    if (sessionId) { try { apiEndGame(sessionId, r === 'victory' ? 'passed' : 'failed', score) } catch {} }
  },

  reset: () => set({
    sessionId: null, presetCategory: '', primaryTag: '', secondaryTag: '',
    currentStage: '', currentQuestionIndex: 0, questions: [], score: 100,
    scoreChange: null, answers: [], status: 'idle', lastExplanation: null, lastIsCorrect: false, stageAccuracy: [], selectedOption: null,
  }),
}))

if (typeof window !== 'undefined') {
  (window as any).__RGTJ_STORE__ = useGameStore
}

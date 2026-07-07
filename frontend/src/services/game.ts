import api from './api'
import Taro from '@tarojs/taro'

export interface GameStartRequest {
  preset_category: string
  primary: string
  secondary: string
}

export interface Question {
  id: string
  stage: string
  scene: string
  scene_image: string
  dialogue_speaker: string
  dialogue_text: string
  options: string[]
  correct_answer: number
  is_redline: boolean
  score_delta: number
  explanation: string
  psychological_impact: string
  boundary_suggestion: string
  warning_signals: string[]
  coping_strategies: string[]
  knowledge_point: string
}

export interface PresetInfo {
  id: number
  category: string
  primary_tag: string
  secondary_tag: string
}

export interface GameStartResponse {
  session_id: string
  stage: string
  questions: Question[]
  preset_info: PresetInfo
}

export interface GameSubmitRequest {
  session_id: string
  question_index: number
  user_choice: number
}

export interface GameSubmitResponse {
  is_correct: boolean
  score_change: number
  new_score: number
  triggered_stage_end: boolean
  triggered_game_over: boolean
  next_stage: string | null
  question_explanation: {
    explanation: string
    knowledge_point: string
    psychological_impact: string
    boundary_suggestion: string
    warning_signals: string[]
    coping_strategies: string[]
  }
}

export async function startGame(req: GameStartRequest): Promise<GameStartResponse> {
  const res = await api.post('/api/game/start', req)
  return res.data
}

export async function submitAnswer(req: GameSubmitRequest): Promise<GameSubmitResponse> {
  const res = await api.post('/api/game/submit', req)
  return res.data
}

export interface NextStageResponseData {
  next_stage: string | null
  questions: Question[]
  all_finished: boolean
}

export async function nextStage(sessionId: string): Promise<{ stage: string; questions: Question[]; next_stage: string | null; all_finished: boolean }> {
  const res = await api.post('/api/game/next_stage', { session_id: sessionId })
  const data: NextStageResponseData = res.data
  return {
    stage: data.next_stage || '',
    questions: data.questions,
    next_stage: data.next_stage,
    all_finished: data.all_finished,
  }
}

export async function endGame(sessionId: string, result: 'passed' | 'failed', finalScore: number) {
  await api.post('/api/game/end', { session_id: sessionId, result, final_score: finalScore })
}

export interface ReportRadarData {
  empathy: number
  boundary: number
  communication: number
  self_awareness: number
  risk_detection: number
}

export interface StageBreakdownItem {
  stage: string
  score: number
  correct_rate: number
  question_count: number
  correct_count: number
}

export interface ReportResponse {
  session_id: string
  final_score: number
  accuracy: number
  stage_count: number
  stage_breakdown: StageBreakdownItem[]
  radar_data: ReportRadarData
  summary: string
  strengths: string[]
  weaknesses: string[]
  advice: string
  key_learnings: string[]
}

export interface ParallelResponse {
  session_id: string
  top_percentile: number
  total_players: number
  higher_than_players: number
  radar_data: ReportRadarData
  average_scores: { stage: string; your_score: number; global_avg: number }[]
}

export async function getReport(sessionId: string): Promise<ReportResponse> {
  const res = await api.get(`/api/report/${sessionId}`)
  return res.data
}

export async function getParallel(sessionId: string): Promise<ParallelResponse> {
  const res = await api.get(`/api/stats/parallel/${sessionId}`)
  return res.data
}

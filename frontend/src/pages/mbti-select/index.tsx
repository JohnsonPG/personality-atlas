import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { useGameStore } from '../../store/game'
import './index.scss'

const MBTI_LIST = [
  { code: 'INTJ', group: 'NT', name: '建筑师' },
  { code: 'INTP', group: 'NT', name: '逻辑学家' },
  { code: 'ENTJ', group: 'NT', name: '指挥官' },
  { code: 'ENTP', group: 'NT', name: '辩论家' },
  { code: 'INFJ', group: 'NF', name: '提倡者' },
  { code: 'INFP', group: 'NF', name: '调停者' },
  { code: 'ENFJ', group: 'NF', name: '主人公' },
  { code: 'ENFP', group: 'NF', name: '竞选者' },
  { code: 'ISTJ', group: 'SJ', name: '物流师' },
  { code: 'ISFJ', group: 'SJ', name: '守卫者' },
  { code: 'ESTJ', group: 'SJ', name: '总经理' },
  { code: 'ESFJ', group: 'SJ', name: '执政官' },
  { code: 'ISTP', group: 'SP', name: '鉴赏家' },
  { code: 'ISFP', group: 'SP', name: '探险家' },
  { code: 'ESTP', group: 'SP', name: '企业家' },
  { code: 'ESFP', group: 'SP', name: '表演者' },
]

const GROUP_COLOR = {
  NT: 'var(--mbti-blue)',
  NF: 'var(--mbti-green)',
  SJ: 'var(--mbti-gold)',
  SP: 'var(--mbti-orange)',
}

const MBTI_IMAGES: Record<string, string> = {
  INTJ: require('../../assets/mbti-crops/mbti-intj.png'),
  INTP: require('../../assets/mbti-crops/mbti-intp.png'),
  ENTJ: require('../../assets/mbti-crops/mbti-entj.png'),
  ENTP: require('../../assets/mbti-crops/mbti-entp.png'),
  INFJ: require('../../assets/mbti-crops/mbti-infj.png'),
  INFP: require('../../assets/mbti-crops/mbti-infp.png'),
  ENFJ: require('../../assets/mbti-crops/mbti-enfj.png'),
  ENFP: require('../../assets/mbti-crops/mbti-enfp.png'),
  ISTJ: require('../../assets/mbti-crops/mbti-istj.png'),
  ISFJ: require('../../assets/mbti-crops/mbti-isfj.png'),
  ESTJ: require('../../assets/mbti-crops/mbti-estj.png'),
  ESFJ: require('../../assets/mbti-crops/mbti-esfj.png'),
  ISTP: require('../../assets/mbti-crops/mbti-istp.png'),
  ISFP: require('../../assets/mbti-crops/mbti-isfp.png'),
  ESTP: require('../../assets/mbti-crops/mbti-estp.png'),
  ESFP: require('../../assets/mbti-crops/mbti-esfp.png'),
}

const PRIMARY_LABEL: Record<string, string> = {
  npd: '已选：NPD 自恋型人格',
  bipolar: '已选：双向/抑郁情绪',
}

const PRIMARY_SHORT: Record<string, string> = {
  npd: 'NPD',
  bipolar: '双向',
}

export default function MbtiSelectPage() {
  const router = useRouter()
  const primary = (router.params.primary as string) || 'npd'
  const [currentMbti, setCurrentMbti] = useState<string>('')

  const primaryDisplay = PRIMARY_LABEL[primary] || PRIMARY_LABEL.npd
  const primaryShort = PRIMARY_SHORT[primary] || PRIMARY_SHORT.npd
  const category = primary === 'npd' ? 'npd_mbti' : 'bipolar_mbti'
  const primaryTag = primary === 'npd' ? 'NPD' : '双向'

  const handleStart = () => {
    if (!currentMbti) return
    useGameStore.getState().selectPreset(category, primaryTag, currentMbti)
    Taro.navigateTo({
      url: `/pages/loading/index?primary=${primaryShort}&mbti=${currentMbti}`,
    })
  }

  return (
    <View className="screen-mbti">
      <View className="mbti-header">
        <View className="nav-back" onClick={() => Taro.navigateBack()}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <Text>返回</Text>
        </View>
        <View className="large-title">选择 MBTI 人格</View>
      </View>
      <View className="mbti-selected-pill">
        <View className="mbti-selected-dot" />
        <Text>{primaryDisplay}</Text>
      </View>
      <View className="mbti-legend">
        <View className="mbti-legend-item">
          <View className="mbti-legend-dot" style={{ background: GROUP_COLOR.NT }} />
          <Text>分析师</Text>
        </View>
        <View className="mbti-legend-item">
          <View className="mbti-legend-dot" style={{ background: GROUP_COLOR.NF }} />
          <Text>外交家</Text>
        </View>
        <View className="mbti-legend-item">
          <View className="mbti-legend-dot" style={{ background: GROUP_COLOR.SP }} />
          <Text>探险家</Text>
        </View>
        <View className="mbti-legend-item">
          <View className="mbti-legend-dot" style={{ background: GROUP_COLOR.SJ }} />
          <Text>守卫者</Text>
        </View>
      </View>
      <View className="mbti-grid">
        {MBTI_LIST.map(mbti => {
          const selected = currentMbti === mbti.code
          return (
            <View
              key={mbti.code}
              className={`mbti-item ${selected ? 'selected' : ''}`}
              style={{
                backgroundImage: `url(${MBTI_IMAGES[mbti.code]})`,
              }}
              onClick={() => setCurrentMbti(mbti.code)}
            >
              <View className="mbti-check">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="#FFFFFF">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </View>
              <View className="mbti-code">{mbti.code}</View>
            </View>
          )
        })}
      </View>
      <Button
        className={`mbti-start-btn ${!currentMbti ? 'is-disabled' : ''}`}
        disabled={!currentMbti}
        onClick={handleStart}
      >
        {currentMbti
          ? `${primaryShort} + ${currentMbti} · 开始模拟`
          : '请先选择 MBTI →'}
      </Button>
    </View>
  )
}

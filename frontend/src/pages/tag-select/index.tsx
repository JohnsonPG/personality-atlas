import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useGameStore } from '../../store/game'
import './index.scss'

export default function TagSelectPage() {
  const handleSelect = (primary: string) => {
    const category = primary === 'npd' ? 'npd_mbti' : 'bipolar_mbti'
    const primaryTag = primary === 'npd' ? 'NPD' : '双向'
    useGameStore.getState().selectPreset(category, primaryTag, '')
    Taro.navigateTo({ url: '/pages/mbti-select/index?primary=' + primary })
  }

  return (
    <View className="screen-tag-select">
      <View className="tag-header">
        <View className="nav-back" onClick={() => Taro.navigateBack()}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <Text>返回</Text>
        </View>
        <View className="large-title">选择人格类型</View>
      </View>
      <View className="tag-body">
        <View
          className="tag-card tag-card-npd"
          onClick={() => handleSelect('npd')}
        >
          <View className="tag-card-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--accent-red)">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </View>
          <View className="tag-card-info">
            <View className="tag-card-name">NPD 自恋型人格</View>
            <View className="tag-card-desc">识别操控、煤气灯效应、情感吸血</View>
          </View>
          <View className="tag-badge tag-badge-hot">HOT</View>
          <View className="chevron">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--text-tertiary)">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </View>
        </View>
        <View
          className="tag-card tag-card-bipolar"
          onClick={() => handleSelect('bipolar')}
        >
          <View className="tag-card-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--accent-blue)">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
          </View>
          <View className="tag-card-info">
            <View className="tag-card-name">双向/抑郁情绪</View>
            <View className="tag-card-desc">理解情绪波动与边界守护</View>
          </View>
          <View className="tag-badge tag-badge-new">NEW</View>
          <View className="chevron">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--text-tertiary)">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </View>
        </View>
        <View className="tag-hint">更多人格类型即将解锁...</View>
      </View>
    </View>
  )
}

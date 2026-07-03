import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect } from 'react'
import './index.scss'

export default function LoadingPage() {
  const router = useRouter()
  const primary = (router.params.primary as string) || 'NPD'
  const mbti = (router.params.mbti as string) || 'INTJ'

  useEffect(() => {
    const timer = setTimeout(() => {
      Taro.redirectTo({ url: '/pages/game/index' })
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View className="screen-ai-loading">
      <View className="ai-loading-content">
        <View className="ai-spinner" />
        <Text className="ai-loading-text">AI 正在编织你的命运...</Text>
        <Text className="ai-loading-sub">
          {primary} + {mbti} · 相识阶段剧本生成中
        </Text>
        <View className="ai-progress-track">
          <View className="ai-progress-fill" />
        </View>
        <View className="ai-hint">
          <Text>正在构建「相识破冰」场景</Text>
          <Text>生成动漫场景与对话</Text>
        </View>
      </View>
    </View>
  )
}

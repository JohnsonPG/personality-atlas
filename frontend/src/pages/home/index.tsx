import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function HomePage() {
  const onStart = () => {
    Taro.navigateTo({ url: '/pages/tag-select/index' })
  }

  return (
    <View className="screen-home">
      <View className="home-body">
        <View className="home-logo-icon">R</View>
        <Text className="home-title">人格图鉴</Text>
        <Text className="home-subtitle">沉浸式关系生存模拟器</Text>
        <View className="home-tagline">
          <Text>在虚拟情感中低成本试错</Text>
          <Text>将心理学知识变成肌肉记忆</Text>
        </View>
        <Text className="home-desc">AI 驱动的动态互动小说，让你在虚拟的恋爱/社交生死局中演练人际交往，识破操控，建立边界。</Text>
        <Button className="btn-primary" onClick={onStart}>开始挑战</Button>
        <Text className="home-footer">32 种人格组合可探索</Text>
      </View>
    </View>
  )
}

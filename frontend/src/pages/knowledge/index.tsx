import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useGameStore } from '../../store/game'
import './index.scss'

const KNOWLEDGE_CARDS = [
  {
    accent: 'blue',
    borderColor: '#007AFF',
    icon: '🔍',
    title: '煤气灯效应 Gaslighting',
    sections: [
      { title: '定义', text: '一种心理操控形式，施害者通过系统性否认、歪曲、误导受害者的记忆、感知和判断，使其怀疑自身的理智与现实感，最终丧失自信和独立判断能力。' },
      { title: '识别方式', text: '当你频繁被说"你太敏感了""这根本没发生过""是你记错了"，且你开始反复自我怀疑、需要反复确认自己的记忆时，很可能正在遭受煤气灯效应。' },
      { title: '应对策略', text: '第一，信任自己的感受和记忆；第二，记录关键对话和事件作为客观参考；第三，与可信赖的第三方讨论获取视角；第四，明确告知对方不接受这种否定方式；第五，必要时远离这段关系。' },
    ],
  },
  {
    accent: 'purple',
    borderColor: '#AF52DE',
    icon: '💣',
    title: '爱情轰炸 Love Bombing',
    sections: [
      { title: '定义', text: '在关系初期通过过度赞美、过量礼物、全天候关注等"浓度超标"的示好方式，快速建立情感依赖的操控手法。本质不是爱，而是用密集正向反馈制造情绪依赖。' },
      { title: '识别方式', text: '警惕刚认识就说"你是我的灵魂伴侣""我们天生一对"的人；警惕用礼物和赞美代替真正了解你的人；警惕当你想放慢节奏时，对方表现出委屈或愤怒的情绪。' },
      { title: '应对策略', text: '保持自己的生活节奏和社交圈不被吞并；敢于设定"慢一点"的关系节奏；区分"他对我好"和"他想控制我"的差别——真正的尊重允许你按自己的速度前进。' },
    ],
  },
  {
    accent: 'orange',
    borderColor: '#FF9500',
    icon: '💰',
    title: '沉没成本谬误 Sunk Cost Fallacy',
    sections: [
      { title: '定义', text: '人们因为已经投入了时间、感情、金钱等不可回收的成本，而继续坚持一段明显有害或无意义的关系。投入越多，越难放手，即使理性上知道继续下去只会损失更大。' },
      { title: '识别方式', text: '当你想离开一段关系时，第一反应是"可是我已经投入了XX年""可是我为他做了那么多"而不是"未来我还会幸福吗"——你就是在用沉没成本替自己做决定。' },
      { title: '应对策略', text: '练习"零基思考"：假设现在是第一天认识这个人，你会选择和他在一起吗？如果答案是否定的，那么过去的投入不应该成为留下的理由。过去已经过去，未来才是你真正拥有的。' },
    ],
  },
  {
    accent: 'green',
    borderColor: '#34C759',
    icon: '🧩',
    title: '灰度思维练习 Gray Thinking',
    sections: [
      { title: '定义', text: '拒绝"非黑即白""全好或全坏"的二元极端思维，接受人和事的多面性与中间状态。一个人可以有好的意图但使用错误的方式，一段关系可以有过甜蜜时光但现在需要结束。' },
      { title: '识别方式', text: '当你发现自己对一个人或一件事的评价在"完美无瑕"和"一无是处"之间剧烈波动时，你正在使用极端思维。健康的认知是允许优点和缺点同时存在。' },
      { title: '应对策略', text: '当你评价一个人或一件事时，强制自己列出至少 3 个正面点和 3 个负面点；练习用"一方面…另一方面…"的句式思考；记住一个人做错了一件事，不代表他整个人都是坏的。' },
    ],
  },
]

export default function KnowledgePage() {
  const primaryTag = useGameStore((s) => s.primaryTag)
  const secondaryTag = useGameStore((s) => s.secondaryTag)
  const reset = useGameStore((s) => s.reset)

  const handleBack = () => Taro.navigateBack({ delta: 1 }).catch(() => {})
  const handleSave = () => Taro.showToast({ title: '保存海报功能开发中', icon: 'none' })
  const handleRetry = () => {
    reset()
    Taro.reLaunch({ url: '/pages/home/index' })
  }

  return (
    <View className="page-knowledge">
      <View className="nav-bar">
        <View className="nav-back" onClick={handleBack}>← 返回报告</View>
        <View className="nav-save" onClick={handleSave}>保存海报</View>
      </View>

      <View className="page-title">核心知识点总结</View>
      <View className="page-subtitle">把心理学变成肌肉记忆</View>

      {KNOWLEDGE_CARDS.map((card, i) => (
        <View
          key={`kc-${i}`}
          className="knowledge-card"
          style={{ borderLeftColor: card.borderColor }}
        >
          <View className="kc-header">
            <View className="kc-icon">{card.icon}</View>
            <View className="kc-title">{card.title}</View>
          </View>
          <View className="kc-sections">
            {card.sections.map((sec, j) => (
              <View key={`ksec-${i}-${j}`} className="kc-section">
                <View className="kc-section-title">{sec.title}</View>
                <View className="kc-section-text">{sec.text}</View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className="section-title">海报预览</View>
      <View className="poster-preview-card">
        <View className="poster-inner">
          <View className="poster-logo">
            <View className="poster-logo-text">R</View>
          </View>
          <View className="poster-brand">人格图鉴</View>
          <View className="poster-title">认知觉醒挑战报告</View>

          <View className="poster-stats">
            <View className="poster-stat">
              <View className="poster-stat-num">92</View>
              <View className="poster-stat-label">综合得分</View>
            </View>
            <View className="poster-stat">
              <View className="poster-stat-num">87%</View>
              <View className="poster-stat-label">正确率</View>
            </View>
            <View className="poster-stat">
              <View className="poster-stat-num">Top12%</View>
              <View className="poster-stat-label">全球排名</View>
            </View>
          </View>

          <View className="poster-divider" />

          <View className="poster-composite-row">
            <View className="poster-composite-label">五维能力综合评估</View>
            <View className="poster-composite-bar">
              <View className="cb-seg cb-1" />
              <View className="cb-seg cb-2" />
              <View className="cb-seg cb-3" />
              <View className="cb-seg cb-4" />
              <View className="cb-seg cb-5" />
            </View>
          </View>

          <View className="poster-tag-row">
            <View className="poster-tag">高共情</View>
            <View className="poster-tag-dot">·</View>
            <View className="poster-tag">边界感极佳</View>
          </View>

          <View className="poster-footer">
            {primaryTag || 'NPD'} + {secondaryTag || 'INTJ'} · 全阶段通关
          </View>
          <View className="poster-watermark">v1.0 · 人格图鉴出品</View>
        </View>
      </View>

      <View className="btn-group">
        <View className="btn btn-primary" onClick={handleSave}>
          保存海报到相册（开发中）
        </View>
        <View className="btn btn-secondary" onClick={handleRetry}>
          再挑战一次
        </View>
      </View>
    </View>
  )
}

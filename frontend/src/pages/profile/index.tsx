import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const SETTINGS_GROUP_1 = [
  {
    iconBg: 'blue',
    iconSvg: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="#FFFFFF">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    ),
    label: '我的收藏',
  },
  {
    iconBg: 'purple',
    iconSvg: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="#FFFFFF">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    ),
    label: '人格知识库',
  },
  {
    iconBg: 'green',
    iconSvg: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="#FFFFFF">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    label: '成就徽章',
  },
]

const SETTINGS_GROUP_2 = [
  {
    iconBg: 'orange',
    iconSvg: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="#FFFFFF">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
      </svg>
    ),
    label: '设置偏好',
  },
  {
    iconBg: 'teal',
    iconSvg: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="#FFFFFF">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    ),
    label: '意见反馈',
  },
  {
    iconBg: 'gray',
    iconSvg: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="#FFFFFF">
        <path d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4v-2h-4V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13v11c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2zM15 16h3v1H8v-1h7V4H8v11h7z"/>
      </svg>
    ),
    label: '关于我们',
  },
]

export default function ProfilePage() {
  const handleBack = () => {
    Taro.navigateBack({ delta: 1 }).catch(() => {
      Taro.reLaunch({ url: '/pages/home/index' })
    })
  }

  const handleVip = () => Taro.showToast({ title: '会员功能开发中', icon: 'none' })
  const handleReview = () => Taro.navigateTo({ url: '/pages/review/index' })

  return (
    <View className="screen-profile">
      <View className="profile-nav">
        <View className="nav-back" onClick={handleBack}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <Text>返回</Text>
        </View>
        <View className="nav-placeholder" />
        <View className="nav-settings" onClick={() => Taro.showToast({ title: '设置开发中', icon: 'none' })}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        </View>
      </View>

      <View className="large-title">个人中心</View>

      <View className="profile-header">
        <View className="avatar-circle">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#8E8E93">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </View>
        <View className="profile-info">
          <View className="profile-name">挑战者 #8824</View>
          <View className="profile-id">ID: RGTJ-2026-88241</View>
        </View>
      </View>

      <View className="stats-row" onClick={handleReview}>
        <View className="stat-item">
          <View className="stat-value">12</View>
          <View className="stat-label">挑战次数</View>
        </View>
        <View className="stat-item">
          <View className="stat-value">7</View>
          <View className="stat-label">成功通关</View>
        </View>
        <View className="stat-item">
          <View className="stat-value">3</View>
          <View className="stat-label">人格类型</View>
        </View>
      </View>

      <View className="vip-card">
        <View className="vip-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF9500">
            <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"/>
          </svg>
          PRO 会员
        </View>
        <View className="vip-title">解锁完整人格图鉴</View>
        <View className="vip-desc">
          32 种人格组合无限次重玩 · 深度解析报告 · 心理学家知识课
        </View>
        <View className="vip-btn" onClick={handleVip}>
          立即升级
        </View>
      </View>

      <View className="settings-group">
        {SETTINGS_GROUP_1.map((item, i) => (
          <View key={`sg1-${i}`} className="settings-item">
            <View className="settings-item-left">
              <View className={`settings-icon ${item.iconBg}`}>{item.iconSvg}</View>
              <Text className="settings-item-label">{item.label}</Text>
            </View>
            <svg className="chevron" viewBox="0 0 24 24" width="8" height="13" fill="#C7C7CC">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </View>
        ))}
      </View>

      <View className="settings-group">
        {SETTINGS_GROUP_2.map((item, i) => (
          <View key={`sg2-${i}`} className="settings-item">
            <View className="settings-item-left">
              <View className={`settings-icon ${item.iconBg}`}>{item.iconSvg}</View>
              <Text className="settings-item-label">{item.label}</Text>
            </View>
            <svg className="chevron" viewBox="0 0 24 24" width="8" height="13" fill="#C7C7CC">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </View>
        ))}
      </View>
    </View>
  )
}

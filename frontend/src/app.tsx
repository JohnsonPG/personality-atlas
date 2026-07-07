import { PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  return (
    <View className="app-container">{children}</View>
  )
}

export default App

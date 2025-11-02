import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function Container({children}: {children:React.ReactNode}) {
  return (
    <SafeAreaProvider style={{flex: 1}}>
        {children}
    </SafeAreaProvider>
  )
}
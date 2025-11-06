import React from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Container({children}: {children:React.ReactNode}) {
  return (
    <SafeAreaView style={{flex: 1}}>
        {children}
    </SafeAreaView>
  )
}
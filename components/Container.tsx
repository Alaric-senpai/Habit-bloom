import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function Container({children}: {children:React.ReactNode}) {
  return (
    <SafeAreaProvider className='flex-1 bg-primary'>
        {children}
    </SafeAreaProvider>
  )
}
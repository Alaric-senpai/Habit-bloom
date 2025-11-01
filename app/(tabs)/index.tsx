import { View, Text } from 'react-native'
import React from 'react'
import ScrollableContainer from '@/components/ScrollableContainer'

export default function HomeScreen() {
  return (
    <ScrollableContainer>
        <Text className='dark:text-white'>Welcome home bitch</Text>
    </ScrollableContainer>
  )
}
import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import Container from './Container'

export default function ScrollableContainer({children}: {children:React.ReactNode}) {
  return (
    <Container>
        <ScrollView className='flex-1 '
            showsHorizontalScrollIndicator={false}
            keyboardDismissMode={'interactive'}
            keyboardShouldPersistTaps={'handled'}
        >
            {children}
            <View className='min-h-20 h-22' />
        </ScrollView>
    </Container>
  )
}
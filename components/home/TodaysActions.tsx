import { View, Text } from 'react-native'
import React from 'react'
import SwippableView from '../SwippableView'
import HabitCard from '../cards/HabitCard'

const TodaysActions = () => {
  return (
    <View className='my-5'>
        {Array.from({length: 20}).map((_, idx)=>(
            <SwippableView key={idx}>
                <HabitCard />
            </SwippableView>
        ))}
    </View>
  )
}

export default TodaysActions
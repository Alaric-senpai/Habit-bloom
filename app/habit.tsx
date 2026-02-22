import { View, Text } from 'react-native'
import React from 'react'
import ScrollableContainer from '@/components/ScrollableContainer'
import AddHabitForm from '@/components/forms/AddHabitForm'
import storage from '@/lib/storage/mmkv'
import { useActions } from '@/contexts/HabitBloomGlobalContext'

export default function CreateHabit() {
  const actions = useActions()
    return (

    <ScrollableContainer>
        <AddHabitForm userId={storage.getUserID()} habitActions={actions.habit} />
    </ScrollableContainer>
  )
}
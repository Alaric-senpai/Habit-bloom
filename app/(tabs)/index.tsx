import { Alert, Pressable, ScrollView, View,  } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import Container from '@/components/Container'
import { LeafLogo } from '@/components/Logo'
import { CogIcon, Plus } from 'lucide-react-native'
import { THEME } from '@/lib/theme'
import HomeScreenHeader from '@/components/home/header'
import DateMapper from '@/components/home/DateMapper'
import { Button } from '@/components/ui/button'
import AddButton from '@/components/home/AddButton'
import TodaysActions from '@/components/home/TodaysActions'

const HomeScreen = () => {
  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1, paddingBottom: 100}} className=''>
      <HomeScreenHeader />
      <DateMapper />
      <TodaysActions />

      </ScrollView>
      <AddButton />
    </Container>
  )
}

export default HomeScreen
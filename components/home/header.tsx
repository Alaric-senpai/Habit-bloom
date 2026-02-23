import { Pressable, View,  } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import Container from '@/components/Container'
import { LeafLogo } from '@/components/Logo'
import { CogIcon } from 'lucide-react-native'
import { THEME } from '@/lib/theme'

const HomeScreenHeader = () => {
  return (
          <View className='w-11/12 mx-auto flex-row items-center justify-between'>
          <View className='flex-row gap-2 items-center '>
            <LeafLogo />
            <Text variant={'h4'} className='text-primary'>Daily Dashboard</Text>
          </View>

          <Pressable className='flex items-center justify-center bg-secondary rounded-full'
            style={{
              width: 50,
              height: 50,
              backgroundColor: THEME.dark.muted
            }}
          >
            <CogIcon color={'white'} size={35} />
          </Pressable>
      </View>
  )
}

export default HomeScreenHeader
import { Pressable, View,  } from 'react-native'
import React from 'react'
import { Text } from '@/components/ui/text'
import Container from '@/components/Container'
import { LeafLogo } from '@/components/Logo'
import { CogIcon } from 'lucide-react-native'
import { THEME } from '@/lib/theme'
import { useHabitBloom } from '@/contexts/HabitBloomGlobalContext'
import { Image } from 'expo-image'

const HomeScreenHeader = () => {
  const {user}= useHabitBloom()
  return (
          <View className='w-11/12 mx-auto flex-row items-center justify-between'>
          <View className='flex-row gap-2 items-center '>
            <LeafLogo width={45} height={45} />

            <Text variant={'small'} className='text-primary'>Daily Dashboard</Text>
          </View>

          <Pressable className='flex items-center justify-center bg-secondary rounded-full'
            style={{
              width: 45,
              height: 45,
              backgroundColor: THEME.dark.muted
            }}
          >
            {user && user.imageURL &&
              <Image
                source={{uri: user.imageURL}}
                alt='user avatar'
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 999
                }}
              />
            }

          </Pressable>
      </View>
  )
}

export default HomeScreenHeader
import { Pressable, View } from 'react-native'
import React from 'react'
import { CheckIcon, Wallpaper } from 'lucide-react-native'
import { GRADIENTS } from '@/lib/theme'
import { Text } from '../ui/text'
import { useRouter } from 'expo-router'

const HabitCard = () => {
  const router = useRouter()
  return (
    <Pressable onPress={()=>{
      router.push(`/habits/${234}`)
    }} className='bg-card flex-row items-center justify-between w-11/12 mx-auto rounded-3xl p-3 overflow-hidden my-4'>
      <View className='flex-row items-center gap-2'>
          <View style={{
            backgroundColor: GRADIENTS.mood.calm,
            width: 60,
            height: 60,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <Wallpaper color={'white'} size={34} />
          </View>

          <View className='flex-col gap-2'>
            <Text variant={'large'}>
                Changing wallpaer
            </Text>
            <Text variant={'small'} className='text-accent/65'>
              10 of 10 times
            </Text>
          </View>
      </View>

      <View>
        <CheckIcon color={GRADIENTS.water.start} />
      </View>
    </Pressable>
  )
}

export default HabitCard
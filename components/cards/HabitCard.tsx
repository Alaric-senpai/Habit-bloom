import { Pressable, View } from 'react-native'
import React from 'react'
import { CheckIcon, Droplets } from 'lucide-react-native' // Changed icon to match "Drink Water"
import { GRADIENTS, THEME } from '@/lib/theme'
import { Text } from '../ui/text'
import { useRouter } from 'expo-router'

interface HabitCardProps {
  title?: string;
  subtitle?: string;
  progress?: number; // 0 to 1
  isCompleted?: boolean;
}

const HabitCard = ({ 
  title = "Drink Water", 
  subtitle = "6 of 8 glasses", 
  progress = 0.75, 
  isCompleted = false 
}: HabitCardProps) => {
  const router = useRouter()

  return (
    <Pressable 
      onPress={() => router.push(`/habits/${234}`)} 
      // Using a darker background (#1A2C2C) to match the Mood selector container
      className='bg-[#122222] flex-row items-center justify-between w-[95%] mx-auto rounded-[32px] p-4 my-2'
    >
      <View className='flex-row items-center gap-4'>
          {/* Icon Container */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle glass effect
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Droplets color={GRADIENTS.primaryCyan.start} size={28} />
          </View>

          {/* Text Labels */}
          <View className='flex-col justify-center'>
            <Text variant={'large'} className="text-white font-bold text-lg">
                {title}
            </Text>
            <Text variant={'small'} className='text-gray-500 mt-1'>
              {subtitle}
            </Text>
          </View>
      </View>

      {/* Progress / Completion Status */}
      <View className="items-center justify-center">
        {isCompleted ? (
          <View className="w-12 h-12 rounded-full items-center justify-center bg-primary">
            <CheckIcon color="black" size={24} />
          </View>
        ) : (
          <View 
            className="w-12 h-12 rounded-full items-center justify-center border-4 border-gray-800"
            style={{ position: 'relative' }}
          >
            {/* Simple Text Progress for now */}
            <Text className="text-[10px] text-white font-bold">
              {Math.round(progress * 100)}%
            </Text>
            
            {/* You could add an SVG Circle here later for the actual ring effect */}
          </View>
        )}
      </View>
    </Pressable>
  )
}

export default HabitCard
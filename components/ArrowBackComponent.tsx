import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Icon } from './ui/icon'
import { ArrowLeft } from 'lucide-react-native'

export default function ArrowBackComponent() {
    const router =useRouter()

    const handlePress = ()=>{
        if(router.canGoBack()){
            router.back()
        }else{
            router.push('/')
        }
    }
  return (
        <Pressable className='m-2' onPress={handlePress}>
            <Icon as={ArrowLeft} className='dark:text-white size-8 mb-2' />
        </Pressable>
  )
}
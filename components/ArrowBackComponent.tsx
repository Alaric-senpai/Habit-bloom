import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Icon } from './ui/icon'
import { ArrowLeft } from 'lucide-react-native'
import { Button } from './ui/button'

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
        <Button variant={'link'} className='m-2 w-10 h-10 items-center flex-col p-2 justify-center rounded-full overflow-hidden bg-card/85 ' onPress={handlePress}

        >
            <Icon as={ArrowLeft} className='dark:text-white size-8' />
        </Button>
  )
}
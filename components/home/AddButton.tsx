import { View, Text, Alert } from 'react-native'
import React from 'react'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const AddButton = () => {
  const router = useRouter()
  return (
          <Button onPress={()=>{
              router.push('/create-habit')
            // Alert.alert('comming soon', 'add functionaliy on the way')
          }} className='w-16 h-16 rounded-full overflow-hidden absolute bottom-28 right-4'>
            <Plus />
          </Button>
  )
}

export default AddButton
import { View, Text, Pressable } from 'react-native'
import React, { act, Key, useState } from 'react'

const elements = ['all', 'pined','personal','work']

const Testing = () => {

    const [active, setActive]= useState<'all'|'pined'| 'personal'|'work'>('all')
  return (
    <>
    {elements.map((element, idx)=>(
        <Pressable key={idx}
            style={{
                backgroundColor: active === element ? 'blue': 'tranparent'
            }}

            onPress={()=>{
                setActive(element as any)
            }}

            

        >
            <Text>
                {element}
            </Text>
        </Pressable>

    ))}
    
    </>
  )
}

export default Testing
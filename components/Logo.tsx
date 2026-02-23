import { View, Text } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { flowerLogo, Logo } from '@/constants/images';

type logoProps={
    height?:number;
    width?:number;
}

const LeafLogo = ({height=60, width=60}:logoProps) => {
  return (
    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#1A2C2C] border border-white/10 overflow-hidden">
        <Image source={Logo} style={{ width, height }} contentFit="contain" />
    </View>
  )
}


const FlowerLogo = ({height=60, width=60}:logoProps) => {
  return (
    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#1A2C2C] border border-white/10 overflow-hidden">
        <Image source={flowerLogo} style={{ width, height }} contentFit="contain" />
    </View>
  )
}

export {
    LeafLogo,
    FlowerLogo
}

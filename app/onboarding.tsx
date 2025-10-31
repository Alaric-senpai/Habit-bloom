import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useHabitBloom } from '@/contexts/HabitBloomGlobalContext';
import Container from '@/components/Container';
import { Text } from '@/components/ui/text';
const { width, height } = Dimensions.get('window');
import {Image} from 'expo-image'
import { Logo } from '@/constants/images';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
const onboardingData = [
  {
    id: 1,
    title: 'Welcome to HabitBloom',
    subtitle: 'Build better habits one day at a time',
    description: 'Track your daily habits and watch your progress bloom',
    image: Logo,
  },
  {
    id: 2,
    title: 'Track Your Progress',
    subtitle: 'Monitor your daily habits',
    description: 'See your streaks grow and celebrate your achievements',
    image: Logo,
  },
  {
    id: 3,
    title: 'Stay Motivated',
    subtitle: 'Get reminded at the right time',
    description: 'Set custom reminders to keep you on track',
    image: Logo,
  },
  {
    id: 4,
    title: 'Unlock Your Potential',
    subtitle: 'Achieve your goals',
    description: 'Transform your life one habit at a time',
    image: Logo,
  },
];

export default function OnboardingScreen() {
  const pagerRef = useRef<PagerView | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const { triggerHaptic } = useHabitBloom();

  const isLastPage:boolean = currentPage == onboardingData.length-1


  const handleNext = () => {
    triggerHaptic('impact', 'light');
    if (currentPage < onboardingData.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSkip = () => {
    triggerHaptic('impact', 'light');
    router.push('/(auth)/login');
  };

  return (
    <Container>
        <View className="flex-1  relative">
        {/* Skip Button */}


        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          {onboardingData.map((item) => (
            <View
              key={item.id}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
            >
              {/* Logo/Image */}
              <View style={{ width: 256, height: 256, alignItems: 'center', justifyContent: 'center', marginBottom: 48 }}>
                <Image source={item.image} style={{ width: '100%', height: '100%' }} contentFit="contain" />
              </View>

              {/* Content */}
              <View style={{ alignItems: 'center', gap: 10 }}>
                <Text className="text-center leading-12 w-full mb-2 tracking-wider no-underline" variant={'h2'}>{item.title}</Text>
                <Text className="text-center w-11/12 m-auto" variant={'h4'}>{item.subtitle}</Text>
                <Text className="text-center mt-2" variant={'muted'}>{item.description}</Text>
              </View>
            </View>
          ))}
        </PagerView>

        {/* Bottom Section */}
        <View className="pb-12 px-6">
            {/* Pagination Dots */}
            <View className="flex-row justify-center mb-8">
            {onboardingData.map((_, index) => (
                <View
                key={index}
                className={`h-2 rounded-full mx-1 ${
                    index === currentPage
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-white/40'
                }`}
                />
            ))}
            </View>
            <View className='items-center justify-between flex-row w-full '>
                {currentPage < onboardingData.length - 1 && (
                    <Button
                    onPress={handleSkip}
                    className="rounded-full min-h-12  min-w-max w-5/12 items-center bg-gray-400/15"
                    >
                    <Text className=" text-primary font-semibold">Skip</Text>
                    </Button>
                )}
                <View className={cn(isLastPage? null: 'w-2/12' )} />
                {/* Next Button */}
                <Button
                onPress={handleNext}
                className={
                    cn("bg-primary rounded-full min-h-12 items-center", isLastPage ? 'w-full': 'w-5/12')
                }
                >
                <Text className="text-white text-md font-medium">
                    {currentPage === onboardingData.length - 1 ? "Let's Get Started" : 'Next'}
                </Text>
                </Button>
            </View>
        </View>
        </View>
    </Container>
  );
}
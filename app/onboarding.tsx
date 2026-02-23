import React, { useState, useRef } from 'react';
import { Pressable, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import PagerView from 'react-native-pager-view';
import { MotiView } from 'moti';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import Container from '@/components/Container';
import { THEME } from '@/lib/theme';
import { Logo, Onboarding1, Onboarding1a, Onboarding3, Onboarding4 } from '@/constants/images';
import GoogleButton from '@/components/GoogleButton';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: 'Nurture Your',
    decorated: 'Daily Growth',
    subtitle: 'Cultivate better habits and track your mood with our mindful growth assistant.',
    // image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"
    image: Onboarding1a 
  },
  {
    title: 'Build Lasting',
    decorated: 'Habits',
    subtitle: 'Set meaningful daily goals, check off your tasks, and watch your consistency bloom.',
    // image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=1000&auto=format&fit=crop' 
    image: Onboarding1
  },
  {
    title: 'Understand Your',
    decorated: 'Moods',
    subtitle: 'Take a moment to reflect on your daily emotions to build self-awareness.',
    // image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=1000&auto=format&fit=crop'
    image: Onboarding3 
  },
  {
    title: 'Visualize Your',
    decorated: 'Journey',
    subtitle: 'View weekly insights to see how your habits and moods connect.',
    // image: 'https://images.unsplash.com/photo-1446071103084-c257b5f70672?q=80&w=1000&auto=format&fit=crop',
    Image: Onboarding4 
  }
];

const Onboarding = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const isLastStep = currentPage === onboardingSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      pagerRef.current?.setPage(currentPage + 1);
    }
  };

  return (
    <Container>
      {/* --- Header Section --- */}
      <View className="flex-row items-center justify-between px-6 pt-6">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#1A2C2C] border border-white/10 overflow-hidden">
            <Image source={Logo} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          </View>
          <Text className="text-xl font-bold text-white tracking-tight">Habit Bloom</Text>
        </View>

        {!isLastStep && (
          <Pressable 
            hitSlop={20} 
            onPress={() => pagerRef.current?.setPage(onboardingSteps.length - 1)}
          >
            <Text className="text-gray-500 font-medium italic text-base">Skip</Text>
          </Pressable>
        )}
      </View>

      {/* --- Pager View Section --- */}
      <PagerView
        ref={pagerRef}
        style={
          {
            flex: 1
          }
        }
        // className="flex-1"
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {onboardingSteps.map((step, idx) => (
          <View key={idx} className="items-center px-8 pt-6">
            {/* Image Container - Strictly capped at 300px for stability */}
            <View 
              className="w-full h-[280px] rounded-[48px] overflow-hidden border-4 border-[#1A2C2C] bg-[#1A2C2C]"
            >
              <Image 
                source={step.image} 
                style={{ width: '100%', height: 280 }} 
                contentFit="cover"
                transition={200}
              />
              <View className="absolute inset-0 bg-black/10" />
            </View>

            {/* Text Content */}
            <View className="mt-10 w-full items-center">
              <Text className="text-center text-[40px] font-bold text-white leading-[1.1] tracking-tighter">
                {step.title}{'\n'}
                <Text className="text-primary text-md">{step.decorated}</Text>
              </Text>

              <Text className="mt-4 text-center text-gray-400 text-[17px] leading-6 px-4">
                {step.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </PagerView>

      {/* --- Footer Controls --- */}
      <View className="px-8 pb-12">
        {/* Pagination Dots */}
        <View className="my-3 flex-row justify-center gap-2.5">
          {onboardingSteps.map((_, idx) => (
            <MotiView
              key={idx}
              animate={{
                width: currentPage === idx ? 32 : 10,
                backgroundColor: currentPage === idx ? THEME.dark.primary : '#1A2C2C',
              }}
              transition={{ type: 'timing', duration: 250 }}
              className="h-2.5 rounded-full"
            />
          ))}
        </View>

        {/* Action Button Section - Zero animation lag swap */}
        <View className="min-h-[70px] mt-2">
          {!isLastStep ? (
            <Button 
              onPress={handleNext}
              className="h-[70px] w-full rounded-full bg-primary/95 shadow-2xl shadow-primary/40"
            >
              <Text className="text-xl font-extrabold text-[#0B1515]">Continue</Text>
            </Button>
          ) : (
            <View className="w-full">
               <GoogleButton />
               
            </View>
          )}
        </View>
      </View>
    </Container>
  );
};

export default Onboarding;
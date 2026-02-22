import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  Extrapolate,
  withDelay,
} from 'react-native-reanimated';
import { useHabitBloom } from '@/contexts/HabitBloomGlobalContext';
import Container from '@/components/Container';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';

const onboardingData = [
  {
    id: 1,
    emoji: '🌱',
    title: 'Welcome to HabitBloom',
    subtitle: 'Your Journey to Better Habits',
    description: 'Transform your life one small habit at a time. Every day is a new opportunity to grow.',
    color: '#1FAB89',
    bgGradient: ['#1FAB89', '#34C77B'],
  },
  {
    id: 2,
    emoji: '🔥',
    title: 'Build Epic Streaks',
    subtitle: 'Consistency is Your Superpower',
    description: 'Stack daily wins and watch your momentum become unstoppable. Your streak tells your story.',
    color: '#FF9F43',
    bgGradient: ['#F76C30', '#FF9F43'],
  },
  {
    id: 3,
    emoji: '🎯',
    title: 'Level Up Your Life',
    subtitle: 'Earn XP & Unlock Achievements',
    description: 'Complete habits, gain experience, and celebrate every milestone with badges and rewards.',
    color: '#B157E8',
    bgGradient: ['#B157E8', '#8B5CF6'],
  },
  {
    id: 4,
    emoji: '🏆',
    title: 'Achieve Greatness',
    subtitle: 'Your Future Self Will Thank You',
    description: "Small daily actions create extraordinary results. Ready to make every day count?",
    color: '#FFAA00',
    bgGradient: ['#FFAA00', '#3B9EF5'],
  },
];

function OnboardingScreen() {
  const pagerRef = useRef<PagerView | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const { triggerHaptic } = useHabitBloom();

  // Shared values for animations
  const emojiScale = useSharedValue(0);
  const emojiRotate = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const descriptionOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);

  const isLastPage = currentPage === onboardingData.length - 1;

  // Initial mount animation for button (only once)
  useEffect(() => {
    buttonScale.value = withDelay(
      800,
      withSpring(1, { damping: 10, stiffness: 100 })
    );
  }, []);

  // Trigger animations when page changes
  useEffect(() => {
    // Reset animations
    emojiScale.value = 0.5;
    emojiRotate.value = -180;
    titleOpacity.value = 0;
    titleTranslateY.value = 30;
    subtitleOpacity.value = 0;
    descriptionOpacity.value = 0;

    // Sequence animations
    emojiScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
    emojiRotate.value = withSpring(0, {
      damping: 15,
      stiffness: 80,
    });

    titleOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    titleTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 15, stiffness: 100 })
    );

    subtitleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    descriptionOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // Continuous gentle pulse for emoji
    setTimeout(() => {
      emojiScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, 1000);
  }, [currentPage]);

  // Animated styles
  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { rotate: `${emojiRotate.value}deg` },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const descriptionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

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
      <View className="flex-1">
        {/* Skip Button - Fixed at top */}
        <View className="px-6 pt-2 pb-4 absolute top-0 right-0 z-10">
          {currentPage < onboardingData.length - 1 && (
            <Button
              onPress={handleSkip}
              variant="ghost"
              className="rounded-full px-6"
            >
              <Text className="text-muted-foreground font-semibold">Skip</Text>
            </Button>
          )}
        </View>

        {/* Content Area */}
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          {onboardingData.map((item, index) => (
            <View key={item.id} className="flex-1 items-center justify-center px-8 pt-24">
              {/* Emoji Icon with Gradient Background */}
              <Animated.View 
                style={[emojiAnimatedStyle]}
                className="w-48 h-48 items-center justify-center mb-12 rounded-full bg-card shadow-2xl"
              >
                <View className="w-44 h-44 items-center justify-center rounded-full bg-primary/10">
                  <Text style={{ fontSize: 96 }}>{item.emoji}</Text>
                </View>
              </Animated.View>

              {/* Text Content */}
              <View className="items-center w-full">
                <Animated.View style={titleAnimatedStyle}>
                  <Text 
                    className="text-center font-extrabold mb-4 tracking-tight leading-tight"
                    style={{ fontSize: 32, lineHeight: 38 }}
                  >
                    {item.title}
                  </Text>
                </Animated.View>
                
                <Animated.View style={subtitleAnimatedStyle}>
                  <Text 
                    className="text-primary font-bold text-center mb-4"
                    style={{ fontSize: 18 }}
                  >
                    {item.subtitle}
                  </Text>
                </Animated.View>
                
                <Animated.View style={descriptionAnimatedStyle}>
                  <Text 
                    className="text-muted-foreground text-center leading-relaxed"
                    style={{ fontSize: 16, lineHeight: 24, width: '90%' }}
                  >
                    {item.description}
                  </Text>
                </Animated.View>
              </View>
            </View>
          ))}
        </PagerView>

        {/* Bottom Section - Fixed at bottom */}
        <View className="px-6 pb-8 gap-6">
          {/* Pagination Dots */}
          <View className="flex-row justify-center gap-2">
            {onboardingData.map((_, dotIndex) => (
              <View
                key={dotIndex}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  dotIndex === currentPage
                    ? 'w-8 bg-primary'
                    : dotIndex < currentPage
                    ? 'w-2 bg-success'
                    : 'w-2 bg-muted'
                )}
              />
            ))}
          </View>

          {/* Action Button */}
          <Animated.View style={buttonAnimatedStyle}>
            <Button
              onPress={handleNext}
              className="rounded-2xl min-h-16 items-center justify-center shadow-lg bg-primary"
            >
              <Text className="text-primary-foreground text-lg font-extrabold">
                {isLastPage ? "Let's Bloom 🚀" : 'Next'}
              </Text>
            </Button>
          </Animated.View>

          {/* Helper Text */}
          {isLastPage && (
            <Animated.View style={descriptionAnimatedStyle}>
              <Text className="text-center text-muted-foreground text-sm">
                Join thousands growing their best habits daily
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Container>
  );
}

export default OnboardingScreen;
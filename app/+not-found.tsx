import { Link, Stack, router } from 'expo-router';
import { View, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import { Text } from '@/components/ui/text';
import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import ScrollableContainer from '@/components/ScrollableContainer';
import ArrowBackComponent from '@/components/ArrowBackComponent';

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation refs
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scale and fade in animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      handleGoHome();
    }
  };

  const handleRefresh = () => {
    // router.replace(router. as any);
    router.reload()
  };

  return (
    <>

      <ScrollableContainer >
        {/* Header */}
        <View className='mt-8' />
        <View className='px-6 py-4 flex-row gap-2 items-center'>
          <ArrowBackComponent />
            <Text className='text-base text-gray-900 dark:text-white font-medium'>
              Go Back
            </Text>
        </View>

        {/* Content */}
        <View className='flex-1 items-center justify-center px-8'>
          <Animated.View
            style={{
              flex: 1,
              transform: [
                { translateY: floatAnim },
                { scale: scaleAnim }
              ],
              opacity: fadeAnim,
            }}
          >
            {/* 404 Illustration */}
            <View className='items-center mb-8'>
              <Text className='text-9xl font-bold text-gray-200 dark:text-gray-800'>
                404
              </Text>
            </View>

            {/* Title */}
            <Text className='text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center'>
              Oops! Page Not Found
            </Text>

            {/* Description */}
            <Text className='text-base text-gray-600 dark:text-gray-400 text-center mb-8 leading-6'>
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track!
            </Text>



            {/* Action Buttons */}
            <View className='space-y-3'>
              {/* Primary Action - Home */}
              <TouchableOpacity
                onPress={handleGoHome}
                className='flex-row items-center my-2 justify-center bg-blue-600 rounded-xl p-4 active:bg-blue-700'
                activeOpacity={0.8}
              >
                <Home size={20} color='#ffffff' />
                <Text className='text-white font-semibold text-base ml-2'>
                  Go to Home
                </Text>
              </TouchableOpacity>

              {/* Secondary Actions */}
              <View className='flex-row gap-3 my-2'>
                <TouchableOpacity
                  onPress={handleGoBack}
                  className='flex-1 flex-row items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4 active:bg-gray-200 dark:active:bg-gray-700'
                  activeOpacity={0.8}
                >
                  <ArrowLeft size={18} className='text-gray-900 dark:text-white' />
                  <Text className='text-gray-900 dark:text-white font-medium text-sm ml-2'>
                    Go Back
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRefresh}
                  className='flex-1 flex-row items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4 active:bg-gray-200 dark:active:bg-gray-700'
                  activeOpacity={0.8}
                >
                  <RefreshCw size={18} className='text-gray-900 dark:text-white' />
                  <Text className='text-gray-900 dark:text-white font-medium text-sm ml-2'>
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Links */}
            <View className='mt-8 w-full'>
              <Text className='text-sm text-gray-600 dark:text-gray-400 mb-3 text-center font-medium'>
                Quick Links
              </Text>
              <View className='flex-row flex-wrap justify-center gap-2'>
                <Link href='/(tabs)' asChild>
                  <TouchableOpacity className='px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full'>
                    <Text className='text-xs text-gray-900 dark:text-white font-medium'>
                      Home
                    </Text>
                  </TouchableOpacity>
                </Link>
                <Link href='/(tabs)/habits' asChild>
                  <TouchableOpacity className='px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full'>
                    <Text className='text-xs text-gray-900 dark:text-white font-medium'>
                      Habits
                    </Text>
                  </TouchableOpacity>
                </Link>
                <Link href='/(tabs)/report' asChild>
                  <TouchableOpacity className='px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full'>
                    <Text className='text-xs text-gray-900 dark:text-white font-medium'>
                      Stats
                    </Text>
                  </TouchableOpacity>
                </Link>
                <Link href='/(tabs)/account' asChild>
                  <TouchableOpacity className='px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full'>
                    <Text className='text-xs text-gray-900 dark:text-white font-medium'>
                      Account
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Footer */}
        <View className='px-8 pb-8'>
          <Text className='text-xs text-gray-500 dark:text-gray-500 text-center'>
            If you believe this is an error, please contact support
          </Text>
        </View>
      </ScrollableContainer>
    </>
  );
}
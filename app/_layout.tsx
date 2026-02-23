import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Image } from 'expo-image';
import { Logo } from '@/constants/images';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { HabitBloomContextProvider, useHabitBloom } from '@/contexts/HabitBloomGlobalContext';

import * as NavigationBar from 'expo-navigation-bar'

import { vexo } from 'vexo-analytics'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';

if(!__DEV__){
  vexo('ad8ad4c9-4261-47f0-b661-e0cc06254fde')
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();




  useEffect(() => {
    const hideSystemNavigation = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync('transparent');
        await NavigationBar.setVisibilityAsync('hidden');
      }
    };

    hideSystemNavigation();
  }, []);

  return (
    
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{flex: 1}}>
        <BottomSheetModalProvider>
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
              <HabitBloomContextProvider>
                  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                  <Routes />
                  <PortalHost />
              </HabitBloomContextProvider>
          </ThemeProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ============================================================================
// Protected Routes Component
// ============================================================================
function Routes() {
  const {isLoading} = useHabitBloom()
  const segments = useSegments()
  const router = useRouter()

  const isAuthenticated = true

  if(isLoading){
    return (
    <View className="flex-1 justify-between items-center py-16 bg-white">
      <Image
        source={Logo}
        style={{ width: 120, height: 120, borderRadius: 24 }}
        contentFit="contain"
      />
      <ActivityIndicator size="large" color="teal" />
    </View>

    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Public Routes - accessible when NOT authenticated */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
      </Stack.Protected>

      {/* Protected Routes - accessible when authenticated */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="habits/[id]" options={{headerShown: false}} />
      </Stack.Protected>


    </Stack>
  );
}

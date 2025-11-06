import { HabitBloomProvider, useAuth, useHabitBloom } from '@/contexts/HabitBloomGlobalContext';
import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Platform, ActivityIndicator, View, Text } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { initializeDatabase } from '@/database/db';
import * as splashScreen from 'expo-splash-screen'
import { Image } from 'expo-image';
import { Logo } from '@/constants/images';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';

splashScreen.preventAutoHideAsync()
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(()=>{
    splashScreen.hideAsync()
  },[])

  useEffect(() => {
    if (colorScheme === 'dark') {
      setColorScheme('light');
    }
  }, [colorScheme]);

  console.log('Active color scheme', colorScheme)

  useEffect(() => {
    const RunMigrations = async () => {
      try {
        await initializeDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Error when initializing the database', error);
      }
    };

    RunMigrations();
  }, []);

  // useEffect(() => {
  //   const hideSystemNavigation = async () => {
  //     if (Platform.OS === 'android') {
  //       await NavigationBar.setPositionAsync('absolute');
  //       await NavigationBar.setBackgroundColorAsync('transparent');
  //       await NavigationBar.setVisibilityAsync('hidden');
  //     }
  //   };

  //   hideSystemNavigation();
  // }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <SafeAreaView></SafeAreaView> */}
      <BottomSheetModalProvider>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <HabitBloomProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Routes />
            <PortalHost />
          </HabitBloomProvider>
        </ThemeProvider>

      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

// ============================================================================
// Protected Routes Component
// ============================================================================
function Routes() {
  const {auth} = useAuth()
  const {isInitializing} = useHabitBloom()
  const segments = useSegments()
  const router = useRouter()

  // Log current route whenever segments change
  useEffect(() => {
    const currentRoute = segments.length > 0 ? `/${segments.join('/')}` : '/';
    console.log('Current route:', currentRoute);
  }, [segments]);

  console.log('Current auth state', auth)

  console.log('initalization state', isInitializing)

  const isAuthenticated = auth.isAuthenticated

  if(isInitializing){
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

      
      {/* Index route that handles initial navigation */}
      
      {/* Protected Tab Routes */}
    </Stack>
  );
}

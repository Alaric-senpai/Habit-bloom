import { HabitBloomProvider } from '@/contexts/HabitBloomGlobalContext';
import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  
  console.log(colorScheme)

  return (
    <ThemeProvider value={NAV_THEME[ colorScheme ?? 'light']}>
      <HabitBloomProvider>
      {/* <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} /> */}
      {/* <Stack /> */}
      <Routes />
      <PortalHost />
    </HabitBloomProvider>
    </ThemeProvider>

  );
}


const Routes = ()=>{
  // const protect:boolean = true
  return (
    <Stack>
        <Stack.Screen name='onboarding' options={{headerShown:false}} />
        <Stack.Screen name='(auth)/login' options={{headerShown: false}} />
        <Stack.Screen name='(auth)/register' options={{headerShown: false}} />
        <Stack.Screen name='index' options={{headerShown:false}} />
      {/* <Stack.Protected guard={false} >
      </Stack.Protected>
      <Stack.Protected guard={protect}>
      </Stack.Protected> */}
    </Stack>
  )
}

// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'habitbloom',
  slug: 'habitbloom',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/images/logo.png',
  
  scheme: 'habitbloom',
  
  userInterfaceStyle: 'automatic',
  
  newArchEnabled: true,
  
  splash: {
    image: './assets/images/leaf-logo.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
    dark: {
        backgroundColor: '#0D1B1E', // Dark teal from theme
    }
  },
  
  assetBundlePatterns: ['**/*'],
  
  ios: {
    supportsTablet: true,
    userInterfaceStyle: 'dark',
  },
  
  android: {
    edgeToEdgeEnabled: true,
    
    // Adaptive icon with dark teal background
    adaptiveIcon: {
      foregroundImage: './assets/images/leaf-logo.png',
    //   backgroundColor: '#0D1B1E', // Dark teal matching theme
    },
    
    permissions: [
        "android.permission.READ_CALENDAR",
        "android.permission.WRITE_CALENDAR",
        "android.permission.READ_CALENDAR",
        "android.permission.WRITE_CALENDAR"
    ],
    
    package: 'com.habitbloom.app',
    googleServicesFile: './google-services.json',
    
    // Force dark mode for Android
    userInterfaceStyle: 'dark',
  },
  
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/logo.png',
  },
  
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-calendar',
      {
        calendarPermission: 'The app needs to access your calendar to schedule habit reminders.',
        remindersPermission: 'Allow HabitBloom to access your reminders for habit tracking.',
      },
    ],
    'expo-notifications',  
    'expo-secure-store',
    '@react-native-google-signin/google-signin',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '5aef5676-cf23-432d-bdc8-ca317d7ddfaa',
    },

    instantid: process.env.EXPO_PUBLIC_INSTANT_APP_ID!,
    clerkKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    instantAdmin: process.env.INSTANT_APP_ADMIN_TOKEN


  },
  
  owner: 'alaric987',
  
  runtimeVersion: {
    policy: 'appVersion',
  },
  
  updates: {
    url: 'https://u.expo.dev/5aef5676-cf23-432d-bdc8-ca317d7ddfaa',
  },
});
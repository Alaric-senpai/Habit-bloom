import { router } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Home } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <View className='flex-1 items-center justify-center px-6 bg-background'>
      <Text className='text-6xl font-bold text-muted-foreground mb-4'>
        404
      </Text>
      
      <Text className='text-xl font-semibold text-foreground mb-2 text-center'>
        Page Not Found
      </Text>
      
      <Text className='text-sm text-muted-foreground text-center mb-8'>
        The page you're looking for doesn't exist
      </Text>

      <Pressable
        onPress={() => router.replace('/(tabs)')}
        className='flex-row items-center justify-center bg-primary rounded-xl px-6 py-3'
      >
        <Home size={18} color='white' />
        <Text className='text-white font-semibold ml-2'>
          Go Home
        </Text>
      </Pressable>
    </View>
  );
}
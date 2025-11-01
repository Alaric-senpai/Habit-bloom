import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/HabitBloomGlobalContext';
import { useHabitBloom } from '@/contexts/HabitBloomGlobalContext';
import { Ionicons } from '@expo/vector-icons';
import ScrollableContainer from '@/components/ScrollableContainer';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, ChevronLeft } from 'lucide-react-native';
import ArrowBackComponent from '@/components/ArrowBackComponent';

// ============================================================================
// Login Screen
// ============================================================================
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { auth, login } = useAuth();
  const { triggerHaptic } = useHabitBloom();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      triggerHaptic('error');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    triggerHaptic('impact', 'light');
    const success = await login(email, password);

    if (success) {
      triggerHaptic('success');
      router.replace('/');
    } else {
      triggerHaptic('error');
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  const handleGoogleLogin = () => {
    triggerHaptic('impact', 'light');
    Alert.alert('Coming Soon', 'Google sign-in will be available soon!');
  };

  return (

    <ScrollableContainer>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 p-4 mt-2"
    >
        <View className="mb-2">
          <ArrowBackComponent />

          <Text className='dark:text-white text-3xl leading-14 tracking-wider mb-2 font-bold'>Welcome Back! 👋</Text>
          <Text className='dark:text-white text-md my-2 font-light'>Sign in to access your personalized habit tracking experience</Text>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold ">Email</Text>
          <View className="flex-row items-center rounded-2xl oveflow-hidden bg-gray-200 dark:bg-slate-900 p-2 px-4 overflow-hidden">
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="flex-1 ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold ">Password</Text>
          <View className="flex-row items-center rounded-2xl oveflow-hidden bg-gray-200 dark:bg-slate-900 p-2 px-4 overflow-hidden">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity className="self-end mb-6">
          <Text className="text-[#8B7FFF] text-sm font-semibold">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={auth.isLoading}
          className="bg-primary py-4 rounded-full overflow-hidden items-center mb-4"
          activeOpacity={0.8}
        >
          {auth.isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">Sign In</Text>
          )}
        </TouchableOpacity>



        {/* Sign Up Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-500 text-base">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-[#8B7FFF] text-base font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </ScrollableContainer>
  );
}

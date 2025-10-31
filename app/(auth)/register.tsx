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
import { ArrowLeft } from 'lucide-react-native';
import ArrowBackComponent from '@/components/ArrowBackComponent';


// ============================================================================
// Register Screen
// ============================================================================
export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { auth, register } = useAuth();
  const { triggerHaptic } = useHabitBloom();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      triggerHaptic('error');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      triggerHaptic('error');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      triggerHaptic('error');
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    triggerHaptic('impact', 'light');
    const success = await register(email, password, name);

    if (success) {
      triggerHaptic('success');
      router.replace('/');
    } else {
      triggerHaptic('error');
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
        <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 p-4 mt-2"
    >
    <ScrollableContainer>
        {/* Logo */}
        <View className="mb-2">
          <ArrowBackComponent />

          <Text className='dark:text-white text-3xl leading-14 tracking-wider mb-2 font-bold'>Join Habit Bloom Today</Text>
          <Text className='dark:text-white text-md my-2 font-light'>Start your habit journey today with Habit bloom. its quick easy and free</Text>
        </View>

        {/* Name Input */}
        <View className="mb-4">
          <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">Full Name</Text>
          <View className="flex-row items-center rounded-2xl oveflow-hidden bg-gray-600 dark:bg-slate-900 p-2 px-4 overflow-hidden">
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              className="flex-1 ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">Email</Text>
          <View className="flex-row items-center rounded-2xl oveflow-hidden bg-gray-600 dark:bg-slate-900 p-2 px-4 overflow-hidden">
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
        <View className="mb-4">
          <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">Password</Text>
          <View className="flex-row items-center rounded-2xl oveflow-hidden bg-gray-600 dark:bg-slate-900 p-2 px-4 overflow-hidden">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Create a password"
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

        {/* Confirm Password Input */}
        <View className="mb-6">
          <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
            Confirm Password
          </Text>
          <View className="flex-row items-center rounded-2xl oveflow-hidden bg-gray-600 dark:bg-slate-900 p-2 px-4 overflow-hidden">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              className="flex-1 ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={auth.isLoading}
          className="bg-[#8B7FFF] rounded-2xl py-4 items-center mb-6"
          activeOpacity={0.8}
        >
          {auth.isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-500 text-base">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-[#8B7FFF] text-base font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollableContainer>
    </KeyboardAvoidingView>
  );
}
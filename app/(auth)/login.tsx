import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useHabitBloom } from '@/contexts/HabitBloomGlobalContext';
import { Ionicons } from '@expo/vector-icons';
import ScrollableContainer from '@/components/ScrollableContainer';
import ArrowBackComponent from '@/components/ArrowBackComponent';
import { loginSchema, type LoginSchemaType } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

// ============================================================================
// Login Screen (React Hook Form + Zod validation)
// ============================================================================
export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { auth, login } = useAuth();
  const { triggerHaptic } = useHabitBloom();
  const router = useRouter();
  const confirmationModalRef = useRef<any>(null);

  // Initialize React Hook Form with Zod
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    triggerHaptic('impact', 'light');
    const success = await login(data);

    if (success) {
      triggerHaptic('success');
      router.replace('/');
    } else {
      triggerHaptic('error');
      confirmationModalRef.current?.show('error', 'Error', 'Invalid email or password');
    }
  };

  const handleGoogleLogin = () => {
    triggerHaptic('impact', 'light');
    confirmationModalRef.current?.show('info', 'Coming Soon', 'Google sign-in will be available soon!');
  };

  return (
    <ScrollableContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 p-4 mt-2"
      >
        <View className="mb-2">
          <ArrowBackComponent />
          <Text className="dark:text-white text-3xl leading-14 tracking-wider mb-2 font-bold">
            Welcome Back! 👋
          </Text>
          <Text className="dark:text-white text-md my-2 font-light">
            Sign in to access your personalized habit tracking experience
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center rounded-2xl bg-gray-200 dark:bg-slate-900 p-2 px-4 overflow-hidden">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center rounded-2xl bg-gray-200 dark:bg-slate-900 p-2 px-4 overflow-hidden">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
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
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Forgot Password */}
        <TouchableOpacity className="self-end mb-6">
          <Text className="text-[#8B7FFF] text-sm font-semibold">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
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
      
      <ConfirmationModal ref={confirmationModalRef} />
    </ScrollableContainer>
  );
}

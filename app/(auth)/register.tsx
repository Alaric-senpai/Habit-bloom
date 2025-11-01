import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useHabitBloom } from '@/contexts/HabitBloomGlobalContext';
// Ionicons used inside InputField; not needed directly here
import ScrollableContainer from '@/components/ScrollableContainer';
import ArrowBackComponent from '@/components/ArrowBackComponent';
import { registerSchema, type RegisterSchemaType } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '@/components/InputField';

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { auth, register } = useAuth();
  const { triggerHaptic } = useHabitBloom();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      timezone: 'Africa/Nairobi',
    },
  });

  // leave data un-annotated so react-hook-form's inferred type from the resolver
  // can be used without TypeScript conflicts caused by zod defaults
  const onSubmit = async (data: any) => {
    triggerHaptic('impact', 'light');

    console.log('register dto', data)
    // const success = await register(data);

    // if (success) {
    //   triggerHaptic('success');
    //   router.replace('/');
    // } else {
    //   triggerHaptic('error');
    //   Alert.alert('Error', 'Registration failed. Please try again.');
    // }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 p-4 mt-2"
    >
      <ScrollableContainer>
        <View className="mb-2">
          <ArrowBackComponent />
          <Text className="dark:text-white text-3xl leading-14 tracking-wider mb-2 font-bold">
            Join Habit Bloom Today
          </Text>
          <Text className="dark:text-white text-md my-2 font-light">
            Start your habit journey today with Habit Bloom. It's quick, easy, and free.
          </Text>
        </View>

        {/* Name Input */}
        <InputField
          control={control}
          name="name"
          icon="person-outline"
          placeholder="Enter your name"
          label="Full Name"
          error={errors.name?.message}
        />

        {/* Email Input */}
        <InputField
          control={control}
          name="email"
          icon="mail-outline"
          placeholder="Enter your email"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email?.message}
        />

        {/* Password Input */}
        <InputField
          control={control}
          name="password"
          icon="lock-closed-outline"
          placeholder="Create a password"
          label="Password"
          secureTextEntry={!showPassword}
          toggleSecure={() => setShowPassword(!showPassword)}
          showToggle
          error={errors.password?.message}
        />

        {/* Confirm Password Input */}
        <InputField
          control={control}
          name="confirmPassword"
          icon="lock-closed-outline"
          placeholder="Confirm your password"
          label="Confirm Password"
          secureTextEntry={!showPassword}
          error={errors.confirmPassword?.message}
        />

          <InputField
          control={control}
          name="timezone"
          icon="lock-closed-outline"
          placeholder="Africa/Nairobi"
          label="Confirm Password"
          error={errors.timezone?.message}
        />

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
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


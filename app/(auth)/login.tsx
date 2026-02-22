import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth, useHabitBloom } from '@/contexts/HabitBloomGlobalContext';
import { Ionicons } from '@expo/vector-icons';
import Container from '@/components/Container';
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

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const emailScale = useSharedValue(0.9);
  const emailOpacity = useSharedValue(0);
  const passwordScale = useSharedValue(0.9);
  const passwordOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);
  const linkOpacity = useSharedValue(0);

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

  // Trigger animations on mount
  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Email field
    emailOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    emailScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));

    // Password field
    passwordOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    passwordScale.value = withDelay(400, withSpring(1, { damping: 12, stiffness: 100 }));

    // Button
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonScale.value = withDelay(600, withSpring(1, { damping: 10, stiffness: 100 }));

    // Links
    linkOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const emailAnimatedStyle = useAnimatedStyle(() => ({
    opacity: emailOpacity.value,
    transform: [{ scale: emailScale.value }],
  }));

  const passwordAnimatedStyle = useAnimatedStyle(() => ({
    opacity: passwordOpacity.value,
    transform: [{ scale: passwordScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const linkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: linkOpacity.value,
  }));

  const onSubmit = async (data: LoginSchemaType) => {
    triggerHaptic('impact', 'light');
    
    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    const success = await login(data);

    if (success) {
      triggerHaptic('success');
      router.replace('/');
    } else {
      triggerHaptic('error');
      // Shake animation on error
      emailScale.value = withSequence(
        withTiming(1.02, { duration: 50 }),
        withTiming(0.98, { duration: 50 }),
        withTiming(1.02, { duration: 50 }),
        withTiming(1, { duration: 50 })
      );
      passwordScale.value = withSequence(
        withTiming(1.02, { duration: 50 }),
        withTiming(0.98, { duration: 50 }),
        withTiming(1.02, { duration: 50 }),
        withTiming(1, { duration: 50 })
      );
      confirmationModalRef.current?.show('error', 'Error', 'Invalid email or password');
    }
  };

  const handleGoogleLogin = () => {
    triggerHaptic('impact', 'light');
    confirmationModalRef.current?.show('info', 'Coming Soon', 'Google sign-in will be available soon!');
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={headerAnimatedStyle} className="mb-2">
            <ArrowBackComponent />
            <Text className="text-foreground text-4xl leading-tight tracking-wide mb-3 font-extrabold">
              Welcome Back! 🌱
            </Text>
            <Text className="text-muted-foreground text-base my-2 font-normal leading-relaxed">
              Ready to continue your growth journey? Your habits are waiting to bloom!
            </Text>
          </Animated.View>

          {/* Email Input */}
          <Animated.View style={emailAnimatedStyle} className="mb-4">
          <Text className="text-foreground text-sm my-3 font-bold">
            Email Address
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center rounded-2xl bg-card border-2 border-border p-3 px-4">
                <Ionicons name="mail-outline" size={22} color="hsl(165, 75%, 45%)" />
                <TextInput
                  placeholder="your.email@example.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-3 text-base text-foreground font-medium"
                  placeholderTextColor="hsl(150, 8%, 65%)"
                />
              </View>
            )}
          />
          {errors.email && (
            <Text className="text-destructive text-sm mt-2 font-medium">
              {errors.email.message}
            </Text>
          )}
        </Animated.View>

        {/* Password Input */}
        <Animated.View style={passwordAnimatedStyle} className="mb-6">
          <Text className="text-foreground text-sm my-3 font-bold">
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center rounded-2xl bg-card border-2 border-border p-3 px-4">
                <Ionicons name="lock-closed-outline" size={22} color="hsl(165, 75%, 45%)" />
                <TextInput
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-base text-foreground font-medium"
                  placeholderTextColor="hsl(150, 8%, 65%)"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="hsl(165, 75%, 45%)"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && (
            <Text className="text-destructive text-sm mt-2 font-medium">
              {errors.password.message}
            </Text>
          )}
        </Animated.View>

        {/* Forgot Password */}
        <Animated.View style={linkAnimatedStyle}>
          <TouchableOpacity className="self-end mb-6">
            <Text className="text-primary text-sm font-bold">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Button */}
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={auth.isLoading}
            className="bg-primary py-4 rounded-2xl items-center mb-6 shadow-lg"
            activeOpacity={0.8}
          >
            {auth.isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-primary-foreground text-lg font-extrabold">Sign In 🚀</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Sign Up Link */}
        <Animated.View style={linkAnimatedStyle} className="flex-row justify-center items-center mb-4">
          <Text className="text-muted-foreground text-base">New to HabitBloom? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-primary text-base font-extrabold">Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <ConfirmationModal ref={confirmationModalRef} />
    </Container>
  );
}

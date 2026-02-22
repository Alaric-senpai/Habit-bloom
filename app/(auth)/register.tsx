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
// Ionicons used inside InputField; not needed directly here
import Container from '@/components/Container';
import ArrowBackComponent from '@/components/ArrowBackComponent';
import { registerSchema, type RegisterSchemaType } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '@/components/InputField';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { auth, register } = useAuth();
  const { triggerHaptic } = useHabitBloom();
  const router = useRouter();
  const confirmationModalRef = useRef<any>(null);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const field1Opacity = useSharedValue(0);
  const field1TranslateX = useSharedValue(-30);
  const field2Opacity = useSharedValue(0);
  const field2TranslateX = useSharedValue(30);
  const field3Opacity = useSharedValue(0);
  const field3TranslateX = useSharedValue(-30);
  const field4Opacity = useSharedValue(0);
  const field4TranslateX = useSharedValue(30);
  const field5Opacity = useSharedValue(0);
  const field5TranslateX = useSharedValue(-30);
  const buttonScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);
  const linkOpacity = useSharedValue(0);

  const {
    control,
    handleSubmit,
    reset,
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

  // Trigger animations on mount
  useEffect(() => {
    // Header
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Stagger field animations with slide-in effect
    const fieldDelay = 150;
    
    field1Opacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    field1TranslateX.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));

    field2Opacity.value = withDelay(200 + fieldDelay, withTiming(1, { duration: 500 }));
    field2TranslateX.value = withDelay(200 + fieldDelay, withSpring(0, { damping: 15, stiffness: 100 }));

    field3Opacity.value = withDelay(200 + fieldDelay * 2, withTiming(1, { duration: 500 }));
    field3TranslateX.value = withDelay(200 + fieldDelay * 2, withSpring(0, { damping: 15, stiffness: 100 }));

    field4Opacity.value = withDelay(200 + fieldDelay * 3, withTiming(1, { duration: 500 }));
    field4TranslateX.value = withDelay(200 + fieldDelay * 3, withSpring(0, { damping: 15, stiffness: 100 }));

    field5Opacity.value = withDelay(200 + fieldDelay * 4, withTiming(1, { duration: 500 }));
    field5TranslateX.value = withDelay(200 + fieldDelay * 4, withSpring(0, { damping: 15, stiffness: 100 }));

    // Button
    buttonOpacity.value = withDelay(200 + fieldDelay * 5, withTiming(1, { duration: 500 }));
    buttonScale.value = withDelay(200 + fieldDelay * 5, withSpring(1, { damping: 10, stiffness: 100 }));

    // Links
    linkOpacity.value = withDelay(200 + fieldDelay * 6, withTiming(1, { duration: 500 }));
  }, []);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const field1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: field1Opacity.value,
    transform: [{ translateX: field1TranslateX.value }],
  }));

  const field2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: field2Opacity.value,
    transform: [{ translateX: field2TranslateX.value }],
  }));

  const field3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: field3Opacity.value,
    transform: [{ translateX: field3TranslateX.value }],
  }));

  const field4AnimatedStyle = useAnimatedStyle(() => ({
    opacity: field4Opacity.value,
    transform: [{ translateX: field4TranslateX.value }],
  }));

  const field5AnimatedStyle = useAnimatedStyle(() => ({
    opacity: field5Opacity.value,
    transform: [{ translateX: field5TranslateX.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const linkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: linkOpacity.value,
  }));

  // leave data un-annotated so react-hook-form's inferred type from the resolver
  // can be used without TypeScript conflicts caused by zod defaults
  const onSubmit = async (data: any) => {
    triggerHaptic('impact', 'light');

    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    console.log('register dto', data)
    const success = await register(data);

    console.log('Register sucees', success)

    if (success) {
      reset()
      triggerHaptic('success');
      router.replace('/(tabs)');
    } else {
      triggerHaptic('error');
      confirmationModalRef.current?.show('error', 'Error', 'Registration failed. Please try again.');
    }
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
              Start Blooming! 🌸
            </Text>
            <Text className="text-muted-foreground text-base my-2 font-normal leading-relaxed">
              Join thousands transforming their lives one habit at a time. Your journey starts now!
            </Text>
          </Animated.View>

          {/* Name Input */}
          <Animated.View style={field1AnimatedStyle}>
            <InputField
              control={control}
              name="name"
              icon="person-outline"
              placeholder="Enter your name"
              label="Full Name"
              error={errors.name?.message}
            />
          </Animated.View>

          {/* Email Input */}
          <Animated.View style={field2AnimatedStyle}>
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
          </Animated.View>

          {/* Password Input */}
          <Animated.View style={field3AnimatedStyle}>
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
          </Animated.View>

          {/* Confirm Password Input */}
          <Animated.View style={field4AnimatedStyle}>
            <InputField
              control={control}
              name="confirmPassword"
              icon="lock-closed-outline"
              placeholder="Confirm your password"
              label="Confirm Password"
              secureTextEntry={!showPassword}
              error={errors.confirmPassword?.message}
            />
          </Animated.View>

          <Animated.View style={field5AnimatedStyle}>
            <InputField
              control={control}
              name="timezone"
              icon="globe"
              placeholder="Africa/Nairobi"
              label="Timezone"
              error={errors.timezone?.message}
            />
          </Animated.View>

          {/* Register Button */}
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={auth.isLoading}
              className="bg-primary rounded-2xl py-4 items-center mb-6 shadow-lg"
              activeOpacity={0.8}
            >
              {auth.isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-primary-foreground text-lg font-extrabold">Create Account 🎉</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Sign In Link */}
          <Animated.View style={linkAnimatedStyle} className="flex-row justify-center items-center mb-4">
            <Text className="text-muted-foreground text-base">Already blooming? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-primary text-base font-extrabold">Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <ConfirmationModal ref={confirmationModalRef} />
    </Container>
  );
}


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
import { Ionicons } from '@expo/vector-icons';
import ScrollableContainer from '@/components/ScrollableContainer';
import ArrowBackComponent from '@/components/ArrowBackComponent';
import { registerSchema, type RegisterSchemaType } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Reusable input component
export default function InputField({
  control,
  name,
  icon,
  placeholder,
  label,
  error,
  secureTextEntry,
  toggleSecure,
  showToggle,
  ...rest
}: any) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View className="flex-row items-center rounded-2xl bg-gray-200 dark:bg-slate-900 p-2 px-4 overflow-hidden">
            <Ionicons name={icon} size={20} color="#9CA3AF" />
            <TextInput
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              secureTextEntry={secureTextEntry}
              className="flex-1 ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide"
              placeholderTextColor="#9CA3AF"
              {...rest}
            />
            {showToggle && (
              <TouchableOpacity onPress={toggleSecure}>
                <Ionicons
                  name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}

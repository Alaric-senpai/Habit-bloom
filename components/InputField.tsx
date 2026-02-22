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

  if(error){
    console.log(`[error][${name}], ${error}`)
  }

  return (
    <View className="mb-4">
      <Text className="text-foreground text-sm my-3 font-bold">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View className="flex-row items-center rounded-2xl bg-card border-2 border-border p-3 px-4">
            <Ionicons name={icon} size={22} color="hsl(165, 75%, 45%)" />
            <TextInput
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              secureTextEntry={secureTextEntry}
              className="flex-1 ml-3 text-base text-foreground font-medium"
              placeholderTextColor="hsl(150, 8%, 65%)"
              {...rest}
            />
            {showToggle && (
              <TouchableOpacity onPress={toggleSecure}>
                <Ionicons
                  name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="hsl(165, 75%, 45%)"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      {error && <Text className="text-destructive text-sm mt-2 font-medium">{error}</Text>}
    </View>
  );
}

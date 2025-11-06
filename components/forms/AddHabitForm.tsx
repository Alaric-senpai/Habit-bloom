// components/forms/AddHabitForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHabitSchema, type CreateHabitSchemaType } from '@/types';
import InputField from '../InputField';

// Create a type for form input that accepts null values (before Zod transforms)
type CreateHabitFormInput = {
  userId: number;
  title: string;
  description: string | null;
  category: string | null;
  frequency: "daily" | "weekly" | "custom" | "monthly" | "once" | "hourly" | null;
  customFrequency: string | null;
  startTime: string | null;
  endTime: string | null;
  startDate: Date;
  endDate?: Date | null;
  goalPerDay: number | null;
  colorTag: string | null;
  icon: string;
  visibility: "private" | "friends" | "public" | null;
  difficulty: "easy" | "medium" | "hard" | null;
  rewardTag: string | null;
  locationTag: string | null;
  inCalendar: boolean | null;
};
import Select from '../ui/select';
import DatePicker from '../ui/DatePicker';
import TimePicker from '../ui/TimePicker';
import IconPicker from '../ui/IconPicker';
import ChipSelector from '../ui/ChipSelector';
import { cn } from '@/lib/utils';
import type { HabitActions } from '@/database/actions';

const CATEGORIES = [
  'Health',
  'Fitness',
  'Mindfulness',
  'Learning',
  'Productivity',
  'Social',
  'Career',
  'Finance',
  'Hobbies',
  'General',
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom Days' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'once', label: 'One Time' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface AddHabitFormProps {
  userId: number;
  habitActions: HabitActions;
  onSuccess?: (habit: any) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  showCancelButton?: boolean;
}

export default function AddHabitForm({
  userId,
  habitActions,
  onSuccess,
  onCancel,
  submitButtonText = 'Create Habit',
  showCancelButton = true,
}: AddHabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<CreateHabitFormInput>({
    resolver: zodResolver(createHabitSchema) as any,
    defaultValues: {
      userId: userId,
      title: '',
      description: null,
      category: null,
      frequency: null,
      customFrequency: null,
      startTime: null,
      endTime: null,
      startDate: new Date(),
      endDate: undefined,
      goalPerDay: 1,
      colorTag: null,
      icon: '✨',
      visibility: null,
      difficulty: null,
      rewardTag: null,
      locationTag: null,
      inCalendar: null,
    },
  });

  const frequency = watch('frequency');

  const onSubmit = async (data: CreateHabitFormInput) => {
    setIsSubmitting(true);
    try {
      // Transform the form data using the Zod schema
      const transformedData = createHabitSchema.parse(data);

      await habitActions.createHabit(transformedData);

      reset();
      await onSuccess?.(transformedData);
    } catch (error) {
      console.error('Error submitting habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-950 mb-22"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 py-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Habit
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400">
              Build better habits, one step at a time ✨
            </Text>
          </View>

          {/* Basic Information Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Basic Info
            </Text>
            
            {/* Icon Picker */}
            <View className="mb-4">
              <Controller
                control={control}
                name="icon"
                render={({ field: { onChange, value } }) => (
                  <IconPicker 
                    label="Icon" 
                    value={value} 
                    onChange={onChange}
                  />
                )}
              />
            </View>

            {/* Title */}
            <View className="mb-4">
              <InputField
                control={control}
                name="title"
                label="Habit Name"
                placeholder="e.g., Morning Meditation"
                icon="sparkles"
                error={errors.title?.message}
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <InputField
                control={control}
                name="description"
                label="Description"
                placeholder="Add some details about this habit..."
                icon="document-text"
                error={errors.description?.message}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Category */}
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <ChipSelector
                  label="Category"
                  options={CATEGORIES}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </View>

          {/* Schedule Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Schedule
            </Text>

            {/* Frequency */}
            <View className="mb-4">
              <Controller
                control={control}
                name="frequency"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Frequency"
                    value={value}
                    onValueChange={onChange}
                    options={FREQUENCIES}
                    placeholder="Select frequency"
                    error={errors.frequency?.message}
                    required
                  />
                )}
              />
            </View>

            {/* Custom Days */}
            {(frequency === 'custom' || frequency === 'weekly') && (
              <View className="mb-4">
                <Controller
                  control={control}
                  name="customFrequency"
                  render={({ field: { onChange, value } }) => (
                    <ChipSelector
                      label="Select Days"
                      options={WEEKDAYS}
                      value={value?.split(', ') || []}
                      onChange={(days: string[]) => onChange(days.join(', '))}
                      multiSelect
                    />
                  )}
                />
              </View>
            )}

            {/* Time Range */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field: { onChange, value } }) => (
                    <TimePicker
                      label="Start Time"
                      value={value}
                      onChange={onChange}
                      error={errors.startTime?.message}
                      placeholder="Select start time"
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field: { onChange, value } }) => (
                    <TimePicker
                      label="End Time"
                      value={value}
                      onChange={onChange}
                      error={errors.endTime?.message}
                      placeholder="Select end time"
                    />
                  )}
                />
              </View>
            </View>

            {/* Start Date */}
            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Start Date"
                  value={value}
                  onChange={onChange}
                  error={errors.startDate?.message}
                  required
                />
              )}
            />
          </View>

          {/* Goals & Progress Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Goals & Progress
            </Text>

            {/* Difficulty */}
            <View className="mb-4">
              <Controller
                control={control}
                name="difficulty"
                render={({ field: { onChange, value } }) => (
                  <ChipSelector
                    label="Difficulty Level"
                    options={DIFFICULTIES}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </View>

            {/* Daily Goal */}
            <View className="mb-4">
              <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
                Daily Goal
              </Text>
              <Controller
                control={control}
                name="goalPerDay"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row items-center rounded-2xl bg-gray-200 dark:bg-slate-900 p-2 px-4 overflow-hidden">
                    <Ionicons name="medal-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      placeholder="1"
                      value={value?.toString() ?? ''}
                      onChangeText={(text: string) => {
                        // Convert string to number, or null if empty
                        if (text === '') {
                          onChange(null);
                        } else {
                          // Only allow numeric characters
                          const numericText = text.replace(/[^0-9]/g, '');
                          if (numericText !== '') {
                            const numValue = parseInt(numericText, 10);
                            if (!isNaN(numValue) && numValue > 0) {
                              onChange(numValue);
                            }
                          }
                        }
                      }}
                      keyboardType="numeric"
                      className="flex-1 ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                )}
              />
              {errors.goalPerDay?.message && (
                <Text className="text-red-500 text-sm mt-1">{errors.goalPerDay.message}</Text>
              )}
            </View>
          </View>

          {/* Additional Details Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Additional Details
            </Text>

            {/* Location */}
            <View className="mb-4">
              <InputField
                control={control}
                name="locationTag"
                label="Location (Optional)"
                placeholder="e.g., Gym, Home, Office"
                icon="location"
                error={errors.locationTag?.message}
              />
            </View>

            {/* Reward */}
            <InputField
              control={control}
              name="rewardTag"
              label="Reward (Optional)"
              placeholder="e.g., Treat yourself to coffee"
              icon="gift"
              error={errors.rewardTag?.message}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-2 mb-4">
            {showCancelButton && (
              <TouchableOpacity
                onPress={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-300 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 dark:text-gray-300 font-semibold text-center text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={cn(
                'flex-1 px-6 py-4 rounded-xl',
                isSubmitting ? 'bg-blue-400' : 'bg-blue-500',
                !showCancelButton && 'w-full'
              )}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold text-center text-base ml-2">
                    Creating...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-center text-base">
                  {submitButtonText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //   className="flex-1"
    //   keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    // >
    // </KeyboardAvoidingView>
  );
}
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  createHabitSchema, 
  type CreateHabitSchemaType 
} from '@/types';
import { 
  Calendar, 
  Clock, 
  Target, 
  MapPin, 
  Award, 
  Sparkles,
  ChevronDown,
  Check,
  X,
} from 'lucide-react-native';

// Emoji picker data
const HABIT_EMOJIS = [
  '✨', '💪', '🎯', '📚', '🏃', '🧘', '💧', '🥗', '😴', '🎨',
  '🎵', '💻', '📝', '🌱', '🔥', '⚡', '🌟', '🎓', '🏋️', '🚴',
  '🏊', '🧠', '❤️', '🌈', '☀️', '🌙', '⭐', '💎', '🎪', '🎭',
];

const CATEGORIES = [
  'Health', 'Fitness', 'Mindfulness', 'Learning', 'Productivity',
  'Social', 'Career', 'Finance', 'Hobbies', 'General',
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom Days' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'once', label: 'One Time' },
] as const;

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { value: 'hard', label: 'Hard', color: 'text-red-600', bg: 'bg-red-100' },
] as const;

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface AddHabitFormProps {
  userId: number;
  onSuccess?: (habit: any) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  showCancelButton?: boolean;
}

/**
 * Reusable Add/Edit Habit Form Component
 * 
 * Features:
 * - React Hook Form with Zod validation
 * - Icon picker
 * - Category selection
 * - Frequency options with custom days
 * - Time picker
 * - Difficulty levels
 * - Full validation
 * - Loading states
 * - Error handling
 * 
 * @example
 * ```tsx
 * <AddHabitForm
 *   userId={currentUserId}
 *   onSuccess={(habit) => {
 *     console.log('Habit created:', habit);
 *     bottomSheetRef.current?.dismiss();
 *   }}
 *   onCancel={() => bottomSheetRef.current?.dismiss()}
 * />
 * ```
 */
export default function AddHabitForm({
  userId,
  onSuccess,
  onCancel,
  submitButtonText = 'Create Habit',
  showCancelButton = true,
}: AddHabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createHabitSchema),
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
      goalPerDay: null,
      colorTag: null,
      icon: null,
      visibility: null,
      difficulty: null,
      rewardTag: null,
      locationTag: null,
      inCalendar: null,
    },
  });

  const frequency = watch('frequency');
  const selectedIcon = watch('icon');

  const toggleDay = useCallback((day: string) => {
    setSelectedDays(prev => {
      const newDays = prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day];
      setValue('customFrequency', newDays.join(', '));
      return newDays;
    });
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // The schema transforms will convert nulls to appropriate defaults
      const transformedData = createHabitSchema.parse(data);
      // Call onSuccess with the transformed form data
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
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="space-y-6 pb-8">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Habit
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Build better habits, one step at a time
          </Text>
        </View>




        {/* Icon Picker */}
        <View>
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Icon
          </Text>
          <TouchableOpacity
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex-row items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700"
          >
            <View className="flex-row items-center">
              <Text className="text-4xl mr-3">{selectedIcon || '✨'}</Text>
              <Text className="text-gray-900 dark:text-white font-medium">
                Choose an icon
              </Text>
            </View>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {showEmojiPicker && (
            <View className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <View className="flex-row flex-wrap gap-2">
                {HABIT_EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      setValue('icon', emoji);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-12 h-12 items-center justify-center rounded-lg ${
                      selectedIcon === emoji 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-white dark:bg-gray-700'
                    }`}
                  >
                    <Text className="text-2xl">{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habit Name *
              </Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="e.g., Morning Meditation"
                placeholderTextColor="#9ca3af"
                className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700"
              />
              {errors.title && (
                <Text className="text-red-600 text-sm mt-1">{errors.title.message}</Text>
              )}
            </View>
          )}
        />

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </Text>
              <TextInput
                value={value || ''}
                onChangeText={onChange}
                placeholder="Add some details about this habit..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
          )}
        />

        {/* Category */}
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => onChange(category)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      value === category
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`font-medium ${
                      value === category 
                        ? 'text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />

        {/* Frequency */}
        <Controller
          control={control}
          name="frequency"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequency *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {FREQUENCIES.map((freq) => (
                  <TouchableOpacity
                    key={freq.value}
                    onPress={() => onChange(freq.value)}
                    className={`px-4 py-2.5 rounded-xl border-2 ${
                      value === freq.value
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`font-medium ${
                      value === freq.value 
                        ? 'text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />

        {/* Custom Days (if frequency is custom or weekly) */}
        {(frequency === 'custom' || frequency === 'weekly') && (
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Days
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                    selectedDays.includes(day)
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Text className={`font-bold text-sm ${
                    selectedDays.includes(day) 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Time */}
        <View className="flex-row gap-3">
          <Controller
            control={control}
            name="startTime"
            render={({ field: { onChange, value } }) => (
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </Text>
                <View className="flex-row items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <Clock size={20} color="#9CA3AF" />
                  <TextInput
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="09:00"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 ml-2 text-gray-900 dark:text-white"
                  />
                </View>
                {errors.startTime && (
                  <Text className="text-red-600 text-sm mt-1">{errors.startTime.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="endTime"
            render={({ field: { onChange, value } }) => (
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </Text>
                <View className="flex-row items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <Clock size={20} color="#9CA3AF" />
                  <TextInput
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="10:00"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 ml-2 text-gray-900 dark:text-white"
                  />
                </View>
                {errors.endTime && (
                  <Text className="text-red-600 text-sm mt-1">{errors.endTime.message}</Text>
                )}
              </View>
            )}
          />
        </View>

        {/* Difficulty */}
        <Controller
          control={control}
          name="difficulty"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </Text>
              <View className="flex-row gap-3">
                {DIFFICULTIES.map((diff) => (
                  <TouchableOpacity
                    key={diff.value}
                    onPress={() => onChange(diff.value)}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                      value === diff.value
                        ? `${diff.bg} border-${diff.color.split('-')[1]}-400`
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`font-medium text-center ${
                      value === diff.value 
                        ? diff.color 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />

        {/* Goal Per Day */}
        <Controller
          control={control}
          name="goalPerDay"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daily Goal
              </Text>
              <View className="flex-row items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                <Target size={20} color="#9CA3AF" />
                <TextInput
                  value={value?.toString() || '1'}
                  onChangeText={(text) => onChange(parseInt(text) || 1)}
                  placeholder="1"
                  keyboardType="number-pad"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-2 text-gray-900 dark:text-white"
                />
                <Text className="text-gray-500 ml-2">times</Text>
              </View>
            </View>
          )}
        />

        {/* Location (Optional) */}
        <Controller
          control={control}
          name="locationTag"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location (Optional)
              </Text>
              <View className="flex-row items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                <MapPin size={20} color="#9CA3AF" />
                <TextInput
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="e.g., Gym, Home, Office"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-2 text-gray-900 dark:text-white"
                />
              </View>
            </View>
          )}
        />

        {/* Reward (Optional) */}
        <Controller
          control={control}
          name="rewardTag"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reward (Optional)
              </Text>
              <View className="flex-row items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                <Award size={20} color="#9CA3AF" />
                <TextInput
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="e.g., Treat yourself to coffee"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-2 text-gray-900 dark:text-white"
                />
              </View>
            </View>
          )}
        />

        {/* Submit Buttons */}
        <View className="flex-row gap-3 pt-4">
          {showCancelButton && (
            <TouchableOpacity
              onPress={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600"
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
            className={`flex-1 px-6 py-4 rounded-xl ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-500'
            }`}
            activeOpacity={0.7}
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
  );
}
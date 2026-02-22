import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHabitSchema, type CreateHabitSchemaType } from '@/types';
import type { HabitActions } from '@/database/actions';
import { Button } from '@/components/ui/button';
import { Text as UIText } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../InputField';
import DatePicker from '../ui/DatePicker';
import TimePicker from '../ui/TimePicker';
import IconPicker from '../ui/IconPicker';
import ChipSelector from '../ui/ChipSelector';

// Form input type
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
  'Daily',
  'Weekly',
  'Custom Days',
  'Monthly',
  'One Time',
];

const DIFFICULTIES = [
  'Easy',
  'Medium',
  'Hard',
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
      // Map display values back to schema values
      let mappedData = { ...data };
      
      // Map frequency display to schema value
      const frequencyMap: Record<string, string> = {
        'Daily': 'daily',
        'Weekly': 'weekly',
        'Custom Days': 'custom',
        'Monthly': 'monthly',
        'One Time': 'once',
      };
      
      if (data.frequency) {
        mappedData.frequency = frequencyMap[data.frequency] as any || data.frequency as any;
      }
      
      // Map difficulty display to schema value
      if (data.difficulty) {
        mappedData.difficulty = data.difficulty.toLowerCase() as any;
      }

      const transformedData = createHabitSchema.parse(mappedData);
      await habitActions.createHabit(transformedData);
      reset();
      await onSuccess?.(transformedData);
    } catch (error) {
      console.error('Error submitting habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      className='flex-1 bg-background'
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps='handled'
    >
      <View className='px-6 py-6'>
        {/* Header */}
        <View className='mb-8'>
          <Text className='text-foreground text-3xl font-extrabold mb-2'>
            Create New Habit
          </Text>
          <Text className='text-muted-foreground text-base'>
            Build better habits, one step at a time 🌱
          </Text>
        </View>

        {/* Icon Picker */}
        <View className='mb-6'>
          <Controller
            control={control}
            name='icon'
            render={({ field: { onChange, value } }) => (
              <IconPicker 
                label='Choose Icon' 
                value={value} 
                onChange={onChange}
              />
            )}
          />
        </View>

        {/* Basic Information */}
        <View className='mb-6'>
          <Text className='text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4'>
            Basic Information
          </Text>
          
          <View className='mb-4'>
            <InputField
              control={control}
              name='title'
              label='Habit Name'
              placeholder='e.g., Morning Meditation'
              icon='sparkles'
              error={errors.title?.message}
            />
          </View>

          <View className='mb-4'>
            <InputField
              control={control}
              name='description'
              label='Description (Optional)'
              placeholder='Add some details about this habit...'
              icon='document-text'
              error={errors.description?.message}
              multiline
              numberOfLines={3}
            />
          </View>

          <Controller
            control={control}
            name='category'
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label='Category'
                options={CATEGORIES}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </View>

        {/* Schedule */}
        <View className='mb-6'>
          <Text className='text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4'>
            Schedule
          </Text>

          <Controller
            control={control}
            name='frequency'
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label='Frequency'
                options={FREQUENCIES}
                value={value}
                onChange={onChange}
              />
            )}
          />

          {(frequency === 'custom' || frequency === 'weekly' || frequency === 'Custom Days' || frequency === 'Weekly') && (
            <View className='mb-4'>
              <Controller
                control={control}
                name='customFrequency'
                render={({ field: { onChange, value } }) => (
                  <ChipSelector
                    label='Select Days'
                    options={WEEKDAYS}
                    value={value?.split(', ') || []}
                    onChange={(days: string[]) => onChange(days.join(', '))}
                    multiSelect
                  />
                )}
              />
            </View>
          )}

          <View className='flex-row gap-3 mb-4'>
            <View className='flex-1'>
              <Controller
                control={control}
                name='startTime'
                render={({ field: { onChange, value } }) => (
                  <TimePicker
                    label='Start Time'
                    value={value}
                    onChange={onChange}
                    error={errors.startTime?.message}
                    placeholder='When?'
                  />
                )}
              />
            </View>
            <View className='flex-1'>
              <Controller
                control={control}
                name='endTime'
                render={({ field: { onChange, value } }) => (
                  <TimePicker
                    label='End Time'
                    value={value}
                    onChange={onChange}
                    error={errors.endTime?.message}
                    placeholder='Until?'
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name='startDate'
            render={({ field: { onChange, value } }) => (
              <DatePicker
                label='Start Date'
                value={value}
                onChange={onChange}
                error={errors.startDate?.message}
                required
              />
            )}
          />
        </View>

        {/* Goals */}
        <View className='mb-6'>
          <Text className='text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4'>
            Goals & Progress
          </Text>

          <View className='mb-4'>
            <Controller
              control={control}
              name='difficulty'
              render={({ field: { onChange, value } }) => (
                <ChipSelector
                  label='Difficulty Level'
                  options={DIFFICULTIES}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </View>

          <View className='mb-4'>
            <Text className='text-foreground text-sm font-semibold mb-2'>
              Daily Goal
            </Text>
            <Controller
              control={control}
              name='goalPerDay'
              render={({ field: { onChange, value } }) => (
                <View className='flex-row items-center rounded-2xl bg-card border-2 border-border p-3 px-4'>
                  <Ionicons name='medal-outline' size={22} color='hsl(165, 75%, 45%)' />
                  <TextInput
                    placeholder='1'
                    value={value?.toString() ?? ''}
                    onChangeText={(text) => {
                      if (text === '') {
                        onChange(null);
                      } else {
                        const numericText = text.replace(/[^0-9]/g, '');
                        if (numericText !== '') {
                          const numValue = parseInt(numericText, 10);
                          if (!isNaN(numValue) && numValue > 0) {
                            onChange(numValue);
                          }
                        }
                      }
                    }}
                    keyboardType='numeric'
                    className='flex-1 ml-3 text-base text-foreground font-medium'
                    placeholderTextColor='hsl(150, 8%, 65%)'
                  />
                </View>
              )}
            />
            {errors.goalPerDay?.message && (
              <Text className='text-destructive text-sm mt-2 font-medium'>
                {errors.goalPerDay.message}
              </Text>
            )}
          </View>
        </View>

        {/* Additional Details */}
        <View className='mb-6'>
          <Text className='text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4'>
            Additional Details (Optional)
          </Text>

          <View className='mb-4'>
            <InputField
              control={control}
              name='locationTag'
              label='Location'
              placeholder='e.g., Gym, Home, Office'
              icon='location'
              error={errors.locationTag?.message}
            />
          </View>

          <InputField
            control={control}
            name='rewardTag'
            label='Reward'
            placeholder='e.g., Treat yourself to coffee'
            icon='gift'
            error={errors.rewardTag?.message}
          />
        </View>

        {/* Action Buttons */}
        <View className='flex-row gap-3 mt-2 mb-4'>
          {showCancelButton && (
            <Button
              variant='outline'
              size='lg'
              onPress={onCancel}
              disabled={isSubmitting}
              className='flex-1'
            >
              <UIText>Cancel</UIText>
            </Button>
          )}

          <Button
            variant='default'
            size='lg'
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={cn('flex-1', !showCancelButton && 'w-full')}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator color='white' size='small' />
                <UIText className='text-primary-foreground ml-2'>Creating...</UIText>
              </>
            ) : (
              <UIText className='text-primary-foreground font-bold'>{submitButtonText}</UIText>
            )}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

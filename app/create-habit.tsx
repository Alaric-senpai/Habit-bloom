import React, { useState } from 'react';
import { View, ScrollView, Pressable, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { 
  Dumbbell, Droplets, Utensils, Book, 
  Coffee, Moon, TrendingUp, Brain, 
  Minus, Plus, Bell, Sparkles 
} from 'lucide-react-native';

import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import ArrowBackComponent from '@/components/ArrowBackComponent';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';
import { createHabit } from '@/hooks/helpers';
import { useRouter } from 'expo-router';
import { useHabitBloom } from '@/contexts/HabitBloomGlobalContext';

// Schema aligned with your InstantDB entity
const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  icon: z.string().default('dumbbell'),
  color: z.string().default('#2AF5FF'),
  frequency: z.enum(['Daily', 'Weekly', 'Custom']).default('Daily'),
  daysOfWeek: z.array(z.number()).default([0, 1, 2, 3, 4, 5, 6]),
  hasNumericTarget: z.boolean().default(true),
  targetValue: z.number().min(1).default(1),
  reminderTime: z.string().default('08:00 AM'),
  reminderEnabled: z.boolean().default(true),
});

type HabitFormValues = z.infer<typeof habitSchema>;

const DEFAULT_ICONS = [
  { id: 'dumbbell', component: Dumbbell },
  { id: 'water', component: Droplets },
  { id: 'meditation', component: Utensils },
  { id: 'read', component: Book },
  { id: 'coffee', component: Coffee },
  { id: 'sleep', component: Moon },
  { id: 'chart', component: TrendingUp },
  { id: 'brain', component: Brain },
];

const COLORS = ['#2AF5FF', '#FF6B6B', '#FFB84D', '#7B89FF', '#2ECC71', '#BB86FC', '#F48FB1'];

const DAYS = [
  { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
  { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
  { label: 'S', value: 6 }
];

const CreateHabit = () => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const {user} = useHabitBloom()

  const router = useRouter()

  const { control, handleSubmit, watch, setValue } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema as any),
    defaultValues: {
      name: '',
      icon: 'dumbbell',
      color: '#2AF5FF',
      frequency: 'Daily',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      hasNumericTarget: true,
      targetValue: 1,
      reminderEnabled: true,
      reminderTime: '08:00 AM'
    }
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const frequency = watch('frequency');
  const daysOfWeek = watch('daysOfWeek') || [];
  const reminderTime = watch('reminderTime');
  const hasNumericTarget = watch('hasNumericTarget');
  const targetValue = watch('targetValue');

  const isCustomEmoji = !DEFAULT_ICONS.find(i => i.id === selectedIcon);

  // Logic: Daily selects all, Weekly selects one, Custom is multi-select
  const handleFrequencyChange = (opt: 'Daily' | 'Weekly' | 'Custom') => {
    setValue('frequency', opt);
    if (opt === 'Daily') {
      setValue('daysOfWeek', [0, 1, 2, 3, 4, 5, 6]);
    } else if (opt === 'Weekly') {
      setValue('daysOfWeek', [new Date().getDay()]);
    }
  };

  const handleDayToggle = (dayValue: number) => {
    if (frequency === 'Weekly') {
      setValue('daysOfWeek', [dayValue]);
    } else if (frequency === 'Custom') {
      const currentDays = [...daysOfWeek];
      const index = currentDays.indexOf(dayValue);
      if (index > -1) {
        currentDays.splice(index, 1);
      } else {
        currentDays.push(dayValue);
      }
      setValue('daysOfWeek', currentDays.sort((a, b) => a - b));
    }
  };

  const handleConfirmTime = (date: Date) => {
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setValue('reminderTime', timeString);
    setTimePickerVisible(false);
  };

  const handlePickEmoji = (emojiObject: EmojiType) => {
    setValue('icon', emojiObject.emoji);
    setIsEmojiPickerOpen(false);
  };

  const onSubmit = (data: HabitFormValues) => {
        try {
            
             createHabit( user?.id!, data)

             router.back()

        } catch (error) {
            console.error(error)
        }
  };

  return (
    <Container>
      {/* Header */}
      <View className='flex-row items-center justify-between mb-6'>
        <ArrowBackComponent />
        <Text variant={'h4'} className="text-white">Create Habit</Text>
        <Button variant={'ghost'} onPress={handleSubmit(onSubmit)}>
          <Text style={{ color: selectedColor }} className='font-semibold text-lg'>Save</Text>
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} className='w-11/12 mx-auto'>
        
        {/* Habit Name */}
        <View className="mb-8">
          <Text className="text-primary font-bold text-xs tracking-widest mb-3 uppercase">Habit Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="e.g. Morning Yoga"
                value={value}
                onChangeText={onChange}
                className="bg-[#122222] border-0 h-16 rounded-2xl px-6 text-white text-lg"
                placeholderTextColor="#3D5A5A"
              />
            )}
          />
        </View>

        {/* Icon Picker */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-primary font-bold text-xs tracking-widest uppercase">Select Icon</Text>
            <Pressable onPress={() => setIsEmojiPickerOpen(true)}>
              <Text className="text-primary text-xs">View All</Text>
            </Pressable>
          </View>
          
          <View className="flex-row flex-wrap gap-4">
            {isCustomEmoji && (
               <View 
                style={{ backgroundColor: selectedColor }}
                className="w-12 h-12 rounded-full items-center justify-center"
               >
                <Text style={{ fontSize: 24 }}>{selectedIcon}</Text>
               </View>
            )}

            {DEFAULT_ICONS.map((item) => {
              const IconComp = item.component;
              const isActive = selectedIcon === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setValue('icon', item.id)}
                  style={{ backgroundColor: isActive ? selectedColor : '#122222' }}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <IconComp color={isActive ? '#000' : '#4A6161'} size={24} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Theme Color */}
        <View className="mb-8">
          <Text className="text-primary font-bold text-xs tracking-widest mb-4 uppercase">Theme Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4">
              {COLORS.map((color) => (
                <Button
                  key={color}
                  onPress={() => setValue('color', color)}
                  style={{ backgroundColor: color }}
                  className={cn(
                    "w-12 h-12 rounded-full items-center justify-center",
                    selectedColor === color ? "border-4 border-[#0B1717] scale-110" : ""
                  )}
                >
                    {selectedColor === color && (
                      <View className="w-6 h-6 rounded-full border-2 border-white" />
                    )}
                </Button>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Frequency & Days Selector */}
        <View className="mb-8">
          <Text className="text-primary font-bold text-xs tracking-widest mb-4 uppercase">Frequency</Text>
          <View className="flex-row bg-[#122222] rounded-2xl p-1 mb-4">
            {['Daily', 'Weekly', 'Custom'].map((opt) => (
              <Pressable
                key={opt}
                onPress={() => handleFrequencyChange(opt as any)}
                className={cn(
                  "flex-1 py-4 rounded-xl items-center",
                  frequency === opt ? "bg-primary" : ""
                )}
              >
                <Text className={cn("font-semibold", frequency === opt ? "text-black" : "text-gray-500")}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>

          {frequency !== 'Daily' && (
            <View className="flex-row justify-between items-center bg-[#122222] p-4 rounded-2xl">
              {DAYS.map((day) => {
                const isSelected = daysOfWeek.includes(day.value);
                return (
                  <Pressable
                    key={day.value}
                    onPress={() => handleDayToggle(day.value)}
                    style={{ backgroundColor: isSelected ? selectedColor : '#0B1717' }}
                    className="w-10 h-10 rounded-full items-center justify-center"
                  >
                    <Text className={cn("font-bold", isSelected ? "text-black" : "text-gray-500")}>
                      {day.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Numeric Target */}
        <View className="bg-[#122222] rounded-3xl p-6 mb-8">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-lg">Numeric Target</Text>
              <Text className="text-gray-500 text-sm">Track progress by quantity</Text>
            </View>
            <Switch
              value={hasNumericTarget}
              onValueChange={(val) => setValue('hasNumericTarget', val)}
              thumbColor={hasNumericTarget ? selectedColor : '#4A6161'}
              trackColor={{ false: '#1A2C2C', true: '#1A2C2C' }}
            />
          </View>

          {hasNumericTarget && (
            <View className="flex-row items-center justify-between mt-6 bg-[#0B1717] p-4 rounded-2xl">
              <Text className="text-gray-400">Daily Target</Text>
              <View className="flex-row items-center gap-6">
                <Pressable 
                  onPress={() => setValue('targetValue', Math.max(1, targetValue - 1))}
                  style={{ borderColor: selectedColor }}
                  className="w-10 h-10 rounded-full border items-center justify-center"
                >
                  <Minus color={selectedColor} size={20} />
                </Pressable>
                <Text className="text-white text-2xl font-bold">{targetValue}</Text>
                <Pressable 
                  onPress={() => setValue('targetValue', targetValue + 1)}
                  style={{ backgroundColor: selectedColor }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <Plus color="black" size={20} />
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Reminder Section */}
        <Pressable 
          onPress={() => setTimePickerVisible(true)}
          className="bg-[#122222] rounded-3xl p-6 flex-row items-center justify-between mb-8"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-[#0B1717] rounded-xl items-center justify-center">
              <Bell color={selectedColor} size={24} />
            </View>
            <Text className="text-white font-semibold text-lg">Reminder Time</Text>
          </View>
          <Text style={{ color: selectedColor }} className="font-bold text-lg">{reminderTime}</Text>
        </Pressable>

        <Button 
          onPress={handleSubmit(onSubmit)}
          style={{ backgroundColor: selectedColor }}
          className="h-16 rounded-full flex-row items-center justify-center"
        >
          <Sparkles color="black" size={20} className="mr-2" />
          <Text className="text-black font-bold text-lg">Create Habit</Text>
        </Button>

      </ScrollView>

      <EmojiPicker
        onEmojiSelected={handlePickEmoji}
        expandable={true}
        defaultHeight={600}
        open={isEmojiPickerOpen}
        enableRecentlyUsed={true}
        enableSearchBar={true}
        onClose={() => setIsEmojiPickerOpen(false)}
        theme={{
            backdrop: '#000000aa',
            knob: selectedColor,
            container: '#122222',
            header: '#ffffff',
            category: {
              icon: selectedColor,
              iconActive: '#000000',
              container: '#122222',
              containerActive: selectedColor,
            },
            search: {
                text: 'white',
                placeholder: 'Search an emoji'
            }
            
        }}

        styles={{
            emoji: {
                selected: {
                    backgroundColor: selectedColor || THEME.dark.primary
                }
            }
        }}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerVisible(false)}
        isDarkModeEnabled={true}
        timePickerModeAndroid={'spinner'}
        accentColor={selectedColor}
      />
    </Container>
  );
};

export default CreateHabit;
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useActions, useAuth } from '@/contexts/HabitBloomGlobalContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import type { CreateMoodSchemaType } from '@/types';

// Valid mood labels from schema
type MoodLabel = "Happy" | "Relaxed" | "Motivated" | "Focused" | "Grateful" | "Calm" | 
  "Excited" | "Confident" | "Proud" | "Content" | "Inspired" | "Optimistic" | "Loved" |
  "Neutral" | "Reflective" | "Bored" | "Indifferent" |
  "Tired" | "Sad" | "Anxious" | "Angry" | "Stressed" | "Overwhelmed" | 
  "Lonely" | "Frustrated" | "Disappointed" | "Guilty" | "Worried";

interface Feeling {
  name: MoodLabel;
  emoji: string;
  category: 'positive' | 'neutral' | 'negative';
}

interface MoodData {
  moodLevel: number;
  moodLabel: MoodLabel;
  selectedFeelings: MoodLabel[];
  energyLevel: number;
  stressLevel: number;
  note: string;
  emoji: string;
}

const FEELINGS: Feeling[] = [
  // Positive (13)
  { name: "Happy", emoji: "😊", category: 'positive' },
  { name: "Relaxed", emoji: "😌", category: 'positive' },
  { name: "Motivated", emoji: "💪", category: 'positive' },
  { name: "Focused", emoji: "🎯", category: 'positive' },
  { name: "Grateful", emoji: "🙏", category: 'positive' },
  { name: "Calm", emoji: "☮️", category: 'positive' },
  { name: "Excited", emoji: "🤩", category: 'positive' },
  { name: "Confident", emoji: "😎", category: 'positive' },
  { name: "Proud", emoji: "🦾", category: 'positive' },
  { name: "Content", emoji: "😊", category: 'positive' },
  { name: "Inspired", emoji: "✨", category: 'positive' },
  { name: "Optimistic", emoji: "🌟", category: 'positive' },
  { name: "Loved", emoji: "💕", category: 'positive' },
  // Neutral (4)
  { name: "Neutral", emoji: "😐", category: 'neutral' },
  { name: "Reflective", emoji: "🤔", category: 'neutral' },
  { name: "Bored", emoji: "😴", category: 'neutral' },
  { name: "Indifferent", emoji: "😑", category: 'neutral' },
  // Negative (11)
  { name: "Tired", emoji: "😴", category: 'negative' },
  { name: "Sad", emoji: "😢", category: 'negative' },
  { name: "Anxious", emoji: "😰", category: 'negative' },
  { name: "Angry", emoji: "😡", category: 'negative' },
  { name: "Stressed", emoji: "😤", category: 'negative' },
  { name: "Overwhelmed", emoji: "🤯", category: 'negative' },
  { name: "Lonely", emoji: "😔", category: 'negative' },
  { name: "Frustrated", emoji: "😠", category: 'negative' },
  { name: "Disappointed", emoji: "😞", category: 'negative' },
  { name: "Guilty", emoji: "😳", category: 'negative' },
  { name: "Worried", emoji: "😟", category: 'negative' },
];

const MOOD_EMOJIS = ["😢", "😟", "😕", "😐", "🙂", "😊", "😄", "😆", "😍", "🤩"];
const ENERGY_EMOJIS = ["😴", "😪", "😑", "😐", "🙂", "😊", "😄", "⚡", "🚀", "💥"];
const STRESS_EMOJIS = ["😌", "😊", "🙂", "😐", "😕", "😟", "😰", "😤", "🤯", "💀"];

const STEP_NAMES = ["Mood", "Feelings", "Energy", "Stress", "Note"];

export default function TodaysMoodLogger() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { auth } = useAuth();
  const userId = auth?.user?.id;
  const actions = useActions();
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodData, setMoodData] = useState<MoodData>({
    moodLevel: 5,
    moodLabel: "Neutral",
    selectedFeelings: [],
    energyLevel: 5,
    stressLevel: 5,
    note: "",
    emoji: MOOD_EMOJIS[4],
  });

  // Check if mood already logged today
  const checkMoodStatus = useCallback(async () => {
    if (!userId) {
      setIsChecking(false);
      return;
    }

    try {
      setIsChecking(true);
      const isMoodLogged = await actions.mood.isMoodLoggedToday(userId);
      console.log('mood logged from db', isMoodLogged)
      setShouldShowModal(!isMoodLogged);
      
      if (!isMoodLogged) {
        // Small delay for better UX
        setTimeout(() => {
          bottomSheetModalRef.current?.present();
        }, 500);
      }
    } catch (error) {
      console.error('Error checking mood status:', error);
    } finally {
      setIsChecking(false);
    }
  }, [userId, actions.mood]);

  useEffect(() => {
    checkMoodStatus();
  }, [checkMoodStatus]);

  const handleDismiss = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const toggleFeeling = useCallback((feeling: MoodLabel) => {
    setMoodData(prev => {
      const isSelected = prev.selectedFeelings.includes(feeling);
      const newFeelings = isSelected
        ? prev.selectedFeelings.filter(f => f !== feeling)
        : [...prev.selectedFeelings, feeling];
      
      // Update moodLabel to first selected or keep current
      const newMoodLabel = newFeelings.length > 0 ? newFeelings[0] : prev.moodLabel;
      
      return {
        ...prev,
        selectedFeelings: newFeelings,
        moodLabel: newMoodLabel,
      };
    });
  }, []);

  const submitMoodData = useCallback(async () => {
    if (!userId || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const moodDataToSubmit: CreateMoodSchemaType = {
        userId,
        moodLevel: moodData.moodLevel,
        moodLabel: moodData.moodLabel,
        note: moodData.note.trim(),
        emoji: moodData.emoji,
        energyLevel: moodData.energyLevel,
        stressLevel: moodData.stressLevel,
        loggedAt: new Date(),
      };
      
      const logged =  await actions.mood.logMood(moodDataToSubmit);

      __DEV__&& console.log(logged)
      
      bottomSheetModalRef.current?.dismiss();
      setShouldShowModal(false);
      
      // Reset state
      setCurrentStep(0);
      setMoodData({
        moodLevel: 5,
        moodLabel: "Neutral",
        selectedFeelings: [],
        energyLevel: 5,
        stressLevel: 5,
        note: "",
        emoji: MOOD_EMOJIS[4],
      });
    } catch (error) {
      console.error('Error submitting mood:', error);
      alert('Failed to save mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, moodData, isSubmitting, actions.mood]);

  const renderRatingStep = useCallback((
    title: string,
    value: number,
    onChange: (value: number) => void,
    emojis: string[]
  ) => (
    <View className='w-full px-4'>
      <Text className={`text-xl font-semibold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </Text>
      <View className='items-center mb-6'>
        <Text className='text-7xl mb-4'>{emojis[value - 1]}</Text>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>
          {value}/10
        </Text>
      </View>
      <View className='flex-row flex-wrap justify-center gap-2'>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <TouchableOpacity
            key={rating}
            onPress={() => onChange(rating)}
            className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
              value === rating 
                ? 'bg-blue-500 border-blue-500' 
                : isDark
                ? 'bg-gray-800 border-gray-600'
                : 'bg-white border-gray-300'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`font-bold ${
              value === rating 
                ? 'text-white' 
                : isDark 
                ? 'text-gray-300' 
                : 'text-gray-600'
            }`}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [isDark]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderRatingStep(
          "How is your mood today? 😊",
          moodData.moodLevel,
          (value) => setMoodData(prev => ({ 
            ...prev, 
            moodLevel: value,
            emoji: MOOD_EMOJIS[value - 1],
          })),
          MOOD_EMOJIS
        );
      
      case 1:
        return (
          <View className='w-full px-4'>
            <Text className={`text-xl font-semibold mb-2 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
              How are you feeling? 💭
            </Text>
            <Text className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Select all that apply ({moodData.selectedFeelings.length} selected)
            </Text>
            <BottomSheetScrollView 
              className='max-h-96'
              showsVerticalScrollIndicator={false}
            >
              <View className='flex-row flex-wrap gap-2 justify-center pb-4'>
                {FEELINGS.map((feeling) => {
                  const isSelected = moodData.selectedFeelings.includes(feeling.name);
                  return (
                    <TouchableOpacity
                      key={feeling.name}
                      onPress={() => toggleFeeling(feeling.name)}
                      className={`px-4 py-2.5 rounded-full border-2 flex-row items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : isDark
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-gray-300'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text className='text-lg'>{feeling.emoji}</Text>
                      <Text className={`font-medium ${
                        isSelected
                          ? 'text-white'
                          : isDark
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }`}>
                        {feeling.name}
                      </Text>
                      {isSelected && (
                        <Check size={16} color='white' />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BottomSheetScrollView>
          </View>
        );
      
      case 2:
        return renderRatingStep(
          "What's your energy level? ⚡",
          moodData.energyLevel,
          (value) => setMoodData(prev => ({ ...prev, energyLevel: value })),
          ENERGY_EMOJIS
        );
      
      case 3:
        return renderRatingStep(
          "How stressed are you? 😤",
          moodData.stressLevel,
          (value) => setMoodData(prev => ({ ...prev, stressLevel: value })),
          STRESS_EMOJIS
        );
      
      case 4:
        return (
          <View className='w-full px-4'>
            <Text className={`text-xl font-semibold mb-2 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Add a note about your day 📝
            </Text>
            <Text className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Optional - What happened today?
            </Text>
            <TextInput
              value={moodData.note}
              onChangeText={(text) => setMoodData(prev => ({ ...prev, note: text }))}
              placeholder="Tell us about your day..."
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              multiline
              numberOfLines={6}
              maxLength={1000}
              className={`rounded-xl p-4 min-h-32 text-base ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } border-2`}
              style={{ textAlignVertical: 'top' }}
            />
            <Text className={`text-right mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {moodData.note.length}/1000
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (!userId || isChecking || !shouldShowModal) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onDismiss={handleDismiss}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      backgroundStyle={{ 
        backgroundColor: isDark ? '#1f2937' : '#ffffff' 
      }}
      handleIndicatorStyle={{ 
        backgroundColor: isDark ? '#4b5563' : '#d1d5db' 
      }}
    >
      <BottomSheetView className='px-6 pt-4 pb-8'>
        {/* Header */}
        <View className='mb-6'>
          <Text className={`text-2xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Daily Mood Check-in 
          </Text>
          
          {/* Progress Dots */}
          <View className='flex-row justify-center items-center gap-2 mb-3'>
            {STEP_NAMES.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-blue-500' 
                    : index < currentStep
                    ? 'w-2 bg-blue-500'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </View>
          
          <Text className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Step {currentStep + 1} of {STEP_NAMES.length}: {STEP_NAMES[currentStep]}
          </Text>
        </View>

        {/* Content */}
        <View className='mb-6'>
          {renderStep()}
        </View>

        {/* Navigation */}
        <View className='flex-row justify-between items-center gap-3'>
          <TouchableOpacity
            onPress={prevStep}
            disabled={currentStep === 0}
            className={`flex-row items-center gap-2 px-6 py-3 rounded-xl ${
              currentStep === 0 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : isDark
                ? 'bg-gray-800 border border-gray-600'
                : 'bg-gray-100 border border-gray-300'
            }`}
            activeOpacity={0.7}
          >
            <ChevronLeft 
              size={20} 
              color={currentStep === 0 ? '#9ca3af' : isDark ? '#d1d5db' : '#374151'} 
            />
            <Text className={`font-medium ${
              currentStep === 0 
                ? 'text-gray-400' 
                : isDark 
                ? 'text-gray-200' 
                : 'text-gray-700'
            }`}>
              Back
            </Text>
          </TouchableOpacity>

          {currentStep < 4 ? (
            <TouchableOpacity
              onPress={nextStep}
              className='flex-row items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl flex-1 justify-center'
              activeOpacity={0.7}
            >
              <Text className='text-white font-semibold text-base'>Next</Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={submitMoodData}
              disabled={isSubmitting}
              className={`flex-row items-center justify-center gap-2 px-6 py-3 rounded-xl flex-1 ${
                isSubmitting ? 'bg-gray-400' : 'bg-green-500'
              }`}
              activeOpacity={0.7}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator color='white' size='small' />
                  <Text className='text-white font-bold text-base'>Saving...</Text>
                </>
              ) : (
                <>
                  <Text className='text-white font-bold text-base'>Submit</Text>
                  <Text className='text-xl'>🎉</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
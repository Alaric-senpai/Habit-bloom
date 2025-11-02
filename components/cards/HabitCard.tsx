import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { HabitSchemaType } from '@/types'
import { useActions } from '@/contexts/HabitBloomGlobalContext'
import SwippableView from '@/components/SwippableView'
import { Check, Trash2, Clock, Flame } from 'lucide-react-native'
import { router } from 'expo-router'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'

type HabitCardProps = {
  habit: HabitSchemaType
  userId: number
  onDataChange?: () => void | Promise<void>
  showStats?: boolean
}

export default function HabitCard({ 
  habit, 
  userId, 
  onDataChange,
  showStats = true 
}: HabitCardProps) {
  const actions = useActions()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null)

  // State
  const [completed, setCompleted] = useState<boolean>(false)
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if habit is completed today
  const checkHabitCompletion = useCallback(async (habitId: number): Promise<boolean> => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const log = await actions.habitLog.getLogForDate(habitId, userId, today)
      return log?.status === 'completed'
    } catch (error) {
      console.error('Error checking habit completion:', error)
      return false
    }
  }, [actions.habitLog, userId])

  // Load completion status
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!habit.id) return

      setIsCheckingCompletion(true)
      try {
        const isCompleted = await checkHabitCompletion(habit.id)
        setCompleted(isCompleted)
      } catch (error) {
        console.error('Error loading completion status:', error)
      } finally {
        setIsCheckingCompletion(false)
      }
    }

    loadCompletionStatus()
  }, [habit.id, checkHabitCompletion])

  // Complete habit
  const handleCompleteHabit = useCallback(async (habitId: number) => {
    if (!userId || isProcessing) return

    setIsProcessing(true)
    try {
      // Double-check if already completed
      const isAlreadyCompleted = await checkHabitCompletion(habitId)
      
      if (isAlreadyCompleted) {
        confirmationModalRef.current?.show({
          type: 'warning',
          title: 'Already Completed',
          message: 'This habit is already completed for today!',
          confirmText: 'OK',
          showCancel: false
        })
        setIsProcessing(false)
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Create log
      await actions.habitLog.createLog({
        habitId,
        userId,
        status: 'completed',
        logDate: today,
        note: '',
        value: 1,
        mood: '',
      })

      // Calculate new streak
      const newCurrentStreak = (habit.currentStreak || 0) + 1
      const newLongestStreak = Math.max(habit.longestStreak || 0, newCurrentStreak)

      // Update habit stats
      await actions.habit.updateHabit(habitId, userId, {
        totalCompletions: (habit.totalCompletions || 0) + 1,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedAt: new Date(),
      })

      // Update local state
      setCompleted(true)

      // Notify parent to reload data
      await onDataChange?.()

      // Show success message
      const streakMessage = newCurrentStreak > 1 
        ? `\n\n🔥 ${newCurrentStreak} day streak!`
        : ''

      confirmationModalRef.current?.show({
        type: 'success',
        title: 'Great Job! 🎉',
        message: `You've completed "${habit.title}"!${streakMessage}`,
        confirmText: 'Awesome!',
        showCancel: false
      })
    } catch (error) {
      console.error('Error completing habit:', error)
      confirmationModalRef.current?.show({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete habit. Please try again.',
        confirmText: 'OK',
        showCancel: false
      })
    } finally {
      setIsProcessing(false)
    }
  }, [userId, habit, checkHabitCompletion, actions, onDataChange, isProcessing])

  // Delete habit
  const handleDeleteHabit = useCallback(async (habitId: number) => {
    if (!habit || isProcessing) return

    confirmationModalRef.current?.show({
      type: 'warning',
      title: 'Delete Habit',
      message: `Are you sure you want to delete "${habit.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      danger: true,
      onConfirm: async () => {
        setIsProcessing(true)
        try {
          await actions.habit.deleteHabit(habitId, userId)
          
          // Notify parent to reload data
          await onDataChange?.()

          confirmationModalRef.current?.show({
            type: 'success',
            title: 'Deleted',
            message: 'Habit deleted successfully',
            confirmText: 'OK',
            showCancel: false
          })
        } catch (error) {
          console.error('Error deleting habit:', error)
          confirmationModalRef.current?.show({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete habit. Please try again.',
            confirmText: 'OK',
            showCancel: false
          })
        } finally {
          setIsProcessing(false)
        }
      }
    })
  }, [habit, actions.habit, userId, onDataChange, isProcessing])

  // Navigate to habit detail
  const handlePress = useCallback(() => {
    if (!isProcessing && habit.id) {
      router.push(`/habits/${habit.id}` as any)
    }
  }, [habit.id, isProcessing])

  // Get difficulty badge color
  const getDifficultyColor = () => {
    switch (habit.difficulty) {
      case 'easy':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
      case 'hard':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    }
  }

  // Render loading state
  if (isCheckingCompletion) {
    return (
      <View className='bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700'>
        <View className='flex-row items-center justify-center py-4'>
          <ActivityIndicator size='small' color='#6b7280' />
        </View>
      </View>
    )
  }

  const streak = habit.currentStreak || 0
  const hasStreak = streak > 0

  return (
    <>
      <SwippableView
        key={habit.id}
        swipeRightText={completed ? 'Completed' : 'Complete'}
        swipeLeftText="Delete"
        swipeRightAction={() => {!completed && handleCompleteHabit(habit.id!)}}
        swipeLeftAction={() => handleDeleteHabit(habit.id!)}
        rightBg={completed ? '#9ca3af' : '#22c55e'}
        leftBg="#ef4444"
        rightIcon={<Check size={20} color="white" />}
        leftIcon={<Trash2 size={20} color="white" />}
        styles={{ borderRadius: 16, marginBottom: 12 }}
        isSwipable={!completed || !isProcessing}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePress}
          disabled={isProcessing}
        >
          <View 
            className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border ${
              completed 
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                : 'border-gray-100 dark:border-gray-700'
            }`}
          >
            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center flex-1'>
                {/* Habit Icon */}
                <View className='mr-3'>
                  <Text className='text-3xl'>{habit.icon || '✨'}</Text>
                </View>

                {/* Habit Details */}
                <View className='flex-1'>
                  <Text className={`font-semibold text-base mb-1 ${
                    completed 
                      ? 'text-green-800 dark:text-green-200 line-through' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {habit.title}
                  </Text>

                  {/* Stats Row */}
                  {showStats && (
                    <View className='flex-row items-center flex-wrap gap-2'>
                      {/* Time */}
                      {habit.startTime && (
                        <View className='flex-row items-center'>
                          <Clock size={12} className='text-gray-500 dark:text-gray-400 mr-1' />
                          <Text className='text-xs text-gray-600 dark:text-gray-400'>
                            {habit.startTime}
                          </Text>
                        </View>
                      )}

                      {/* Streak */}
                      {hasStreak && (
                        <View className='flex-row items-center'>
                          <Flame size={12} className='text-orange-500 mr-1' />
                          <Text className='text-xs text-orange-600 dark:text-orange-400 font-medium'>
                            {streak} day{streak !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}

                      {/* Difficulty Badge */}
                      {habit.difficulty && (
                        <View className={`px-2 py-0.5 rounded-full ${getDifficultyColor()}`}>
                          <Text className='text-xs font-medium capitalize'>
                            {habit.difficulty}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Description (if no stats) */}
                  {!showStats && habit.description && (
                    <Text className='text-sm text-gray-600 dark:text-gray-400' numberOfLines={1}>
                      {habit.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Completion Indicator */}
              <View className='ml-3'>
                <View className={`w-8 h-8 rounded-full border-2 ${
                  completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } items-center justify-center`}>
                  {completed && (
                    <Check size={16} color='#ffffff' strokeWidth={3} />
                  )}
                </View>
              </View>
            </View>

            {/* Processing Overlay */}
            {isProcessing && (
              <View className='absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-2xl items-center justify-center'>
                <ActivityIndicator size='small' color='#2196F3' />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </SwippableView>
      
      <ConfirmationModal ref={confirmationModalRef} />
    </>
  )
}
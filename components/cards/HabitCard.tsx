import { View, Text, ActivityIndicator } from 'react-native'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { HabitSchemaType } from '@/types'
import { useActions } from '@/contexts/HabitBloomGlobalContext'
import SwippableView from '@/components/SwippableView'
import { Check, Trash2 } from 'lucide-react-native'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'
import { cn } from '@/lib/utils'

type HabitCardProps = {
  habit: HabitSchemaType
  userId: number
  onDataChange?: () => void | Promise<void>
}

export default function HabitCard({ 
  habit, 
  userId, 
  onDataChange
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
    if (!userId || isProcessing || completed) return

    setIsProcessing(true)
    try {
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

      // Update habit stats
      await actions.habit.updateHabit(habitId, userId, {
        totalCompletions: (habit.totalCompletions || 0) + 1,
        currentStreak: (habit.currentStreak || 0) + 1,
        longestStreak: Math.max(habit.longestStreak || 0, (habit.currentStreak || 0) + 1),
        lastCompletedAt: new Date(),
      })

      setCompleted(true)
      await onDataChange?.()
    } catch (error) {
      console.error('Error completing habit:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [userId, habit, completed, actions, onDataChange, isProcessing])

  // Delete habit
  const handleDeleteHabit = useCallback(async (habitId: number) => {
    if (!habit || isProcessing) return

    setIsProcessing(true)
    try {
      await actions.habit.deleteHabit(habitId, userId)
      await onDataChange?.()
    } catch (error) {
      console.error('Error deleting habit:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [habit, actions.habit, userId, onDataChange, isProcessing])

  if (isCheckingCompletion) {
    return (
      <View className='bg-card rounded-2xl p-4 border border-border'>
        <ActivityIndicator size='small' color='hsl(165, 75%, 45%)' />
      </View>
    )
  }

  return (
    <>
      <SwippableView
        key={habit.id}
        swipeRightText={completed ? 'Done' : 'Complete'}
        swipeLeftText="Delete"
        swipeRightAction={() => { if (!completed) handleCompleteHabit(habit.id!) }}
        swipeLeftAction={() => handleDeleteHabit(habit.id!)}
        rightBg={completed ? 'hsl(215, 15%, 50%)' : 'hsl(145, 65%, 50%)'}
        leftBg="hsl(0, 75%, 55%)"
        rightIcon={<Check size={20} color="white" />}
        leftIcon={<Trash2 size={20} color="white" />}
        styles={{ borderRadius: 16, marginBottom: 0 }}
        isSwipable={!isProcessing}
      >
        <View 
          className={cn(
            'bg-card rounded-2xl p-4 border',
            completed ? 'border-success/30' : 'border-border'
          )}
        >
          <View className='flex-row items-center justify-between'>
            <View className='flex-row items-center flex-1 gap-3'>
              <Text className='text-2xl'>{habit.icon || '✨'}</Text>
              
              <View className='flex-1'>
                <Text 
                  className={cn(
                    'font-semibold text-base',
                    completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}
                  numberOfLines={2}
                >
                  {habit.title}
                </Text>
                {habit.category && (
                  <Text className='text-xs text-muted-foreground mt-1'>
                    {habit.category}
                  </Text>
                )}
              </View>
            </View>

            <View className={cn(
              'w-10 h-10 rounded-full border-2 items-center justify-center',
              completed ? 'bg-success border-success' : 'border-muted-foreground/30'
            )}>
              {completed && <Check size={18} color='white' strokeWidth={3} />}
            </View>
          </View>

          {isProcessing && (
            <View className='absolute inset-0 bg-background/50 rounded-2xl items-center justify-center'>
              <ActivityIndicator size='small' color='hsl(165, 75%, 45%)' />
            </View>
          )}
        </View>
      </SwippableView>
      
      <ConfirmationModal ref={confirmationModalRef} />
    </>
  )
}

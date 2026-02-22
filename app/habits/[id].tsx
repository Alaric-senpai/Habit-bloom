import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { ArrowLeft, Edit2, Trash2, Play, Pause, Calendar, TrendingUp, Award, Clock, Target, MapPin } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActions, useAuth } from '@/contexts/HabitBloomGlobalContext'
import type { HabitSchemaType, HabitLogSchemaType } from '@/types'
import LineChart from '@/components/charts/LineChart'
import {formatDistanceStrict} from 'date-fns'

import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal';


export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { auth } = useAuth()
  const actions = useActions()
  const userId = auth?.user?.id


  const modalRef = useRef<ConfirmationModalRef>(null)

  const [habit, setHabit] = useState<HabitSchemaType | null>(null)
  const [logs, setLogs] = useState<HabitLogSchemaType[]>([])
  const [stats, setStats] = useState({
    totalCompletions: 0,
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
    thisWeek: 0,
    thisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  // Load habit data
  const loadHabitData = useCallback(async () => {
    if (!userId || !id) return

    try {
      setLoading(true)
      const habitData = await actions.habit.getHabitById(Number(id), userId)
    //   
      setHabit(habitData)

      // Load logs
      const habitLogs = await actions.habitLog.getHabitLogs(Number(id), userId, 90)
      setLogs(habitLogs)

      // Calculate stats
      const completionStats = await actions.habitLog.getCompletionStats(userId, Number(id))
      
      // This week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekLogs = habitLogs.filter(log => 
        new Date(log.logDate) >= weekAgo && log.status === 'completed'
      )

      // This month
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const monthLogs = habitLogs.filter(log => 
        new Date(log.logDate) >= monthAgo && log.status === 'completed'
      )

      setStats({
        totalCompletions: habitData.totalCompletions || 0,
        currentStreak: habitData.currentStreak || 0,
        longestStreak: habitData.longestStreak || 0,
        completionRate: completionStats.completionRate,
        thisWeek: weekLogs.length,
        thisMonth: monthLogs.length,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading habit:', error)
      setLoading(false)
      modalRef.current?.show('error', 'Error', 'Failed to load habit details')
      router.back()
    }
  }, [userId, id, actions])

  useEffect(() => {
    loadHabitData()
  }, [loadHabitData])

  // Toggle pause
  const handleTogglePause = useCallback(async () => {
    if (!habit || !userId) return

    try {
      await actions.habit.togglePause(habit.id!, userId)
      await loadHabitData()
      modalRef.current?.show({
        type: 'success',
        title: 'Sucesss',
        message: habit.isPaused ? 'Habit will resume from now': 'Habit has been paused',
        confirmText: 'Great'
      })
    //   Alert.alert('Success', habit.isPaused ? 'Habit resumed' : 'Habit paused')
    } catch (error) {
      console.error('Error toggling pause:', error)
      modalRef.current?.show({
        type: 'error',
        title: 'Error',
        message: "Failed to update habit",

      })
    //   Alert.alert('Error', 'Failed to update habit')
    }
  }, [habit, userId, actions, loadHabitData])

  // Toggle calendar sync
  const handleToggleCalendar = useCallback(async () => {
    if (!habit || !userId) return

    try {
      await actions.habit.updateHabit(habit.id!, userId, {
        inCalendar: !habit.inCalendar,
      })
      modalRef.current?.show({
        type: 'success',
        title: 'Success',
        message: 'Event modified acordingly in calendar'
      })
      await loadHabitData()
    } catch (error) {
    //   console.error('Error toggling calendar:', error)
    modalRef.current?.show({
        type: 'error',
        title:'Sync Error',
        message: 'Failed to sync in calendar'
    })
    }
  }, [habit, userId, actions, loadHabitData])

  // Delete habit
  const handleDelete = useCallback(() => {
    if (!habit || !userId) return


    modalRef.current?.show({
        type: 'confirmation',
        title: `Delete habit ${habit.title}`,
        message: `Are you sure you want to delete ${habit.title}?. This action cannot be undone. Be careful`,
        confirmText: 'Delete Habit',
        danger: true,
        cancelText: 'Cancel Action',
        onConfirm: async()=>{
            try {
                modalRef.current?.dismiss()
                await actions.habit.hardDeleteHabit(habit.id!, userId)
                
                modalRef.current?.show({
                    type: 'success',
                    title: `${habit.title} deleted`,
                    message: `${habit.title} was successfully deleted`,
                })

                router.back()

            } catch (error) {
                    modalRef.current?.show({
                    type: 'error',
                    title: `${habit.title} delete failed`,
                    message: `Attempted delete on${habit.title} failed maybe retry`,
                })
            }
        }
    })

  }, [habit, userId, actions])

  // Prepare chart data
  const chartData = logs
    .slice(0, 7)
    .reverse()
    .map((log, index) => ({
      value: log.status === 'completed' ? 1 : 0,
      label: formatDistanceStrict(new Date(),log.logDate),
      dataPointColor: log.status === 'completed' ? '#22c55e' : '#ef4444',
    }))

  // Fill missing days with 0 values if needed
  const filledChartData = chartData.length > 0 ? chartData : [
    { value: 0, label: '1', dataPointColor: '#ef4444' }
  ]

  if (loading || !habit) {
    return (
      <View className='flex-1 bg-white dark:bg-gray-900 items-center justify-center'>
        <Text className='text-gray-600 dark:text-gray-400'>Loading...</Text>
      </View>
    )
  }

  const difficultyColors = {
    easy: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    hard: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  }

  return (
    <View className='flex-1 bg-white dark:bg-gray-900' style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className='px-6 py-4 border-b border-gray-200 dark:border-gray-800'>
        <View className='flex-row items-center justify-between'>
          <TouchableOpacity onPress={() => router.back()} className='p-2'>
            <ArrowLeft size={24} className='text-gray-900 dark:text-white' />
          </TouchableOpacity>
          <View className='flex-row items-center space-x-3'>
            <TouchableOpacity onPress={() => router.push(`/habits/${id}/edit` as any)} className='p-2'>
              <Edit2 size={20} className='text-gray-700 dark:text-gray-300' />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className='p-2'>
              <Trash2 size={20} className='text-red-600' />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Habit Header */}
        <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
          <View className='flex-row items-start'>
            <Text className='text-5xl mr-4'>{habit.icon}</Text>
            <View className='flex-1'>
              <Text className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                {habit.title}
              </Text>
              {habit.description && (
                <Text className='text-gray-600 dark:text-gray-400 mb-3'>
                  {habit.description}
                </Text>
              )}
              <View className='flex-row items-center flex-wrap gap-2'>
                <View className={`px-3 py-1 rounded-full ${difficultyColors[habit.difficulty || 'medium']}`}>
                  <Text className='text-xs font-medium capitalize'>{habit.difficulty}</Text>
                </View>
                <View className='px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20'>
                  <Text className='text-xs font-medium text-blue-700 dark:text-blue-300 capitalize'>
                    {habit.frequency}
                  </Text>
                </View>
                {habit.category && (
                  <View className='px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20'>
                    <Text className='text-xs font-medium text-purple-700 dark:text-purple-300'>
                      {habit.category}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Statistics
          </Text>
          <View className='flex-row flex-wrap gap-3'>
            <View className='flex-1 min-w-[45%] bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4'>
              <TrendingUp size={20} className='text-orange-600 dark:text-orange-400 mb-2' />
              <Text className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                {stats.currentStreak}
              </Text>
              <Text className='text-sm text-orange-700 dark:text-orange-300'>Current Streak</Text>
            </View>
            <View className='flex-1 min-w-[45%] bg-green-50 dark:bg-green-900/20 rounded-xl p-4'>
              <Award size={20} className='text-green-600 dark:text-green-400 mb-2' />
              <Text className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {stats.longestStreak}
              </Text>
              <Text className='text-sm text-green-700 dark:text-green-300'>Longest Streak</Text>
            </View>
            <View className='flex-1 min-w-[45%] bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4'>
              <Target size={20} className='text-blue-600 dark:text-blue-400 mb-2' />
              <Text className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {stats.completionRate}%
              </Text>
              <Text className='text-sm text-blue-700 dark:text-blue-300'>Completion Rate</Text>
            </View>
            <View className='flex-1 min-w-[45%] bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4'>
              <Clock size={20} className='text-purple-600 dark:text-purple-400 mb-2' />
              <Text className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {stats.totalCompletions}
              </Text>
              <Text className='text-sm text-purple-700 dark:text-purple-300'>Total Completions</Text>
            </View>
          </View>
        </View>

        {/* Progress Chart */}
        {filledChartData.length > 0 && (
          <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
            <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              7-Day Progress
            </Text>
            <View className='bg-gray-50 dark:bg-gray-800 rounded-xl p-4'>
              <LineChart
                data={filledChartData}
                height={180}
                width={320}
                spacing={10}
                thickness={3}
                
                color='#2196F3'
                hideDataPoints={false}
                // dataPointsRadius={4}
                // noOfSections={3}
                yAxisColor='#9ca3af'
                xAxisColor='#9ca3af'
              />
            </View>
          </View>
        )}

        {/* Details */}
        <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Details
          </Text>
          <View className='space-y-3'>
            {habit.startTime && (
              <View className='flex-row items-center'>
                <Clock size={18} className='text-gray-600 dark:text-gray-400 mr-3' />
                <Text className='text-gray-900 dark:text-white'>
                  Time: {habit.startTime}
                  {habit.endTime && ` - ${habit.endTime}`}
                </Text>
              </View>
            )}
            {habit.locationTag && (
              <View className='flex-row items-center'>
                <MapPin size={18} className='text-gray-600 dark:text-gray-400 mr-3' />
                <Text className='text-gray-900 dark:text-white'>Location: {habit.locationTag}</Text>
              </View>
            )}
            {habit.customFrequency && (
              <View className='flex-row items-center'>
                <Calendar size={18} className='text-gray-600 dark:text-gray-400 mr-3' />
                <Text className='text-gray-900 dark:text-white'>Schedule: {habit.customFrequency}</Text>
              </View>
            )}
            {habit.rewardTag && (
              <View className='flex-row items-center'>
                <Award size={18} className='text-gray-600 dark:text-gray-400 mr-3' />
                <Text className='text-gray-900 dark:text-white'>Reward: {habit.rewardTag}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Settings */}
        <View className='px-6 py-6'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Settings
          </Text>
          <View className='space-y-4'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>
                  {habit.isPaused ? 'Resume Habit' : 'Pause Habit'}
                </Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  {habit.isPaused ? 'Start tracking again' : 'Temporarily stop tracking'}
                </Text>
              </View>
              <Switch
                value={!habit.isPaused}
                onValueChange={handleTogglePause}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
              />
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>Sync to Calendar</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Add to your device calendar
                </Text>
              </View>
              <Switch
                value={habit.inCalendar}
                onValueChange={handleToggleCalendar}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
              />
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className='px-6 py-6'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Recent Activity
          </Text>
          <View className='space-y-3'>
            {logs.slice(0, 10).map((log) => (
              <View
                key={log.id}
                className={`p-4 rounded-xl border my-2 ${
                  log.status === 'completed'
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    : log.status === 'missed'
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <View className='flex-row items-center justify-between my-1'>
                  <View>
                    <Text className='font-medium text-gray-900 dark:text-white capitalize'>
                      {log.status}
                    </Text>
                    <Text className='text-sm text-gray-600 dark:text-gray-400'>
                      {new Date(log.logDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  {log.mood && (
                    <View className='bg-white dark:bg-gray-700 px-3 py-1 rounded-full'>
                      <Text className='text-xs'>{log.mood}</Text>
                    </View>
                  )}
                </View>
                {log.note && (
                  <Text className='text-sm text-gray-600 dark:text-gray-400 mt-2'>{log.note}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
        <ConfirmationModal ref={modalRef} />
      </ScrollView>
    </View>
  )
}
import { View, Text, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import Container from '@/components/Container'
import SwippableView from '@/components/SwippableView'
import { Image } from 'expo-image'
import { Logo } from '@/constants/images'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bell, MoreVertical, Plus, Target, TrendingUp, Calendar, Check, Trash2, Database, Award, Clock } from 'lucide-react-native'
import { useActions, useAuth } from '@/contexts/HabitBloomGlobalContext'
import { clearAllData, seedDatabase } from '@/database/seeder/seed'
import { router } from 'expo-router'
import type { HabitSchemaType, AchievementSchemaType, HabitLogSchemaType } from '@/types'
import TodaysMoodRecorded from '@/components/modals/TodaysMoodRecorded'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const { auth } = useAuth()
  const actions = useActions()

  // State
  const [todayHabits, setTodayHabits] = useState<HabitSchemaType[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLogSchemaType[]>([])
  const [totalAchievementPoints, setPoints] = useState<number>(0)
  const [weekAchievements, setWeekAchievements] = useState<AchievementSchemaType[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([])
  const [stats, setStats] = useState({
    activeHabits: 0,
    completedToday: 0,
    totalToday: 0,
    successRate: 0
  })
  const [refreshing, setRefreshing] = useState(false)
  const [greeting, setGreeting] = useState<string>('Hello')

  const user = auth?.user
  const userName = user?.name?.trim().split(" ")[0] || 'User'
  const userId = user?.id

  // Get greeting based on time
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning'
    if (hour < 18) return 'Afternoon'
    return 'Evening'
  }, [])

  // Load all data
  const loadData = useCallback(async () => {
    if (!userId) return

    try {
      // Load today's habits (active only)
      const allHabits = await actions.habit.getHabits(userId, false)
      const activeHabits = allHabits.filter(h => !h.isArchived && !h.isPaused)
      setTodayHabits(activeHabits)

      console.dir(allHabits[0])

      // Load today's logs
      const logs = await actions.habitLog.getTodaysLogs(userId)
      setTodayLogs(logs)

      console.dir(logs[0])

      // Calculate stats
      const completed = logs.filter(log => log.status === 'completed').length
      const successRate = activeHabits.length > 0 
        ? Math.round((completed / activeHabits.length) * 100) 
        : 0

      setStats({
        activeHabits: activeHabits.length,
        completedToday: completed,
        totalToday: activeHabits.length,
        successRate
      })

      // Load achievements from last 7 days
      const allAchievements = await actions.achievement.getAchievements(userId)
      const recentAchievements = await actions.achievement.getAchievementsThisWeek(userId)
      setWeekAchievements(recentAchievements)

      console.dir(recentAchievements[0])

      // Calculate total points
      const totalPoints = await actions.achievement.getTotalPoints(userId)
      setPoints(totalPoints)


      // Load weekly progress (last 7 days)
      await loadWeeklyProgress(userId)

    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [userId, actions])

  // Load weekly progress for chart
  const loadWeeklyProgress = useCallback(async (uid: number) => {
    const progress: number[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      const logs = await actions.habitLog.getLogsByDateRange(uid, date, endDate)
      const completed = logs.filter(log => log.status === 'completed').length
      progress.push(completed)
    }

    setWeeklyProgress(progress)
  }, [actions.habitLog])

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  // Initialize
  useEffect(() => {
    setGreeting(getGreeting())
    if (userId) {
      loadData()
    }
  }, [userId, getGreeting, loadData])

  // Check if habit is completed today
  const isHabitCompleted = useCallback((habitId: number) => {
    return todayLogs.some(log => log.habitId === habitId && log.status === 'completed')
  }, [todayLogs])

  // Get habit streak
  const getHabitStreak = useCallback((habitId: number) => {
    const habit = todayHabits.find(h => h.id === habitId)
    return habit?.currentStreak || 0
  }, [todayHabits])

  // Complete habit
  const handleCompleteHabit = useCallback(async (habitId: number) => {
    if (!userId) return

    try {
      const habit = todayHabits.find(h => h.id === habitId)
      if (!habit) return

      // Check if already completed
      if (isHabitCompleted(habitId)) {
        Alert.alert('Already Completed', 'This habit is already completed for today!')
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

      // Update habit stats
      await actions.habit.updateHabit(habitId, userId, {
        totalCompletions: (habit.totalCompletions || 0) + 1,
        currentStreak: (habit.currentStreak || 0) + 1,
        longestStreak: Math.max(habit.longestStreak || 0, (habit.currentStreak || 0) + 1),
        lastCompletedAt: new Date(),
      })

      // Reload data
      await loadData()

      Alert.alert('Great Job! 🎉', `You've completed "${habit.title}"!`)
    } catch (error) {
      console.error('Error completing habit:', error)
      Alert.alert('Error', 'Failed to complete habit')
    }
  }, [userId, todayHabits, isHabitCompleted, actions, loadData])

  // Delete habit
  const handleDeleteHabit = useCallback(async (habitId: number) => {
    const habit = todayHabits.find(h => h.id === habitId)
    if (!habit) return

    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.habit.deleteHabit(habitId, userId!)
              await loadData()
              Alert.alert('Deleted', 'Habit deleted successfully')
            } catch (error) {
              console.error('Error deleting habit:', error)
              Alert.alert('Error', 'Failed to delete habit')
            }
          }
        }
      ]
    )
  }, [todayHabits, actions.habit, userId, loadData])

  // Seeder functions
  const runSeeder = useCallback(async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated')
      return
    }
    
    Alert.alert(
      'Seed Database',
      'This will add sample data to your account. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Seed Data', 
          onPress: async () => {
            try {
              await seedDatabase(userId)
              await loadData()
              Alert.alert('Success', 'Database seeded successfully!')
            } catch (error) {
              console.error('Seeding error:', error)
              Alert.alert('Error', 'Failed to seed database')
            }
          }
        }
      ]
    )
  }, [userId, loadData])

  const deleteSeededData = useCallback(async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated')
      return
    }
    
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL data. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData()
              await loadData()
              Alert.alert('Success', 'All data cleared successfully!')
            } catch (error) {
              console.error('Clear data error:', error)
              Alert.alert('Error', 'Failed to clear data')
            }
          }
        }
      ]
    )
  }, [userId, loadData])

  const contentInsets = {
    top: insets.top,
    right: insets.right
  }

  return (
    <Container>
      <ScrollView 
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <TodaysMoodRecorded />

        {/* Header Section */}
        <View className='px-6 pt-4 pb-6'>
          <View className='flex-row items-center justify-between mb-6'>
            <View className='flex-row items-center flex-1'>
              <Image source={Logo} style={{width: 40, height: 40}} className='mr-3' />
              <View>
                <Text className='text-lg font-bold text-gray-900 dark:text-white'>
                  {greeting}, {userName}! 👋
                </Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Ready to bloom today?
                </Text>
              </View>
            </View>
            
            <View className='flex-row items-center space-x-3'>
              <TouchableOpacity 
                className='p-3 rounded-full bg-gray-100 dark:bg-gray-800'
                onPress={() => router.push('/notifications' as any)}
              >
                <Bell size={20} className='text-gray-700 dark:text-gray-300' />
              </TouchableOpacity>
              
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <View className='p-3 rounded-full bg-gray-100 dark:bg-gray-800'>
                    <MoreVertical size={20} className='text-gray-700 dark:text-gray-300' />
                  </View>
                </DropdownMenuTrigger>
                <DropdownMenuContent insets={contentInsets} sideOffset={2} className="w-48" align="end">
                  <DropdownMenuItem onPress={() => router.push('/goals' as any)}>
                    <View className='flex-row items-center space-x-2'>
                      <Target size={16} className='text-gray-600' />
                      <Text className='text-sm text-gray-900'>Goals</Text>
                    </View>
                  </DropdownMenuItem>
                  <DropdownMenuItem onPress={() => router.push('/achievements' as any)}>
                    <View className='flex-row items-center space-x-2'>
                      <Award size={16} className='text-gray-600' />
                      <Text className='text-sm text-gray-900'>Achievements</Text>
                    </View>
                  </DropdownMenuItem>
                  <DropdownMenuItem onPress={runSeeder}>
                    <View className='flex-row items-center space-x-2'>
                      <Database size={16} className='text-blue-600' />
                      <Text className='text-sm text-blue-600'>Seed Sample Data</Text>
                    </View>
                  </DropdownMenuItem>
                  <DropdownMenuItem onPress={deleteSeededData}>
                    <View className='flex-row items-center space-x-2'>
                      <Trash2 size={16} className='text-red-600' />
                      <Text className='text-sm text-red-600'>Clear All Data</Text>
                    </View>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View className='px-6 mb-6'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Today's Overview
          </Text>
          <View className='flex-row space-x-4'>
            <View className='flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4'>
              <View className='flex-row items-center justify-between mb-2'>
                <Target size={20} className='text-blue-600 dark:text-blue-400' />
                <Text className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {stats.activeHabits}
                </Text>
              </View>
              <Text className='text-sm text-blue-700 dark:text-blue-300 font-medium'>
                Active Habits
              </Text>
            </View>
            
            <View className='flex-1 bg-green-50 dark:bg-green-900/20 rounded-2xl p-4'>
              <View className='flex-row items-center justify-between mb-2'>
                <TrendingUp size={20} className='text-green-600 dark:text-green-400' />
                <Text className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {stats.successRate}%
                </Text>
              </View>
              <Text className='text-sm text-green-700 dark:text-green-300 font-medium'>
                Success Rate
              </Text>
            </View>

            <View className='flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4'>
              <View className='flex-row items-center justify-between mb-2'>
                <Award size={20} className='text-purple-600 dark:text-purple-400' />
                <Text className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                  {totalAchievementPoints}
                </Text>
              </View>
              <Text className='text-sm text-purple-700 dark:text-purple-300 font-medium'>
                Total Points
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Progress */}
        {stats.totalToday > 0 && (
          <View className='px-6 mb-6'>
            <View className='bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700'>
              <Text className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                Today's Progress: {stats.completedToday} of {stats.totalToday} completed
              </Text>
              <View className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                <View 
                  className='h-full bg-primary rounded-full'
                  style={{ width: `${stats.totalToday > 0 ? (stats.completedToday / stats.totalToday) * 100 : 0}%` }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Today's Habits Section */}
        <View className='px-6 mb-6'>
          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
              Today's Habits ({stats.completedToday}/{stats.totalToday})
            </Text>
            <TouchableOpacity 
              className='bg-primary rounded-full p-2'
              onPress={() => router.push('/habits/create' as any)}
            >
              <Plus size={16} className='text-white' />
            </TouchableOpacity>
          </View>
          
          {/* Habit Cards */}
          {todayHabits.length === 0 ? (
            <View className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 items-center'>
              <Clock size={48} className='text-gray-400 mb-3' />
              <Text className='text-gray-600 dark:text-gray-400 text-center mb-2 font-medium'>
                No habits yet
              </Text>
              <Text className='text-gray-500 dark:text-gray-500 text-center text-sm'>
                Create your first habit to start building better routines
              </Text>
            </View>
          ) : (
            <View className='space-y-3'>
              {todayHabits.map((habit) => {
                const completed = isHabitCompleted(habit.id!)
                const streak = getHabitStreak(habit.id!)
                
                return (
                  <SwippableView
                    key={habit.id}
                    swipeRightText="Complete"
                    swipeLeftText="Delete"
                    swipeRightAction={() => handleCompleteHabit(habit.id!)}
                    swipeLeftAction={() => handleDeleteHabit(habit.id!)}
                    rightBg="#22c55e"
                    leftBg="#ef4444"
                    rightIcon={<Check size={20} color="white" />}
                    leftIcon={<Trash2 size={20} color="white" />}
                    styles={{ borderRadius: 16, marginBottom: 12 }}
                    isSwipable={!completed}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push(`/habits/${habit.id}` as any)}
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
                            <Text className='text-2xl mr-3'>{habit.icon}</Text>
                            <View className='flex-1'>
                              <Text className={`font-semibold ${
                                completed 
                                  ? 'text-green-800 dark:text-green-200 line-through' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {habit.title}
                              </Text>
                              <Text className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                                {habit.startTime || 'Anytime'} • {streak} day streak 🔥
                              </Text>
                            </View>
                          </View>
                          <View className={`w-6 h-6 rounded-full border-2 ${
                            completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          } items-center justify-center`}>
                            {completed && (
                              <Text className='text-white text-xs'>✓</Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </SwippableView>
                )
              })}
            </View>
          )}
        </View>

        {/* Weekly Progress */}
        {weeklyProgress.length > 0 && (
          <View className='px-6 mb-6'>
            <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              This Week
            </Text>
            <View className='bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700'>
              <View className='flex-row items-center justify-between mb-3'>
                <Text className='font-medium text-gray-900 dark:text-white'>
                  Weekly Progress
                </Text>
                <Calendar size={20} className='text-gray-600 dark:text-gray-400' />
              </View>
              <View className='flex-row justify-between items-end mb-2' style={{ height: 80 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const count = weeklyProgress[index] || 0
                  const maxCount = Math.max(...weeklyProgress, 1)
                  const height = (count / maxCount) * 60 + 20
                  
                  return (
                    <View key={day} className='items-center' style={{ flex: 1 }}>
                      <View 
                        className={`w-8 rounded-t ${
                          count > 0 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{ height }}
                      />
                      <Text className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
                        {day}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          </View>
        )}

        {/* Recent Achievements */}
        {weekAchievements.length > 0 && (
          <View className='px-6 mb-6'>
            <View className='flex-row items-center justify-between mb-4'>
              <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
                Recent Achievements
              </Text>
              <TouchableOpacity onPress={() => router.push('/achievements' as any)}>
                <Text className='text-sm text-primary font-medium'>View All</Text>
              </TouchableOpacity>
            </View>
            <View className='space-y-3'>
              {weekAchievements.slice(0, 3).map((achievement) => (
                <View 
                  key={achievement.id}
                  className='bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700'
                >
                  <View className='flex-row items-center'>
                    <Text className='text-3xl mr-3'>{achievement.icon}</Text>
                    <View className='flex-1'>
                      <Text className='font-semibold text-gray-900 dark:text-white'>
                        {achievement.title}
                      </Text>
                      <Text className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                        {achievement.description}
                      </Text>
                    </View>
                    <View className='bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full'>
                      <Text className='text-yellow-700 dark:text-yellow-400 font-bold text-sm'>
                        +{achievement.points}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className='min-h-24' />
      </ScrollView>
    </Container>
  )
}
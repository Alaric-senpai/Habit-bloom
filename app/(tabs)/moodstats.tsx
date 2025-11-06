import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import ScrollableContainer from '@/components/ScrollableContainer'
import { Calendar as CalendarIcon, TrendingUp, Smile, BarChart3, RefreshCw } from 'lucide-react-native'
import { useAuth, useActions } from '@/contexts/HabitBloomGlobalContext'
import { MoodSchemaType } from '@/types'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, DateData } from 'react-native-calendars'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'

// Mood emoji mapping based on the actual schema
const MOOD_EMOJIS = {
  'Happy': '😊',
  'Relaxed': '😌',
  'Motivated': '🔥',
  'Focused': '🎯',
  'Grateful': '🙏',
  'Calm': '😇',
  'Excited': '🤩',
  'Confident': '💪',
  'Proud': '🏆',
  'Content': '😊',
  'Inspired': '✨',
  'Optimistic': '🌟',
  'Loved': '🥰',
  'Neutral': '😐',
  'Reflective': '🤔',
  'Bored': '😑',
  'Indifferent': '😶',
  'Tired': '😴',
  'Sad': '😢',
  'Anxious': '😰',
  'Angry': '😠',
  'Stressed': '😫',
  'Overwhelmed': '🤯',
  'Lonely': '😔',
  'Frustrated': '😤',
  'Disappointed': '😞',
  'Guilty': '😳',
  'Worried': '😟'
} as const

// Mood colors for calendar dots
const MOOD_COLORS = {
  'Happy': '#FFD700',
  'Relaxed': '#98FB98',
  'Motivated': '#FF6B6B',
  'Focused': '#4ECDC4',
  'Grateful': '#A8E6CF',
  'Calm': '#90EE90',
  'Excited': '#FF69B4',
  'Confident': '#FF8C00',
  'Proud': '#9370DB',
  'Content': '#87CEEB',
  'Inspired': '#DDA0DD',
  'Optimistic': '#F0E68C',
  'Loved': '#FFB6C1',
  'Neutral': '#D3D3D3',
  'Reflective': '#B0C4DE',
  'Bored': '#C0C0C0',
  'Indifferent': '#DCDCDC',
  'Tired': '#D8BFD8',
  'Sad': '#87CEEB',
  'Anxious': '#FFB347',
  'Angry': '#DC143C',
  'Stressed': '#FFA07A',
  'Overwhelmed': '#FF6347',
  'Lonely': '#6A5ACD',
  'Frustrated': '#FF4500',
  'Disappointed': '#708090',
  'Guilty': '#DDA0DD',
  'Worried': '#DAA520'
} as const

// Use a flexible interface for database mood data
interface DatabaseMoodType {
  id: number
  userId: number
  moodLevel: number
  moodLabel: string | null
  note: string | null
  emoji: string | null
  energyLevel: number | null
  stressLevel: number | null
  loggedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface MoodData {
  [key: string]: DatabaseMoodType // key format: 'YYYY-MM-DD'
}

export default function MoodStats() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [moodData, setMoodData] = useState<MoodData>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const { auth } = useAuth()
  const actions = useActions()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null)
  
  const userId = auth?.user?.id

  // Load mood data for a date range
  const loadMoodData = useCallback(async (startDate: Date, endDate: Date, showRefreshing = false) => {
    if (!userId) return
    
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const moods = await actions.mood.getMoodsByDateRange(userId, startDate, endDate)
      
      // Convert array to object with date keys
      const moodMap: MoodData = {}
      moods.forEach((mood) => {
        const dateKey = format(new Date(mood.loggedAt || mood.createdAt), 'yyyy-MM-dd')
        moodMap[dateKey] = mood
      })
      
      setMoodData(moodMap)
    } catch (error) {
      console.error('Error loading mood data:', error)
      confirmationModalRef.current?.show({
        type: 'error',
        title: 'Failed to Load Mood Data',
        message: 'There was an error loading your mood history. Please try again.',
        confirmText: 'Retry',
        showCancel: false,
        onConfirm: () => loadMoodData(startDate, endDate, true)
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId, actions.mood])

  // Load data when component mounts
  useEffect(() => {
    const currentDate = new Date()
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    loadMoodData(start, end)
  }, [loadMoodData])

  // Handle month change in calendar
  const onMonthChange = useCallback((month: DateData) => {
    const monthDate = parseISO(month.dateString)
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    loadMoodData(start, end)
  }, [loadMoodData])

  // Handle refresh
  const onRefresh = useCallback(() => {
    const currentDate = parseISO(selectedDate)
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    loadMoodData(start, end, true)
  }, [selectedDate, loadMoodData])

  // Helper functions
  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {}
    
    // Mark dates with mood data
    Object.entries(moodData).forEach(([dateKey, mood]) => {
      const moodLabel = mood.moodLabel || 'Neutral'
      const emoji = mood.emoji || MOOD_EMOJIS[moodLabel as keyof typeof MOOD_EMOJIS] || '😐'
      const color = MOOD_COLORS[moodLabel as keyof typeof MOOD_COLORS] || '#D3D3D3'
      
      marked[dateKey] = {
        customStyles: {
          container: {
            backgroundColor: color,
            borderRadius: 20,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          },
          text: {
            color: '#000',
            fontWeight: 'bold',
            fontSize: 16,
          }
        },
        emoji: emoji,
        moodData: mood
      }
    })
    
    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#3B82F6',
        selectedTextColor: 'white'
      }
    }
    
    return marked
  }

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString)
    const mood = moodData[day.dateString]
    
    if (mood) {
      const moodLabel = mood.moodLabel || 'Unknown'
      const emoji = mood.emoji || MOOD_EMOJIS[moodLabel as keyof typeof MOOD_EMOJIS] || '😐'
      
      confirmationModalRef.current?.show({
        type: 'info',
        title: `${emoji} ${moodLabel}`,
        message: `Mood logged on ${format(parseISO(day.dateString), 'EEEE, MMMM d, yyyy')}${
          mood.note ? `\n\nNote: ${mood.note}` : ''
        }${
          mood.energyLevel ? `\nEnergy Level: ${mood.energyLevel}/10` : ''
        }${
          mood.stressLevel ? `\nStress Level: ${mood.stressLevel}/10` : ''
        }`,
        confirmText: 'OK',
        showCancel: false
      })
    }
  }

  const getMoodStats = () => {
    const moods = Object.values(moodData)
    const total = moods.length
    
    if (total === 0) return null
    
    const moodCounts = moods.reduce((acc, mood) => {
      const moodLabel = mood.moodLabel || 'Neutral'
      acc[moodLabel] = (acc[moodLabel] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostCommon = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]
    
    // Calculate average levels
    const avgEnergy = moods.length > 0 
      ? moods.reduce((sum, mood) => sum + (mood.energyLevel || 5), 0) / moods.length 
      : 0
    const avgStress = moods.length > 0 
      ? moods.reduce((sum, mood) => sum + (mood.stressLevel || 5), 0) / moods.length 
      : 0
    
    return { total, moodCounts, mostCommon, avgEnergy, avgStress }
  }

  // Custom day rendering with emoji
  const renderDay = (date: any, item: any) => {
    const dateString = date ? format(date, 'yyyy-MM-dd') : null
    const mood = dateString ? moodData[dateString] : null
    const isSelected = dateString === selectedDate
    
    if (!date) return <View />
    
    return (
      <TouchableOpacity
        onPress={() => onDayPress({ dateString } as DateData)}
        className={`w-8 h-8 items-center justify-center rounded-full ${
          isSelected ? 'bg-primary' : 'bg-transparent'
        }`}
      >
        {mood ? (
          <Text className="text-lg">
            {mood.emoji || MOOD_EMOJIS[mood.moodLabel as keyof typeof MOOD_EMOJIS] || '😐'}
          </Text>
        ) : (
          <Text className={`text-sm ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
            {date.getDate()}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  const stats = getMoodStats()

  if (!userId) {
    return (
      <ScrollableContainer>
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
            Please log in to view your mood statistics
          </Text>
        </View>
      </ScrollableContainer>
    )
  }

  return (
    <ScrollableContainer>
      {/* Header */}
      <View className="px-5 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Mood Calendar
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Track your emotional journey
            </Text>
          </View>
          <View className="bg-primary/10 p-3 rounded-full">
            <Smile size={24} className="text-primary" />
          </View>
        </View>

        {/* Header Actions */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Emotional Journey
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-full bg-primary/10"
          >
            <RefreshCw 
              size={20} 
              className={`text-primary ${refreshing ? 'animate-spin' : ''}`} 
            />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <Card className="mb-6">
          <CardContent className="p-2">
            {loading ? (
              <View className="h-80 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-600 dark:text-gray-400 mt-2">
                  Loading mood calendar...
                </Text>
              </View>
            ) : (
              <Calendar
                // Calendar configuration
                current={selectedDate}
                onDayPress={onDayPress}
                onMonthChange={onMonthChange}
                
                // Marking configuration
                markedDates={getMarkedDates()}
                markingType="custom"
                
                // Appearance
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: '#666',
                  selectedDayBackgroundColor: '#3B82F6',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#3B82F6',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#3B82F6',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#3B82F6',
                  disabledArrowColor: '#d9e1e8',
                  monthTextColor: '#2d4150',
                  indicatorColor: '#3B82F6',
                  textDayFontFamily: 'System',
                  textMonthFontFamily: 'System',
                  textDayHeaderFontFamily: 'System',
                  textDayFontWeight: '400',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14
                }}
                
                // Custom day component
                dayComponent={({ date, state, marking }) => {
                  const dateString = date?.dateString || ''
                  const mood = moodData[dateString]
                  const isToday = dateString === format(new Date(), 'yyyy-MM-dd')
                  const isSelected = dateString === selectedDate
                  const isDisabled = state === 'disabled'
                  
                  return (
                    <TouchableOpacity
                      onPress={() => !isDisabled && onDayPress(date as DateData)}
                      disabled={isDisabled}
                      className={`w-10 h-10 items-center justify-center rounded-full ${
                        isSelected ? 'bg-primary/45' : 
                        isToday ? 'border-2 border-primary' : 
                        'bg-transparent'
                      }`}
                    >
                      {mood ? (
                        <View className="items-center justify-center">
                          <Text className="text-xl mb-1">
                            {mood.emoji || MOOD_EMOJIS[mood.moodLabel as keyof typeof MOOD_EMOJIS] || '😐'}
                          </Text>
                        </View>
                      ) : (
                        <Text 
                          className={`text-sm font-medium ${
                            isSelected ? 'text-white' : 
                            isDisabled ? 'text-gray-400' : 
                            isToday ? 'text-primary' : 
                            'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {date?.day}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )
                }}
                
                // Hide default arrows (we have refresh button)
                hideArrows={false}
                hideExtraDays={true}
                disableMonthChange={false}
                firstDay={1} // Monday as first day
                
                // Enable swipe
                enableSwipeMonths={true}
              />
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {stats && (
          <>
            <Card className="mb-6">
              <CardContent className="p-4 ">
                <View className="flex-row items-center mb-4">
                  <BarChart3 size={20} className="text-primary mr-2" />
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monthly Summary
                  </Text>
                </View>
                
                <View className="flex-row justify-between items-center mb-4">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-primary">
                      {stats.total}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      Days Logged
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text className="text-2xl">
                      {MOOD_EMOJIS[stats.mostCommon[0] as keyof typeof MOOD_EMOJIS] || '😐'}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      Most Common
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-green-500">
                      {stats.avgEnergy.toFixed(1)}/10
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      Avg Energy
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-orange-500">
                      {stats.avgStress.toFixed(1)}/10
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      Avg Stress
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Mood Breakdown */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Mood Breakdown
                </Text>
                
                {Object.entries(stats.moodCounts)
                  .sort(([,a], [,b]) => b - a)
                  .map(([mood, count]) => {
                    const percentage = Math.round((count / stats.total) * 100)
                    return (
                      <View key={mood} className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                          <Text className="text-lg mr-2">
                            {MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS] || '😐'}
                          </Text>
                          <Text className="text-gray-900 dark:text-white">
                            {mood}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <View className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                            <View 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </View>
                          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                            {count}
                          </Text>
                        </View>
                      </View>
                    )
                  })}
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!loading && Object.keys(moodData).length === 0 && (
          <Card>
            <CardContent className="p-8 items-center">
              <CalendarIcon size={48} className="text-gray-400 mb-4" />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                No Mood Data This Month
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center leading-6">
                Start logging your daily moods to see your emotional patterns and trends over time. 
                Your mood calendar will show beautiful emojis for each logged day!
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        {!loading && Object.keys(moodData).length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Read Your Calendar
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <View className="w-4 h-4 bg-primary rounded-full mr-3" />
                  <Text className="text-gray-600 dark:text-gray-400">
                    Selected day
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">😊</Text>
                  <Text className="text-gray-600 dark:text-gray-400">
                    Days with mood data show emojis
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-4 h-4 border-2 border-primary rounded-full mr-3" />
                  <Text className="text-gray-600 dark:text-gray-400">
                    Today's date
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal ref={confirmationModalRef} />
    </ScrollableContainer>
  )
}
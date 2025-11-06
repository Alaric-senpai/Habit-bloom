import { View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth, useActions } from '@/contexts/HabitBloomGlobalContext'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, TrendingUp, Calendar, Target, Award, RefreshCw, PieChart, Activity } from 'lucide-react-native'
import Svg, { Rect, Text as SvgText, Line, Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'
import Container from '@/components/Container'

const { width: screenWidth } = Dimensions.get('window')
const chartWidth = screenWidth - 60 // Account for padding

interface HabitCompletionData {
  habitId: number
  habitTitle: string
  totalDays: number
  completedDays: number
  completionRate: number
  streak: number
}

interface MoodDistribution {
  mood: string
  count: number
  percentage: number
  color: string
}

interface WeeklyProgress {
  week: string
  completed: number
  total: number
  rate: number
}

interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  type: string
  achievedAt: Date
}

// Mood colors for charts
const MOOD_CHART_COLORS = {
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
  'Sad': '#87CEEB',
  'Anxious': '#FFB347',
  'Angry': '#DC143C',
  'Stressed': '#FFA07A',
  'Tired': '#D8BFD8'
}

export default function ReportPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [habitData, setHabitData] = useState<HabitCompletionData[]>([])
  const [moodData, setMoodData] = useState<MoodDistribution[]>([])
  const [weeklyData, setWeeklyData] = useState<WeeklyProgress[]>([])
  const [achievementData, setAchievementData] = useState<Achievement[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  const { auth } = useAuth()
  const actions = useActions()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null)
  
  const userId = auth?.user?.id

  const loadAnalyticsData = useCallback(async (showRefreshing = false) => {
    if (!userId) return

    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const now = new Date()
      const daysBack = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
      const startDate = subDays(now, daysBack)

      // Load habits data
      const habits = await actions.habit.getHabits(userId, true)
      
      // Load habit logs for the period
      const habitCompletionData: HabitCompletionData[] = []
      
        for (const habit of habits) {
          if (habit.id) {
            try {
              const logs = await actions.habitLog.getLogsByDateRange(
                userId,
                startDate,
                now
              )
              const habitLogs = logs.filter(log => log.habitId === habit.id)
              
              const totalDays = daysBack
              const completedDays = habitLogs.filter(log => log.status === 'completed').length
            const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0
            
            // Calculate current streak
            const recentLogs = habitLogs
              .sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime())
              .slice(0, 10)
            
            let streak = 0
            for (const log of recentLogs) {
              if (log.status === 'completed') {
                streak++
              } else {
                break
              }
            }

            habitCompletionData.push({
              habitId: habit.id,
              habitTitle: habit.title,
              totalDays,
              completedDays,
              completionRate,
              streak
            })
          } catch (error) {
            console.error(`Error loading logs for habit ${habit.id}:`, error)
          }
        }
      }

      // Load mood data
      const moods = await actions.mood.getMoodsByDateRange(userId, startDate, now)
      const moodCounts: Record<string, number> = {}
      
      moods.forEach(mood => {
        const moodLabel = mood.moodLabel || 'Neutral'
        moodCounts[moodLabel] = (moodCounts[moodLabel] || 0) + 1
      })

      const totalMoods = moods.length
      const moodDistribution: MoodDistribution[] = Object.entries(moodCounts)
        .map(([mood, count]) => ({
          mood,
          count,
          percentage: totalMoods > 0 ? (count / totalMoods) * 100 : 0,
          color: MOOD_CHART_COLORS[mood as keyof typeof MOOD_CHART_COLORS] || '#D3D3D3'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Top 8 moods

      // Generate weekly progress data
      const weeklyProgress: WeeklyProgress[] = []
      const weeks = Math.ceil(daysBack / 7)
      
        for (let i = 0; i < weeks; i++) {
          const weekStart = subDays(now, (i + 1) * 7)
          const weekEnd = subDays(now, i * 7)
          
          let totalCompleted = 0
          let totalPossible = 0
          
          try {
            const weekLogs = await actions.habitLog.getLogsByDateRange(
              userId,
              weekStart,
              weekEnd
            )
            
            for (const habit of habits) {
              if (habit.id) {
                const habitWeekLogs = weekLogs.filter(log => log.habitId === habit.id)
                const completed = habitWeekLogs.filter(log => log.status === 'completed').length
                totalCompleted += completed
                totalPossible += 7 // Assuming daily habits
              }
            }
          } catch (error) {
            console.error(`Error loading week logs:`, error)
          }        weeklyProgress.unshift({
          week: `Week ${weeks - i}`,
          completed: totalCompleted,
          total: totalPossible,
          rate: totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0
        })
      }

      // Load achievements data
      const achievements = await actions.achievement.getAchievements(userId)
      const achievementList: Achievement[] = achievements.map(achievement => ({
        id: achievement.id || 0,
        title: achievement.title || '',
        description: achievement.description || '',
        icon: achievement.icon || '🏆',
        type: achievement.type || 'misc',
        achievedAt: achievement.achievedAt ? new Date(achievement.achievedAt) : new Date()
      }))

      setHabitData(habitCompletionData)
      setMoodData(moodDistribution)
      setWeeklyData(weeklyProgress)
      setAchievementData(achievementList)

    } catch (error) {
      console.error('Error loading analytics:', error)
      confirmationModalRef.current?.show({
        type: 'error',
        title: 'Failed to Load Analytics',
        message: 'There was an error loading your analytics data. Please try again.',
        confirmText: 'Retry',
        showCancel: false,
        onConfirm: () => loadAnalyticsData(true)
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId, selectedPeriod, actions])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  const onRefresh = useCallback(() => {
    loadAnalyticsData(true)
  }, [loadAnalyticsData])

  // Habit Completion Bar Chart Component
  const HabitCompletionChart = () => {
    if (habitData.length === 0) return null

    const maxRate = Math.max(...habitData.map(h => h.completionRate))
    const chartHeight = 200
    const barWidth = (chartWidth - 40) / habitData.length - 10
    
    return (
      <View className="mt-4">
        <Svg width={chartWidth} height={chartHeight + 60}>
          <Defs>
            <LinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#1D4ED8" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = chartHeight - (value / 100) * chartHeight
            return (
              <Line
                key={index}
                x1={20}
                y1={y}
                x2={chartWidth - 20}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            )
          })}
          
          {/* Bars */}
          {habitData.slice(0, 6).map((habit, index) => {
            const x = 30 + index * (barWidth + 10)
            const barHeight = (habit.completionRate / 100) * chartHeight
            const y = chartHeight - barHeight
            
            return (
              <React.Fragment key={habit.habitId}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                  rx="4"
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="10"
                  fill="#374151"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {habit.completionRate.toFixed(0)}%
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 15}
                  fontSize="9"
                  fill="#6B7280"
                  textAnchor="middle"
                >
                  {habit.habitTitle.length > 8 
                    ? habit.habitTitle.substring(0, 8) + '...' 
                    : habit.habitTitle}
                </SvgText>
              </React.Fragment>
            )
          })}
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = chartHeight - (value / 100) * chartHeight + 3
            return (
              <SvgText
                key={index}
                x={15}
                y={y}
                fontSize="10"
                fill="#6B7280"
                textAnchor="end"
              >
                {value}%
              </SvgText>
            )
          })}
        </Svg>
      </View>
    )
  }

  // Mood Distribution Pie Chart Component
  const MoodPieChart = () => {
    if (moodData.length === 0) return null

    const centerX = chartWidth / 2
    const centerY = 120
    const radius = 80
    let currentAngle = 0

    const createPath = (startAngle: number, endAngle: number) => {
      const x1 = centerX + radius * Math.cos(startAngle)
      const y1 = centerY + radius * Math.sin(startAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)
      
      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0
      
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    }

    return (
      <View className="mt-4">
        <Svg width={chartWidth} height={300}>
          {moodData.map((mood, index) => {
            const sliceAngle = (mood.percentage / 100) * 2 * Math.PI
            const startAngle = currentAngle
            const endAngle = currentAngle + sliceAngle
            
            const path = createPath(startAngle, endAngle)
            
            // Calculate label position
            const labelAngle = startAngle + sliceAngle / 2
            const labelX = centerX + (radius + 30) * Math.cos(labelAngle)
            const labelY = centerY + (radius + 30) * Math.sin(labelAngle)
            
            currentAngle += sliceAngle
            
            return (
              <React.Fragment key={mood.mood}>
                <Path
                  d={path}
                  fill={mood.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                {mood.percentage > 5 && (
                  <>
                    <SvgText
                      x={labelX}
                      y={labelY - 5}
                      fontSize="10"
                      fill="#374151"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {mood.mood}
                    </SvgText>
                    <SvgText
                      x={labelX}
                      y={labelY + 8}
                      fontSize="8"
                      fill="#6B7280"
                      textAnchor="middle"
                    >
                      {mood.percentage.toFixed(1)}%
                    </SvgText>
                  </>
                )}
              </React.Fragment>
            )
          })}
        </Svg>
      </View>
    )
  }

  // Weekly Progress Line Chart Component
  const WeeklyProgressChart = () => {
    if (weeklyData.length === 0) return null

    const chartHeight = 150
    const maxRate = Math.max(...weeklyData.map(w => w.rate), 100)
    const stepX = (chartWidth - 60) / (weeklyData.length - 1)

    const points = weeklyData.map((week, index) => {
      const x = 30 + index * stepX
      const y = chartHeight - (week.rate / maxRate) * chartHeight
      return { x, y, week }
    })

    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${path} ${command} ${point.x} ${point.y}`
    }, '')

    return (
      <View className="mt-4">
        <Svg width={chartWidth} height={chartHeight + 40}>
          <Defs>
            <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = chartHeight - (value / maxRate) * chartHeight
            return (
              <Line
                key={index}
                x1={20}
                y1={y}
                x2={chartWidth - 20}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            )
          })}
          
          {/* Line path */}
          <Path
            d={pathData}
            stroke="url(#lineGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#10B981"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          ))}
          
          {/* Week labels */}
          {points.map((point, index) => (
            <SvgText
              key={index}
              x={point.x}
              y={chartHeight + 15}
              fontSize="9"
              fill="#6B7280"
              textAnchor="middle"
            >
              {point.week.week}
            </SvgText>
          ))}
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = chartHeight - (value / maxRate) * chartHeight + 3
            return (
              <SvgText
                key={index}
                x={15}
                y={y}
                fontSize="10"
                fill="#6B7280"
                textAnchor="end"
              >
                {value}%
              </SvgText>
            )
          })}
        </Svg>
      </View>
    )
  }

  if (!userId) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
            Please log in to view your analytics
          </Text>
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <ScrollView 
        className="flex-1 bg-gray-50 dark:bg-gray-950"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 py-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Analytics Report
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Your habit & mood insights
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
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
          </View>

          {/* Period Selector */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Time Period
              </Text>
              <View className="flex-row gap-2">
                {(['7d', '30d', '90d'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-full ${
                      selectedPeriod === period 
                        ? 'bg-primary' 
                        : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                  >
                    <Text className={`font-medium ${
                      selectedPeriod === period 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {period === '7d' ? 'Last 7 Days' : 
                       period === '30d' ? 'Last 30 Days' : 
                       'Last 90 Days'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </CardContent>
          </Card>

          {loading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-600 dark:text-gray-400 mt-4">
                Loading analytics...
              </Text>
            </View>
          ) : (
            <>
              {/* HABITS SECTION */}
              {/* Habit Completion Chart */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <View className="flex-row items-center mb-2">
                    <BarChart3 size={20} className="text-primary mr-2" />
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      Habit Completion Rates
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Success rates for your top habits
                  </Text>
                  {habitData.length > 0 ? (
                    <HabitCompletionChart />
                  ) : (
                    <View className="py-8 items-center">
                      <Target size={32} className="text-gray-400 mb-2" />
                      <Text className="text-gray-500 text-center">
                        No habit data available for this period
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Progress Trend */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <View className="flex-row items-center mb-2">
                    <TrendingUp size={20} className="text-green-500 mr-2" />
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      Weekly Progress Trend
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your consistency over time
                  </Text>
                  {weeklyData.length > 0 ? (
                    <WeeklyProgressChart />
                  ) : (
                    <View className="py-8 items-center">
                      <Activity size={32} className="text-gray-400 mb-2" />
                      <Text className="text-gray-500 text-center">
                        No trend data available yet
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>

              {/* Habit Summary Stats */}
              <Card className="mb-8">
                <CardContent className="p-4">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Habit Statistics
                  </Text>
                  
                  <View className="grid grid-cols-2 gap-4">
                    <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {habitData.reduce((sum, h) => sum + h.completedDays, 0)}
                      </Text>
                      <Text className="text-xs text-blue-600 dark:text-blue-400">
                        Total Completions
                      </Text>
                    </View>
                    
                    <View className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {habitData.length > 0 
                          ? (habitData.reduce((sum, h) => sum + h.completionRate, 0) / habitData.length).toFixed(1)
                          : 0}%
                      </Text>
                      <Text className="text-xs text-green-600 dark:text-green-400">
                        Avg Success Rate
                      </Text>
                    </View>
                    
                    <View className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {habitData.length > 0 ? Math.max(...habitData.map(h => h.streak), 0) : 0}
                      </Text>
                      <Text className="text-xs text-purple-600 dark:text-purple-400">
                        Longest Streak
                      </Text>
                    </View>
                    
                    <View className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {habitData.length}
                      </Text>
                      <Text className="text-xs text-indigo-600 dark:text-indigo-400">
                        Active Habits
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>

              {/* MOODS SECTION */}
              {/* Mood Distribution */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <View className="flex-row items-center mb-2">
                    <PieChart size={20} className="text-purple-500 mr-2" />
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      Mood Distribution
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your emotional patterns
                  </Text>
                  {moodData.length > 0 ? (
                    <MoodPieChart />
                  ) : (
                    <View className="py-8 items-center">
                      <Calendar size={32} className="text-gray-400 mb-2" />
                      <Text className="text-gray-500 text-center">
                        No mood data available for this period
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>

              {/* Mood Stats */}
              <Card className="mb-8">
                <CardContent className="p-4">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Mood Insights
                  </Text>
                  
                  <View className="grid grid-cols-2 gap-4">
                    <View className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {moodData.reduce((sum, m) => sum + m.count, 0)}
                      </Text>
                      <Text className="text-xs text-yellow-600 dark:text-yellow-400">
                        Total Entries
                      </Text>
                    </View>
                    
                    <View className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
                      <Text className="text-xl font-bold text-pink-600 dark:text-pink-400">
                        {moodData.length > 0 ? moodData[0].mood : 'N/A'}
                      </Text>
                      <Text className="text-xs text-pink-600 dark:text-pink-400">
                        Most Common
                      </Text>
                    </View>
                    
                    <View className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {moodData.length}
                      </Text>
                      <Text className="text-xs text-teal-600 dark:text-teal-400">
                        Unique Moods
                      </Text>
                    </View>
                    
                    <View className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg">
                      <Text className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        {moodData.length > 0 ? moodData[0].percentage.toFixed(1) : 0}%
                      </Text>
                      <Text className="text-xs text-rose-600 dark:text-rose-400">
                        Top Mood Share
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>

              {/* ACHIEVEMENTS SECTION */}
              {achievementData.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <View className="flex-row items-center mb-2">
                      <Award size={20} className="text-gold-500 mr-2" />
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Achievements
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Your latest accomplishments
                    </Text>
                    
                    <View className="space-y-3">
                      {achievementData.slice(0, 5).map((achievement) => (
                        <View 
                          key={achievement.id}
                          className="flex-row items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                        >
                          <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 items-center justify-center mr-3">
                            <Text className="text-lg">{achievement.icon}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="font-semibold text-amber-900 dark:text-amber-100">
                              {achievement.title}
                            </Text>
                            <Text className="text-sm text-amber-700 dark:text-amber-300">
                              {achievement.description}
                            </Text>
                            <Text className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              {format(achievement.achievedAt, 'MMM d, yyyy')}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                    
                    {achievementData.length > 5 && (
                      <View className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
                          +{achievementData.length - 5} more achievements
                        </Text>
                      </View>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal ref={confirmationModalRef} />
    </Container>
  )
}
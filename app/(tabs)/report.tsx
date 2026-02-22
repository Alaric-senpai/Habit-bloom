import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useAuth, useActions } from '@/contexts/HabitBloomGlobalContext'
import { subDays } from 'date-fns'
import Container from '@/components/Container'

export default function ReportPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCompletions: 0,
    avgRate: 0,
    topStreak: 0,
    activeHabits: 0,
    topMood: 'N/A',
    moodEntries: 0
  })
  const [habits, setHabits] = useState<Array<{ title: string; rate: number }>>([])

  const { auth } = useAuth()
  const actions = useActions()
  const userId = auth?.user?.id

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const now = new Date()
      const startDate = subDays(now, 30)
      
      const allHabits = await actions.habit.getHabits(userId, true)
      const logs = await actions.habitLog.getLogsByDateRange(userId, startDate, now)
      const moods = await actions.mood.getMoodsByDateRange(userId, startDate, now)
      
      const habitStats = allHabits.map(habit => {
        const habitLogs = logs.filter(log => log.habitId === habit.id)
        const completed = habitLogs.filter(log => log.status === 'completed').length
        const rate = (completed / 30) * 100
        
        let streak = 0
        const sorted = habitLogs.sort((a, b) => 
          new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
        )
        for (const log of sorted) {
          if (log.status === 'completed') streak++
          else break
        }
        
        return { title: habit.title, rate, completed, streak }
      })
      
      const totalCompletions = habitStats.reduce((sum, h) => sum + h.completed, 0)
      const avgRate = habitStats.length > 0 
        ? habitStats.reduce((sum, h) => sum + h.rate, 0) / habitStats.length 
        : 0
      const topStreak = habitStats.length > 0 
        ? Math.max(...habitStats.map(h => h.streak)) 
        : 0
      
      const moodCounts: Record<string, number> = {}
      moods.forEach(m => {
        const label = m.moodLabel || 'Neutral'
        moodCounts[label] = (moodCounts[label] || 0) + 1
      })
      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      
      setStats({
        totalCompletions,
        avgRate: Math.round(avgRate),
        topStreak,
        activeHabits: allHabits.length,
        topMood,
        moodEntries: moods.length
      })
      
      setHabits(habitStats.map(h => ({ title: h.title, rate: Math.round(h.rate) })))
      
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground">Login to view report</Text>
        </View>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <FlatList
        data={habits}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        className="flex-1 pb-12"
        contentContainerClassName="p-5"
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-bold text-foreground mb-1">Report</Text>
            <Text className="text-sm text-muted-foreground mb-6">Last 30 days</Text>
            
            <View className="flex-row flex-wrap gap-3 mb-6">
              <View className="flex-1 min-w-[45%] bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-foreground">{stats.totalCompletions}</Text>
                <Text className="text-xs text-muted-foreground">Completions</Text>
              </View>
              
              <View className="flex-1 min-w-[45%] bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-foreground">{stats.avgRate}%</Text>
                <Text className="text-xs text-muted-foreground">Avg Rate</Text>
              </View>
              
              <View className="flex-1 min-w-[45%] bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-foreground">{stats.topStreak}</Text>
                <Text className="text-xs text-muted-foreground">Top Streak</Text>
              </View>
              
              <View className="flex-1 min-w-[45%] bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-foreground">{stats.activeHabits}</Text>
                <Text className="text-xs text-muted-foreground">Habits</Text>
              </View>
              
              <View className="flex-1 min-w-[45%] bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-foreground">{stats.topMood}</Text>
                <Text className="text-xs text-muted-foreground">Top Mood</Text>
              </View>
              
              <View className="flex-1 min-w-[45%] bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-foreground">{stats.moodEntries}</Text>
                <Text className="text-xs text-muted-foreground">Mood Logs</Text>
              </View>
            </View>
            
            <Text className="text-lg font-semibold text-foreground mb-3">Habits</Text>
          </>
        }
        renderItem={({ item }) => (
          <View className="bg-card p-4 rounded-lg border border-border mb-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-medium flex-1">{item.title}</Text>
              <Text className="text-foreground font-bold">{item.rate}%</Text>
            </View>
            <View className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <View 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${item.rate}%` }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-muted-foreground text-center py-8">No habits tracked</Text>
        }
      />
    </Container>
  )
}
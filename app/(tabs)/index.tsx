import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import Container from '@/components/Container'
import { Bell, Plus, Target } from 'lucide-react-native'
import { useActions, useAuth } from '@/contexts/HabitBloomGlobalContext'
import type { HabitSchemaType } from '@/types'
import HabitCard from '@/components/cards/HabitCard'
import AddHabitFormReusableModal from '@/components/AddHabitFormReusableModal'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'
import { router } from 'expo-router'
import ThemeToggle from '@/components/ui/theme-toggle'

export default function HomeScreen() {
  const { auth } = useAuth()
  const actions = useActions()
  const modalRef = useRef<ConfirmationModalRef>(null)

  const [todayHabits, setTodayHabits] = useState<HabitSchemaType[]>([])
  const [stats, setStats] = useState({ completed: 0, total: 0 })
  const [refreshing, setRefreshing] = useState(false)

  const user = auth?.user
  const userName = user?.name?.trim().split(" ")[0] || 'User'
  const userId = user?.id

  const loadData = useCallback(async () => {
    if (!userId) return

    try {
      const allHabits = await actions.habit.getHabits(userId, false)
      const activeHabits = allHabits.filter(h => !h.isArchived && !h.isPaused)
      setTodayHabits(activeHabits as any)

      const logs = await actions.habitLog.getTodaysLogs(userId)
      const completed = logs.filter(log => log.status === 'completed').length

      setStats({
        completed,
        total: activeHabits.length
      })
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [userId, actions])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  useEffect(() => {
    if (userId) loadData()
  }, [userId, loadData])

  return (
    <Container>
      <ScrollView 
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className='px-5 pt-6 pb-4'>
          <View className='flex-row items-center justify-between mb-6'>
            <View>
              <Text className='text-foreground text-2xl font-bold'>
                Hi, {userName} 👋
              </Text>
              <Text className='text-muted-foreground text-sm mt-1'>
                {stats.completed} of {stats.total} completed
              </Text>
            </View>
            
            <View className='flex-row gap-2'>
              <Pressable 
                className='w-10 h-10 rounded-full bg-card border border-border items-center justify-center'
                onPress={() => router.push('/settings/notifications')}
              >
                <Bell size={18} color='hsl(165, 75%, 45%)' />
              </Pressable>

              <ThemeToggle />
              
              <AddHabitFormReusableModal
                buttonText=""
                buttonClassName="w-10 h-10 rounded-full bg-primary items-center justify-center"
                buttonIcon={<Plus size={20} color='white' />}
                confirmationModalRef={modalRef}
                formProps={{
                  onSuccess: loadData,
                  submitButtonText: "Create"
                }}
              />
            </View>
          </View>
        </View>

        {/* Habits List */}
        <View className='px-5'>
          {todayHabits.length === 0 ? (
            <View className='bg-card rounded-2xl p-8 border border-dashed border-border items-center'>
              <Target size={40} color='hsl(165, 75%, 45%)' />
              <Text className='text-foreground font-semibold mt-4 mb-2'>
                No habits yet
              </Text>
              <Text className='text-muted-foreground text-sm text-center mb-4'>
                Create your first habit to get started
              </Text>
              <AddHabitFormReusableModal
                buttonText="Create Habit"
                buttonClassName="bg-primary px-6 py-3 rounded-xl flex-row items-center gap-2"
                buttonIcon={<Plus size={18} color='white' />}
                confirmationModalRef={modalRef}
                formProps={{
                  onSuccess: loadData,
                  submitButtonText: "Create"
                }}
              />
            </View>
          ) : (
            <View className='gap-3'>
              {todayHabits.map((habit) => (
                <HabitCard 
                  key={habit.id}
                  habit={habit} 
                  onDataChange={loadData} 
                  userId={userId!} 
                />
              ))}
            </View>
          )}
        </View>


      </ScrollView>
      
      <ConfirmationModal ref={modalRef} />
    </Container>
  )
}

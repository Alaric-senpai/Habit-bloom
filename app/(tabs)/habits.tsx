import { View, Text, Alert, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import Container from '@/components/Container'
import { Logo } from '@/constants/images'
import { Image } from 'expo-image'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Award, MoreVertical, Target, Plus, ListChecks } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useActions, useAuth } from '@/contexts/HabitBloomGlobalContext'
import storage from '@/lib/storage/mmkv'
import { HabitSchemaType } from '@/types'
import { FlatList } from 'react-native'
import HabitCard from '@/components/cards/HabitCard'
import AddHabitFormReusableModal from '@/components/AddHabitFormReusableModal'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'

export default function MyHabits() {
  const [habits, setHabits] = useState<HabitSchemaType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const insets = useSafeAreaInsets()
  const contentInsets = {
    top: insets.top,
    right: insets.right
  }

  const router = useRouter()
  const { auth } = useAuth()
  const actions = useActions()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null)
  
  const userId = auth?.user?.id


  const loadHabits = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const userid = storage.getUserID()
      if (!userid) {
        confirmationModalRef.current?.show({
          type: 'error',
          title: 'Authentication Error',
          message: 'Please log in again to view your habits.',
          confirmText: 'Login',
          showCancel: false,
          onConfirm: () => {
            router.push('/(auth)/login')
          }
        })
        return
      }

      const allHabits = await actions.habit.getHabits(parseInt(userId), true)
      console.log(allHabits)
      setHabits(allHabits as HabitSchemaType[])

    } catch (error) {
      console.error('Error fetching habits:', error)
      confirmationModalRef.current?.show({
        type: 'error',
        title: 'Failed to Load Habits',
        message: 'There was an error loading your habits. Please try again.',
        confirmText: 'Retry',
        cancelText: 'Cancel',
        showCancel: true,
        onConfirm: () => loadHabits(true)
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [actions.habit, router])

  const onRefresh = useCallback(() => {
    loadHabits(true)
  }, [loadHabits])

  const handleHabitSuccess = useCallback(async (habit: any) => {
    console.log('New habit created:', habit)
    await loadHabits(true) // Refresh the habits list
  }, [loadHabits])

  // Load habits on component mount
  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // Don't render if no user is authenticated
  if (!userId) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
            Please log in to view your habits
          </Text>
        </View>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <View className="px-5 py-2 flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Image source={Logo} style={{width: 40, height: 40}} className="mr-3" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
            My Habits
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <AddHabitFormReusableModal
            buttonText=""
            buttonClassName="bg-primary rounded-full p-3"
            buttonIcon={<Plus size={20} color="white" />}
            confirmationModalRef={confirmationModalRef}
            formProps={{
              onSuccess: handleHabitSuccess,
              submitButtonText: "Create Habit"
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <View className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                <MoreVertical size={20} className="text-gray-700 dark:text-gray-300" />
              </View>
            </DropdownMenuTrigger>
            <DropdownMenuContent insets={contentInsets} sideOffset={2} className="w-48" align="end">
              <DropdownMenuItem onPress={() => router.push('/goals' as any)}>
                <View className="flex-row items-center space-x-2">
                  <Target size={16} className="text-gray-600" />
                  <Text className="text-sm text-gray-900">Goals</Text>
                </View>
              </DropdownMenuItem>
              <DropdownMenuItem onPress={() => router.push('/achievements' as any)}>
                <View className="flex-row items-center space-x-2">
                  <Award size={16} className="text-gray-600" />
                  <Text className="text-sm text-gray-900">Achievements</Text>
                </View>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 dark:text-gray-400 mt-4 text-center">
            Loading your habits...
          </Text>
        </View>
      ) : habits.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <ListChecks size={64} className="text-gray-400 mb-4" />
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            No Habits Yet
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-6">
            Start building better habits today! Create your first habit and begin your journey to a better you.
          </Text>
          <AddHabitFormReusableModal
            buttonText="Create Your First Habit"
            buttonClassName="bg-primary px-6 py-3 rounded-full flex-row items-center gap-2"
            confirmationModalRef={confirmationModalRef}
            formProps={{
              onSuccess: handleHabitSuccess,
              submitButtonText: "Create My First Habit"
            }}
          />
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <View className="px-5 mb-3">
              <HabitCard 
                habit={item} 
                userId={userId} 
                onDataChange={() => loadHabits()}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal ref={confirmationModalRef} />
    </Container>
  )
}
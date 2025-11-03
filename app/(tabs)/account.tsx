import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native'
import React, { useState, useCallback, useRef } from 'react'
import { router } from 'expo-router'
import { ArrowLeft, User, Mail, Clock, Calendar, Award, TrendingUp, Edit2, LogOut, Trash2, Save, ChevronRight, Target, PersonStanding, BellDotIcon, LockIcon, LogOutIcon, UserCog2Icon } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth, useActions } from '@/contexts/HabitBloomGlobalContext'
import { Image } from 'expo-image'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'
import ProfileLink from '@/components/ProfileLink'

export default function AccountScreen() {
  const insets = useSafeAreaInsets()
  const { auth, logout } = useAuth()
  const actions = useActions()
  const user = auth?.user

  const modalRef = useRef<ConfirmationModalRef>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)

  // Handle save profile
  const handleSave = useCallback(async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      await actions.user.updateAccount(user.id, {
        name: name.trim(),
        bio: bio.trim(),
      })
      modalRef.current?.show({
        type: 'success',
        title: 'Update succcessfull',
        message: 'Profile updated successfully'
      })
      setIsEditing(false)
      
    } catch (error) {
      modalRef.current?.show({
        type: 'error',
        title: 'Update failed',
        message: 'Profile update failed'
      })
    } finally {
      setSaving(false)
    }
  }, [user, name, bio, actions])

  // Handle logout
  const handleLogout = useCallback(() => {
        modalRef.current?.show({
        type: 'confirmation',
        title: 'Logout',
        message: 'Are yous sure you want to logout',
        confirmText: 'Logout',
        onConfirm: async()=>{
          await logout()
          router.replace('/(auth)/login')
        },
        cancelText: 'Stay logged in',
        danger: true
      })
  }, [logout])

  // Handle delete account
  const handleDeleteAccount = useCallback(() => {
      modalRef.current?.show({
        type: 'confirmation',
        title: 'Logout',
        message: 'Are yous sure you want to logout',
        confirmText: 'Logout',
        onConfirm: async () => {
                    if (!user?.id) return
                    try {
                      await actions.user.deleteAccount(user.id)
                      router.replace('/(auth)/login')
                    } catch (error) {
                      // console.error('Error deleting account:', error)
                            modalRef.current?.show({
                              type: 'error',
                              title: 'Update failed',
                              message: 'Profile update failed'
                            })
                    }
                  },
        cancelText: 'Stay in Habit bloom',
        danger: true
      })

  }, [user, actions])

  if (!user) {
    return (
      <View className='flex-1 bg-white dark:bg-gray-900 items-center justify-center'>
        <Text className='text-gray-600 dark:text-gray-400'>Not logged in</Text>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-white dark:bg-gray-900' style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className='px-6 py-4 border-b border-gray-200 dark:border-gray-800'>
        <View className='flex-row items-center justify-between'>
          <TouchableOpacity onPress={() => router.back()} className='p-2'>
            <ArrowLeft size={24} className='text-gray-900 dark:text-white' />
          </TouchableOpacity>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
            Account
          </Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)} className='p-2'>
              <Edit2 size={20} className='text-gray-700 dark:text-gray-300' />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSave} disabled={saving} className='p-2'>
              <Save size={20} className='text-blue-600' />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className='px-6 py-8 items-center border-b border-gray-200 dark:border-gray-800'>
          <View className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mb-4'>
            {user.avatarUrl?.trim() !== "" ? (
              <Image source={{ uri: user.avatarUrl }} style={{ width: 96, height: 96 }} className='rounded-full bg-slate-950' />
            ) : (
              <Text className='text-4xl font-bold text-white'>
                {user.name?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          

          {isEditing ? (
            <View className='w-full space-y-3'>
              <View>
                <Text className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder='Your name'
                  className='w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white'
                  placeholderTextColor='#9ca3af'
                />
              </View>
              <View>
                <Text className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Bio
                </Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder='Tell us about yourself'
                  multiline
                  numberOfLines={3}
                  className='w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white'
                  placeholderTextColor='#9ca3af'
                  textAlignVertical='top'
                />
              </View>
            </View>
          ) : (
            <>
              <Text className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                {user.name}
              </Text>
              {user.bio && (
                <Text className='text-gray-600 dark:text-gray-400 text-center px-6'>
                  {user.bio}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Account Info */}
        <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Account Information
          </Text>
          <View className='space-y-4'>
            <View className='flex-row items-center'>
              <View className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 items-center justify-center mr-3'>
                <Mail size={18} className='text-blue-600 dark:text-blue-400' />
              </View>
              <View className='flex-1'>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>Email</Text>
                <Text className='text-gray-900 dark:text-white font-medium'>{user.email}</Text>
              </View>
            </View>

            <View className='flex-row items-center'>
              <View className='w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center mr-3'>
                <Calendar size={18} className='text-green-600 dark:text-green-400' />
              </View>
              <View className='flex-1'>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>Member Since</Text>
                <Text className='text-gray-900 dark:text-white font-medium'>
                  {user.joinedAt
                    ? new Date(user.joinedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </Text>
              </View>
            </View>

            <View className='flex-row items-center'>
              <View className='w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 items-center justify-center mr-3'>
                <Clock size={18} className='text-purple-600 dark:text-purple-400' />
              </View>
              <View className='flex-1'>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>Timezone</Text>
                <Text className='text-gray-900 dark:text-white font-medium'>
                  {user.timezone || 'UTC'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Your Progress
          </Text>
          <View className='flex-row flex-wrap gap-3'>
            <View className='flex-1 min-w-[45%] bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4'>
              <Target size={20} className='text-blue-600 dark:text-blue-400 mb-2' />
              <Text className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {user.totalHabitsCreated || 0}
              </Text>
              <Text className='text-sm text-blue-700 dark:text-blue-300'>Habits Created</Text>
            </View>
            <View className='flex-1 min-w-[45%] bg-green-50 dark:bg-green-900/20 rounded-xl p-4'>
              <Award size={20} className='text-green-600 dark:text-green-400 mb-2' />
              <Text className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {user.totalCompletions || 0}
              </Text>
              <Text className='text-sm text-green-700 dark:text-green-300'>Total Completions</Text>
            </View>
            <View className='flex-1 min-w-[45%] bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4'>
              <TrendingUp size={20} className='text-orange-600 dark:text-orange-400 mb-2' />
              <Text className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                {user.streakCurrent || 0}
              </Text>
              <Text className='text-sm text-orange-700 dark:text-orange-300'>Current Streak</Text>
            </View>
            <View className='flex-1 min-w-[45%] bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4'>
              <Award size={20} className='text-purple-600 dark:text-purple-400 mb-2' />
              <Text className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {user.streakLongest || 0}
              </Text>
              <Text className='text-sm text-purple-700 dark:text-purple-300'>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className='px-6 py-6'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Settings
          </Text>
          <View>
            <ProfileLink 
              key="preferences"
              label='Preferences' 
              description='Customize your in app experience' 
              onPress={() => router.push('/settings/preferences')} 
              icon={<PersonStanding size={20} color="#6B7280" />} 
            />
            <ProfileLink 
              key="notifications"
              label='Notifications' 
              description='See your recent notifications' 
              onPress={() => router.push('/settings/notifications')} 
              icon={<BellDotIcon size={20} color="#3B82F6" />} 
            />
            <ProfileLink 
              key="security"
              label='Security' 
              description='How secure is your account' 
              onPress={() => router.push('/settings/security')} 
              icon={<LockIcon size={20} color="#10B981" />} 
            />
            <ProfileLink 
              key="logout"
              label='Logout' 
              variant='warning'  
              onPress={handleLogout} 
              icon={<LogOutIcon size={20} color="#D97706" />} 
            />
            <ProfileLink 
              key="delete"
              label='Delete account' 
              variant='danger' 
              onPress={handleDeleteAccount} 
              icon={<UserCog2Icon size={20} color="#DC2626" />} 
            />
          </View>
        </View>
          <ConfirmationModal ref={modalRef} />
        <View className='h-12' />
      </ScrollView>
    </View>
  )
}
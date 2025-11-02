import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { router } from 'expo-router'
import { ArrowLeft, Moon, Sun, Bell, Calendar, Zap, Globe, Database } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth, useActions } from '@/contexts/HabitBloomGlobalContext'
import storage from '@/lib/storage/mmkv'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets()
  const { auth } = useAuth()
  const actions = useActions()
  const userId = auth?.user?.id
  const confirmationModalRef = useRef<ConfirmationModalRef>(null)

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  
  // Features
  const [calendarSync, setCalendarSync] = useState(false)
  const [hapticsEnabled, setHapticsEnabled] = useState(true)
  const [autoBackup, setAutoBackup] = useState(false)
  
  // Data
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load from storage
        const darkMode = await storage.getBoolean('darkMode')
        const haptics = await storage.getBoolean('hapticsEnabled')
        const sound = await storage.getBoolean('soundEnabled')
        const vibration = await storage.getBoolean('vibrationEnabled')
        const calendar = await storage.getBoolean('calendarSync')
        const backup = await storage.getBoolean('autoBackup')
        const analytics = await storage.getBoolean('analyticsEnabled')

        if (darkMode !== null) setIsDarkMode(darkMode)
        if (haptics !== null) setHapticsEnabled(haptics)
        if (sound !== null) setSoundEnabled(sound)
        if (vibration !== null) setVibrationEnabled(vibration)
        if (calendar !== null) setCalendarSync(calendar)
        if (backup !== null) setAutoBackup(backup)
        if (analytics !== null) setAnalyticsEnabled(analytics)

        // Load notifications from user
        if (auth?.user?.notificationsEnabled !== undefined) {
          setNotificationsEnabled(auth.user.notificationsEnabled)
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }

    loadPreferences()
  }, [auth])

  // Toggle theme
  const handleToggleTheme = useCallback(async () => {
    const newValue = !isDarkMode
    setIsDarkMode(newValue)
    await storage.set('darkMode', newValue)
    
    if (userId) {
      try {
        await actions.user.updateTheme(userId, newValue ? 'dark' : 'light')
      } catch (error) {
        console.error('Error updating theme:', error)
      }
    }
  }, [isDarkMode, userId, actions])

  // Toggle notifications
  const handleToggleNotifications = useCallback(async () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(newValue)
    
    if (userId) {
      try {
        await actions.user.toggleNotifications(userId, newValue)
        confirmationModalRef.current?.show({
          type: 'success',
          title: 'Success',
          message: `Notifications ${newValue ? 'enabled' : 'disabled'}`,
          confirmText: 'OK',
          showCancel: false
        })
      } catch (error) {
        console.error('Error toggling notifications:', error)
        confirmationModalRef.current?.show({
          type: 'error',
          title: 'Error',
          message: 'Failed to update notification settings',
          confirmText: 'OK',
          showCancel: false
        })
      }
    }
  }, [notificationsEnabled, userId, actions])

  // Toggle sound
  const handleToggleSound = useCallback(async () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    await storage.set('soundEnabled', newValue)
  }, [soundEnabled])

  // Toggle vibration
  const handleToggleVibration = useCallback(async () => {
    const newValue = !vibrationEnabled
    setVibrationEnabled(newValue)
    await storage.set('vibrationEnabled', newValue)
  }, [vibrationEnabled])

  // Toggle haptics
  const handleToggleHaptics = useCallback(async () => {
    const newValue = !hapticsEnabled
    setHapticsEnabled(newValue)
    await storage.set('hapticsEnabled', newValue)
  }, [hapticsEnabled])

  // Toggle calendar sync
  const handleToggleCalendar = useCallback(async () => {
    const newValue = !calendarSync
    setCalendarSync(newValue)
    await storage.set('calendarSync', newValue)
    confirmationModalRef.current?.show({
      type: 'info',
      title: 'Calendar Sync',
      message: newValue ? 'Calendar sync enabled' : 'Calendar sync disabled',
      confirmText: 'OK',
      showCancel: false
    })
  }, [calendarSync])

  // Toggle auto backup
  const handleToggleAutoBackup = useCallback(async () => {
    const newValue = !autoBackup
    setAutoBackup(newValue)
    await storage.set('autoBackup', newValue)
    confirmationModalRef.current?.show({
      type: 'info',
      title: 'Auto Backup',
      message: newValue ? 'Auto backup enabled' : 'Auto backup disabled',
      confirmText: 'OK',
      showCancel: false
    })
  }, [autoBackup])

  // Toggle analytics
  const handleToggleAnalytics = useCallback(async () => {
    const newValue = !analyticsEnabled
    setAnalyticsEnabled(newValue)
    await storage.set('analyticsEnabled', newValue)
  }, [analyticsEnabled])

  return (
    <View className='flex-1 bg-white dark:bg-gray-900' style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className='px-6 py-4 border-b border-gray-200 dark:border-gray-800'>
        <View className='flex-row items-center'>
          <TouchableOpacity onPress={() => router.back()} className='p-2 mr-2'>
            <ArrowLeft size={24} className='text-gray-900 dark:text-white' />
          </TouchableOpacity>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
            Preferences
          </Text>
        </View>
      </View>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
          <View className='flex-row items-center mb-4'>
            <View className='w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 items-center justify-center mr-3'>
              {isDarkMode ? (
                <Moon size={18} className='text-purple-600 dark:text-purple-400' />
              ) : (
                <Sun size={18} className='text-purple-600 dark:text-purple-400' />
              )}
            </View>
            <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
              Appearance
            </Text>
          </View>

          <View className='space-y-4'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>Dark Mode</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Use dark theme throughout the app
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
              />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
          <View className='flex-row items-center mb-4'>
            <View className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 items-center justify-center mr-3'>
              <Bell size={18} className='text-blue-600 dark:text-blue-400' />
            </View>
            <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
              Notifications
            </Text>
          </View>

          <View className='space-y-4'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>
                  Enable Notifications
                </Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Receive habit reminders and updates
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
              />
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>Sound</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Play sound for notifications
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
                disabled={!notificationsEnabled}
              />
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>Vibration</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Vibrate for notifications
                </Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={handleToggleVibration}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
                disabled={!notificationsEnabled}
              />
            </View>
          </View>
        </View>

        {/* Features */}
        <View className='px-6 py-6 border-b border-gray-200 dark:border-gray-800'>
          <View className='flex-row items-center mb-4'>
            <View className='w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center mr-3'>
              <Zap size={18} className='text-green-600 dark:text-green-400' />
            </View>
            <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
              Features
            </Text>
          </View>

          <View className='space-y-4'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>Haptic Feedback</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Feel vibrations for actions
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
              />
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>Calendar Sync</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Sync habits to device calendar
                </Text>
              </View>
              <Switch
                value={calendarSync}
                onValueChange={handleToggleCalendar}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
              />
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>Auto Backup</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Automatically backup your data
                </Text>
              </View>
              <Switch
                value={autoBackup}
                onValueChange={handleToggleAutoBackup}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
              />
            </View>
          </View>
        </View>

        {/* Privacy */}
        <View className='px-6 py-6'>
          <View className='flex-row items-center mb-4'>
            <View className='w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 items-center justify-center mr-3'>
              <Database size={18} className='text-orange-600 dark:text-orange-400' />
            </View>
            <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
              Privacy & Data
            </Text>
          </View>

          <View className='space-y-4'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-gray-900 dark:text-white font-medium'>Analytics</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  Help improve the app with usage data
                </Text>
              </View>
              <Switch
                value={analyticsEnabled}
                onValueChange={handleToggleAnalytics}
                trackColor={{ false: '#d1d5db', true: '#2196F3' }}
                thumbColor='#ffffff'
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/settings/data-export' as any)}
              className='flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl'
            >
              <Text className='text-gray-900 dark:text-white font-medium'>Export Data</Text>
              <Text className='text-gray-400'>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/settings/data-import' as any)}
              className='flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl'
            >
              <Text className='text-gray-900 dark:text-white font-medium'>Import Data</Text>
              <Text className='text-gray-400'>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className='h-12' />
      </ScrollView>
      
      <ConfirmationModal ref={confirmationModalRef} />
    </View>
  )
}
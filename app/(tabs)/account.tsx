import { View, Text, ScrollView, TouchableOpacity, TextInput, Pressable } from 'react-native'
import React, { useState, useRef } from 'react'
import { router } from 'expo-router'
import { Camera, Mail, Calendar, LogOut, Trash2, Lock } from 'lucide-react-native'
import { useAuth, useActions } from '@/contexts/HabitBloomGlobalContext'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Container from '@/components/Container'

export default function AccountScreen() {
  const { auth, logout } = useAuth()
  const actions = useActions()
  const user = auth?.user

  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && user?.id) {
      try {
        await actions.user.updateAccount(user.id, {
          avatarUrl: result.assets[0].uri
        })
      } catch (error) {
        console.error('Failed to update avatar:', error)
      }
    }
  }

  const handleSaveName = async () => {
    if (!user?.id || !name.trim()) return
    
    setSaving(true)
    try {
      await actions.user.updateAccount(user.id, { name: name.trim() })
    } catch (error) {
      console.error('Failed to update name:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields required')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    try {
      // Add your password change logic here
      // await actions.user.changePassword(user.id, currentPassword, newPassword)
      setPasswordDialog(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError('Failed to change password')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) return
    try {
      await actions.user.deleteAccount(user.id)
      router.replace('/(auth)/login')
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  if (!user) {
    return (
      <Container>
        <View className='flex-1 justify-center items-center'>
          <Text className='text-muted-foreground'>Not logged in</Text>
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <ScrollView 
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerClassName='p-5'
      >
        <Text className='text-2xl font-bold text-foreground mb-6'>Account</Text>

        {/* Profile Picture */}
        <View className='items-center mb-6'>
          <Pressable onPress={handlePickImage} className='relative'>
            <View className='w-24 h-24 rounded-full bg-primary items-center justify-center'>
              {user.avatarUrl ? (
                <Image 
                  source={{ uri: user.avatarUrl }} 
                  style={{ width: 96, height: 96 }} 
                  className='rounded-full'
                />
              ) : (
                <Text className='text-4xl font-bold text-primary-foreground'>
                  {user.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className='absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border-2 border-border items-center justify-center'>
              <Camera size={14} className='text-foreground' />
            </View>
          </Pressable>
        </View>

        {/* Name Edit */}
        <View className='mb-6'>
          <Label>Name</Label>
          <View className='flex-row gap-2'>
            <Input
              value={name}
              onChangeText={setName}
              placeholder='Your name'
              className='flex-1'
            />
            <Button 
              onPress={handleSaveName} 
              disabled={saving || name === user.name}
              size='sm'
            >
              <Text className='text-primary-foreground'>Save</Text>
            </Button>
          </View>
        </View>

        {/* Account Info */}
        <View className='bg-card border border-border rounded-lg p-4 mb-6'>
          <View className='flex-row items-center mb-3'>
            <Mail size={16} className='text-muted-foreground mr-2' />
            <View className='flex-1'>
              <Text className='text-xs text-muted-foreground'>Email</Text>
              <Text className='text-foreground'>{user.email}</Text>
            </View>
          </View>
          
          <View className='flex-row items-center'>
            <Calendar size={16} className='text-muted-foreground mr-2' />
            <View className='flex-1'>
              <Text className='text-xs text-muted-foreground'>Joined</Text>
              <Text className='text-foreground'>
                {user.joinedAt
                  ? new Date(user.joinedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recently'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className='flex-row flex-wrap gap-3 mb-6'>
          <View className='flex-1 min-w-[45%] bg-card border border-border rounded-lg p-3'>
            <Text className='text-2xl font-bold text-foreground'>{user.totalHabitsCreated || 0}</Text>
            <Text className='text-xs text-muted-foreground'>Habits</Text>
          </View>
          <View className='flex-1 min-w-[45%] bg-card border border-border rounded-lg p-3'>
            <Text className='text-2xl font-bold text-foreground'>{user.totalCompletions || 0}</Text>
            <Text className='text-xs text-muted-foreground'>Completions</Text>
          </View>
          <View className='flex-1 min-w-[45%] bg-card border border-border rounded-lg p-3'>
            <Text className='text-2xl font-bold text-foreground'>{user.streakCurrent || 0}</Text>
            <Text className='text-xs text-muted-foreground'>Streak</Text>
          </View>
          <View className='flex-1 min-w-[45%] bg-card border border-border rounded-lg p-3'>
            <Text className='text-2xl font-bold text-foreground'>{user.streakLongest || 0}</Text>
            <Text className='text-xs text-muted-foreground'>Best</Text>
          </View>
        </View>

        {/* Actions */}
        <View className='gap-3'>
          <Pressable 
            onPress={() => setPasswordDialog(true)}
            className='flex-row items-center justify-between bg-card border border-border rounded-lg p-4 active:opacity-70'
          >
            <View className='flex-row items-center gap-3'>
              <Lock size={20} className='text-foreground' />
              <Text className='text-foreground'>Change Password</Text>
            </View>
          </Pressable>

          <Pressable 
            onPress={handleLogout}
            className='flex-row items-center justify-between bg-card border border-border rounded-lg p-4 active:opacity-70'
          >
            <View className='flex-row items-center gap-3'>
              <LogOut size={20} className='text-foreground' />
              <Text className='text-foreground'>Logout</Text>
            </View>
          </Pressable>

          <Pressable 
            onPress={handleDeleteAccount}
            className='flex-row items-center justify-between bg-destructive/10 border border-destructive/20 rounded-lg p-4 active:opacity-70'
          >
            <View className='flex-row items-center gap-3'>
              <Trash2 size={20} className='text-destructive' />
              <Text className='text-destructive'>Delete Account</Text>
            </View>
          </Pressable>
        </View>

        <View className='h-12' />
      </ScrollView>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          
          <View className='gap-4 py-4'>
            <View>
              <Label>Current Password</Label>
              <Input
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder='Enter current password'
              />
            </View>
            
            <View>
              <Label>New Password</Label>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder='Enter new password'
              />
            </View>
            
            <View>
              <Label>Confirm Password</Label>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder='Confirm new password'
              />
            </View>
            
            {passwordError ? (
              <Text className='text-destructive text-sm'>{passwordError}</Text>
            ) : null}
          </View>
          
          <DialogFooter>
            <Button variant='outline' onPress={() => setPasswordDialog(false)}>
              <Text>Cancel</Text>
            </Button>
            <Button onPress={handleChangePassword}>
              <Text className='text-primary-foreground'>Change</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
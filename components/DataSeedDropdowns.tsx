import { View, Text } from 'react-native'
import React, { useCallback, useRef } from 'react'
import { Database, Trash2 } from 'lucide-react-native'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { clearAllData, seedDatabase } from '@/database/seeder/seed'
import ConfirmationModal, { ConfirmationModalRef } from '@/components/modals/ConfirmationModal'

interface DataSeedDropdownsProps {
  userId?: number
  onDataChange?: () => Promise<void>
}

export default function DataSeedDropdowns({ userId, onDataChange }: DataSeedDropdownsProps) {
  const confirmationModalRef = useRef<ConfirmationModalRef>(null)

  // Seeder functions
  const runSeeder = useCallback(async () => {
    if (!userId) {
      confirmationModalRef.current?.show({
        title: 'User error',
        type: 'error',
        message: 'User record could not be found'
      })
      return
    }
    
    confirmationModalRef.current?.show({
      type: 'confirmation',
      title: 'Seed Database',
      message: 'This will add sample data to your account. Continue?',
      confirmText: 'Seed data',
      onConfirm: () => {
        // User confirmed
        const performSeed = async () => {
          try {
            await seedDatabase(userId)

                confirmationModalRef.current?.dismiss()

            if (onDataChange) await onDataChange()
            confirmationModalRef.current?.show({
              type: 'success', 
              title: 'Success', 
              message: 'Database seeded successfully!'
            })
          } catch (error) {
            console.error('Seeding error:', error)
            confirmationModalRef.current?.dismiss()

            confirmationModalRef.current?.show({
              type: 'error', 
              title: 'Error', 
              message: 'Failed to seed database'
            })
          }
        }
        performSeed()
      }
    })
  }, [userId, onDataChange])

  const deleteSeededData = useCallback(async () => {
    if (!userId) {
      confirmationModalRef.current?.show({
        type: 'error', 
        title: 'Error', 
        message: 'User not authenticated'
      })
      return
    }
    
    confirmationModalRef.current?.show({
      type: 'warning',
      title: 'Clear All Data',
      message: 'This will permanently delete ALL data. This action cannot be undone!',
      onConfirm: () => {
        // User confirmed
        const performClear = async () => {
          try {
            await clearAllData()
            if (onDataChange) await onDataChange()
            confirmationModalRef.current?.show({
              type: 'success', 
              title: 'Success', 
              message: 'All data cleared successfully!'
            })
          } catch (error) {
            console.error('Clear data error:', error)
            confirmationModalRef.current?.show({
              type: 'error', 
              title: 'Error', 
              message: 'Failed to clear data'
            })
          }
        }
        performClear()
      },
      confirmText: 'Delete data',
      danger: true
    })
  }, [userId, onDataChange])

  return (
    <>
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

      {/* Confirmation Modal */}
      <ConfirmationModal ref={confirmationModalRef} />
    </>
  )
}
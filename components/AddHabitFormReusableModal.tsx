import { View, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useRef } from 'react'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { Plus } from 'lucide-react-native'
import AddHabitForm, { AddHabitFormProps } from './forms/AddHabitForm'
import { useAuth, useActions } from '@/contexts/HabitBloomGlobalContext'
import ReusableBottomSheet, { ReusableBottomSheetRef } from './modals/ReusableBottomSheet'
import type { ConfirmationModalRef } from './modals/ConfirmationModal'

interface AddHabitFormReusableModalProps {
  // Button customization
  buttonText?: string
  buttonClassName?: string
  buttonIcon?: React.ReactNode
  
  // Form props (optional - will use defaults if not provided)
  formProps?: Partial<Omit<AddHabitFormProps, 'userId' | 'habitActions'>>
  
  // Modal customization
  snapPoints?: string[]
  enableDynamicSizing?: boolean
  
  // Confirmation modal ref
  confirmationModalRef?: React.RefObject<ConfirmationModalRef | null>
}

export default function AddHabitFormReusableModal({
  buttonText = "Add Habit",
  buttonClassName = "flex-row items-center gap-2 bg-blue-500 px-6 py-3 rounded-full",
  buttonIcon,
  formProps = {},
  snapPoints = ['80%', '95%'],
  enableDynamicSizing = false,
  confirmationModalRef
}: AddHabitFormReusableModalProps) {
  const bottomSheetModalRef = useRef<ReusableBottomSheetRef>(null)
  const { auth } = useAuth()
  const actions = useActions()
  
  const userId = auth?.user?.id

  const handlePresentModal = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleDismissModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, [])

  const handleSuccess = useCallback(async (habit: any) => {
    // Show confirmation modal first, then handle dismissal
    if (confirmationModalRef?.current) {
      confirmationModalRef.current.show({
        type: 'success',
        title: 'Habit Created! 🎉',
        message: `Your habit "${habit.title}" has been successfully created and added to your routine.`,
        confirmText: 'Great!',
        showCancel: false,
        onConfirm: async () => {
          // Call the custom onSuccess if provided
          if (formProps.onSuccess) {
            await formProps.onSuccess(habit)
          }
          handleDismissModal()
        }
      })
    } else {
      // Fallback: Call the custom onSuccess and dismiss
      if (formProps.onSuccess) {
        await formProps.onSuccess(habit)
      }
      handleDismissModal()
    }
  }, [formProps.onSuccess, handleDismissModal, confirmationModalRef])

  const handleCancel = useCallback(() => {
    // Show confirmation modal for cancellation to prevent accidental loss
    if (confirmationModalRef?.current) {
      confirmationModalRef.current.show({
        type: 'warning',
        title: 'Discard Changes?',
        message: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
        confirmText: 'Discard',
        cancelText: 'Continue Editing',
        showCancel: true,
        danger: true,
        onConfirm: () => {
          // Call the custom onCancel if provided
          if (formProps.onCancel) {
            formProps.onCancel()
          }
          handleDismissModal()
        }
      })
    } else {
      // Fallback: Call the custom onCancel and dismiss
      if (formProps.onCancel) {
        formProps.onCancel()
      }
      handleDismissModal()
    }
  }, [formProps.onCancel, handleDismissModal, confirmationModalRef])

  // Don't render if no user is authenticated
  if (!userId) {
    return null
  }

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={handlePresentModal}
        className={buttonClassName}
      >
        {buttonIcon || <Plus size={20} color="white" />}
        {buttonText && <Text className="text-white font-semibold">{buttonText}</Text>}
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <ReusableBottomSheet
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        scrollable={true}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
      >
        <View className="flex-1">
          
          <AddHabitForm
            userId={userId}
            habitActions={actions.habit}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            submitButtonText={formProps.submitButtonText || "Create Habit"}
            showCancelButton={formProps.showCancelButton ?? false}
            {...formProps}
          />

          <View className='min-h-28' />

        </View>
      </ReusableBottomSheet>
    </>
  )
}
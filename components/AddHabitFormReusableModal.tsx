import { View, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useRef } from 'react'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { Plus } from 'lucide-react-native'
import AddHabitForm, { AddHabitFormProps } from './forms/AddHabitForm'
import { useAuth } from '@/contexts/HabitBloomGlobalContext'

interface AddHabitFormReusableModalProps {
  // Button customization
  buttonText?: string
  buttonClassName?: string
  buttonIcon?: React.ReactNode
  
  // Form props (optional - will use defaults if not provided)
  formProps?: Partial<Omit<AddHabitFormProps, 'userId'>>
  
  // Modal customization
  snapPoints?: string[]
  enableDynamicSizing?: boolean
}

export default function AddHabitFormReusableModal({
  buttonText = "Add Habit",
  buttonClassName = "flex-row items-center gap-2 bg-blue-500 px-6 py-3 rounded-full",
  buttonIcon,
  formProps = {},
  snapPoints = ['80%', '95%'],
  enableDynamicSizing = false
}: AddHabitFormReusableModalProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const { auth } = useAuth()
  
  const userId = auth?.user?.id

  const handlePresentModal = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleDismissModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, [])

  const handleSuccess = useCallback(async (habit: any) => {
    // Call the custom onSuccess if provided, otherwise just dismiss
    if (formProps.onSuccess) {
      await formProps.onSuccess(habit)
    }
    handleDismissModal()
  }, [formProps.onSuccess, handleDismissModal])

  const handleCancel = useCallback(() => {
    // Call the custom onCancel if provided, otherwise just dismiss
    if (formProps.onCancel) {
      formProps.onCancel()
    }
    handleDismissModal()
  }, [formProps.onCancel, handleDismissModal])

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
        <Text className="text-white font-semibold">{buttonText}</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        backgroundStyle={{ backgroundColor: '#f9fafb' }}
        handleIndicatorStyle={{ backgroundColor: '#d1d5db' }}
      >
        <BottomSheetView className="flex-1 px-4 pb-4">
          <AddHabitForm
            userId={userId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            submitButtonText={formProps.submitButtonText || "Create Habit"}
            showCancelButton={formProps.showCancelButton ?? true}
            {...formProps}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}
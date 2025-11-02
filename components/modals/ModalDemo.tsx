import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ConfirmationModal, { ConfirmationModalRef } from './ConfirmationModal';

export default function ModalDemo() {
  const confirmationModalRef = useRef<ConfirmationModalRef>(null);

  const showSuccessModal = () => {
    confirmationModalRef.current?.show({
      type: 'success',
      title: 'Success! 🎉',
      message: 'Your habit has been completed successfully!',
      confirmText: 'Awesome!',
      showCancel: false
    });
  };

  const showErrorModal = () => {
    confirmationModalRef.current?.show({
      type: 'error',
      title: 'Error',
      message: 'Something went wrong. Please try again.',
      confirmText: 'OK',
      showCancel: false
    });
  };

  const showConfirmationModal = () => {
    confirmationModalRef.current?.show({
      type: 'warning',
      title: 'Delete Habit',
      message: 'Are you sure you want to delete this habit? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => {
        console.log('Habit deleted!');
        // Show success after confirmation
        setTimeout(() => {
          confirmationModalRef.current?.show({
            type: 'success',
            title: 'Deleted',
            message: 'Habit has been deleted successfully.',
            confirmText: 'OK',
            showCancel: false
          });
        }, 100);
      }
    });
  };

  return (
    <View style={{ padding: 20, gap: 20 }}>
      <TouchableOpacity
        onPress={showSuccessModal}
        style={{ 
          backgroundColor: '#22c55e', 
          padding: 16, 
          borderRadius: 12, 
          alignItems: 'center' 
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Show Success Modal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={showErrorModal}
        style={{ 
          backgroundColor: '#ef4444', 
          padding: 16, 
          borderRadius: 12, 
          alignItems: 'center' 
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Show Error Modal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={showConfirmationModal}
        style={{ 
          backgroundColor: '#f59e0b', 
          padding: 16, 
          borderRadius: 12, 
          alignItems: 'center' 
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Show Confirmation Modal
        </Text>
      </TouchableOpacity>

      <ConfirmationModal ref={confirmationModalRef} />
    </View>
  );
}
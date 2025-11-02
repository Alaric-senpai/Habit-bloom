import React, { useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react-native';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export type ConfirmationType = 'success' | 'error' | 'warning' | 'info' | 'confirmation';

export interface ConfirmationModalData {
  type: ConfirmationType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  showCancel?: boolean;
  danger?: boolean; // For destructive actions
}

export interface ConfirmationModalRef {
  show: (data: ConfirmationModalData) => void;
  dismiss: () => void;
}

const ConfirmationModal = forwardRef<ConfirmationModalRef>((props, ref) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [modalData, setModalData] = useState<ConfirmationModalData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useImperativeHandle(ref, () => ({
    show: (data: ConfirmationModalData) => {
      setModalData(data);
      setIsProcessing(false);
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      if (!isProcessing) {
        bottomSheetModalRef.current?.dismiss();
      }
    }
  }));

  const handleDismiss = useCallback(() => {
    setModalData(null);
    setIsProcessing(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await modalData?.onConfirm?.();
      bottomSheetModalRef.current?.dismiss();
    } catch (error) {
      console.error('Error in confirm action:', error);
      setIsProcessing(false);
    }
  }, [modalData, isProcessing]);

  const handleCancel = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await modalData?.onCancel?.();
      bottomSheetModalRef.current?.dismiss();
    } catch (error) {
      console.error('Error in cancel action:', error);
      setIsProcessing(false);
    }
  }, [modalData, isProcessing]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const getIconAndColor = useCallback(() => {
    switch (modalData?.type) {
      case 'success':
        return { 
          icon: <CheckCircle size={40} color="#22c55e" />, 
          color: '#22c55e',
          bgColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
          textColor: '#16a34a'
        };
      case 'error':
        return { 
          icon: <XCircle size={40} color="#ef4444" />, 
          color: '#ef4444',
          bgColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
          textColor: '#dc2626'
        };
      case 'warning':
        return { 
          icon: <AlertTriangle size={40} color="#f59e0b" />, 
          color: '#f59e0b',
          bgColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
          textColor: '#d97706'
        };
      case 'info':
        return { 
          icon: <Info size={40} color="#3b82f6" />, 
          color: '#3b82f6',
          bgColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
          textColor: '#2563eb'
        };
      default:
        return { 
          icon: <AlertTriangle size={40} color="#6b7280" />, 
          color: '#6b7280',
          bgColor: isDark ? 'rgba(107, 114, 128, 0.15)' : '#f3f4f6',
          textColor: '#4b5563'
        };
    }
  }, [modalData?.type, isDark]);

  const { icon, color, bgColor, textColor } = getIconAndColor();
  const backgroundColor = isDark ? '#1f2937' : '#ffffff';
  const titleColor = isDark ? '#f9fafb' : '#1f2937';
  const messageColor = isDark ? '#d1d5db' : '#6b7280';
  const cancelBgColor = isDark ? '#374151' : '#f3f4f6';
  const cancelTextColor = isDark ? '#d1d5db' : '#6b7280';

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onDismiss={handleDismiss}
      enableDynamicSizing={true}
    //   snapPoints={['65%', '70%', '90%']}
      enablePanDownToClose={!isProcessing}
      enableDismissOnClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor }}
      handleIndicatorStyle={{ backgroundColor: isDark ? '#4b5563' : '#d1d5db' }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          marginBottom: 16,
          paddingTop: 8
        }}>
          <TouchableOpacity 
            onPress={handleCancel}
            disabled={isProcessing}
            style={{
              padding: 8,
              opacity: isProcessing ? 0.5 : 1
            }}
          >
            <X size={24} color={messageColor} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          {/* Icon */}
          <View style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: bgColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20
          }}>
            {icon}
          </View>

          {/* Title */}
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: titleColor,
            marginBottom: 12,
            textAlign: 'center',
            paddingHorizontal: 16
          }}>
            {modalData?.title}
          </Text>

          {/* Message */}
          <Text style={{
            fontSize: 15,
            color: messageColor,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 24,
            paddingHorizontal: 8
          }}>
            {modalData?.message}
          </Text>

          {/* Buttons */}
          <View style={{ 
            flexDirection: modalData?.showCancel !== false ? 'row' : 'column',
            gap: 12,
            width: '100%',
            marginTop: 'auto'
          }}>
            {modalData?.showCancel !== false && (
              <TouchableOpacity
                onPress={handleCancel}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  backgroundColor: cancelBgColor,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: isProcessing ? 0.5 : 1
                }}
                activeOpacity={0.7}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: cancelTextColor
                }}>
                  {modalData?.cancelText || 'Cancel'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isProcessing}
              style={{
                flex: modalData?.showCancel !== false ? 1 : undefined,
                backgroundColor: modalData?.danger ? '#ef4444' : color,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                alignItems: 'center',
                opacity: isProcessing ? 0.7 : 1
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#ffffff'
              }}>
                {isProcessing ? 'Processing...' : (modalData?.confirmText || 'OK')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

ConfirmationModal.displayName = 'ConfirmationModal';

export default ConfirmationModal;
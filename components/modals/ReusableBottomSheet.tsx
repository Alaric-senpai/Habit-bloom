import React, { forwardRef, useCallback, useImperativeHandle, useRef, ReactNode } from 'react';
import { View, useColorScheme } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetModalProps } from '@gorhom/bottom-sheet';

export interface ReusableBottomSheetRef {
  present: () => void;
  dismiss: () => void;
  close: () => void;
  expand: () => void;
  collapse: () => void;
  snapToIndex: (index: number) => void;
}

export interface ReusableBottomSheetProps {
  children: ReactNode;
  snapPoints?: string[] | number[];
  enableDynamicSizing?: boolean;
  enablePanDownToClose?: boolean;
  backgroundStyle?: object;
  handleIndicatorStyle?: object;
  onDismiss?: () => void;
  onChange?: (index: number) => void;
  enableOverDrag?: boolean;
  enableContentPanningGesture?: boolean;
  backdropOpacity?: number;
  keyboardBehavior?: 'interactive' | 'fillParent' | 'extend';
  keyboardBlurBehavior?: 'none' | 'restore';
  android_keyboardInputMode?: 'adjustPan' | 'adjustResize';
  scrollable?: boolean;
  containerStyle?: string;
  index?: number;
  name?: string; // For debugging
}

/**
 * Reusable Bottom Sheet Modal Component
 * 
 * Features:
 * - Dark mode support
 * - Scrollable or fixed content
 * - Dynamic or fixed sizing
 * - Keyboard handling
 * - Customizable backdrop
 * - TypeScript support
 * 
 * @example
 * ```tsx
 * const bottomSheetRef = useRef<ReusableBottomSheetRef>(null);
 * 
 * <ReusableBottomSheet
 *   ref={bottomSheetRef}
 *   snapPoints={['50%', '90%']}
 *   scrollable
 * >
 *   <YourComponent />
 * </ReusableBottomSheet>
 * 
 * // Open modal
 * bottomSheetRef.current?.present();
 * ```
 */
const ReusableBottomSheet = forwardRef<ReusableBottomSheetRef, ReusableBottomSheetProps>(
  (
    {
      children,
      snapPoints = ['50%', '90%'],
      enableDynamicSizing = false,
      enablePanDownToClose = true,
      backgroundStyle,
      handleIndicatorStyle,
      onDismiss,
      onChange,
      enableOverDrag = true,
      enableContentPanningGesture = true,
      backdropOpacity = 0.5,
      keyboardBehavior = 'interactive',
      keyboardBlurBehavior = 'restore',
      android_keyboardInputMode = 'adjustResize',
      scrollable = false,
      containerStyle,
      index,
      name = 'BottomSheet',
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        bottomSheetModalRef.current?.dismiss();
      },
      close: () => {
        bottomSheetModalRef.current?.close();
      },
      expand: () => {
        bottomSheetModalRef.current?.expand();
      },
      collapse: () => {
        bottomSheetModalRef.current?.collapse();
      },
      snapToIndex: (snapIndex: number) => {
        bottomSheetModalRef.current?.snapToIndex(snapIndex);
      },
    }));

    // Render backdrop
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={backdropOpacity}
        />
      ),
      [backdropOpacity]
    );

    // Default styles
    const defaultBackgroundStyle = {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      ...backgroundStyle,
    };

    const defaultHandleIndicatorStyle = {
      backgroundColor: isDark ? '#4b5563' : '#d1d5db',
      ...handleIndicatorStyle,
    };

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        name={name}
        index={index ?? 0}
        snapPoints={enableDynamicSizing ? undefined : snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={enablePanDownToClose}
        enableOverDrag={enableOverDrag}
        enableContentPanningGesture={enableContentPanningGesture}
        backdropComponent={renderBackdrop}
        backgroundStyle={defaultBackgroundStyle}
        handleIndicatorStyle={defaultHandleIndicatorStyle}
        onDismiss={onDismiss}
        onChange={onChange}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        android_keyboardInputMode={android_keyboardInputMode}
      >
        {scrollable ? (
          <BottomSheetScrollView
            className={containerStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 pt-4 pb-8">
              {children}
            </View>
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView className={containerStyle}>
            <View className="px-6 pt-4 pb-8">
              {children}
            </View>
          </BottomSheetView>
        )}
      </BottomSheetModal>
    );
  }
);

ReusableBottomSheet.displayName = 'ReusableBottomSheet';

export default ReusableBottomSheet;
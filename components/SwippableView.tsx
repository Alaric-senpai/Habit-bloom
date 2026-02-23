import React, { useRef, useState, useCallback } from "react";
import { View, Text, PanResponder } from "react-native";
import { MotiView } from "moti";

type Props = {
  children: React.ReactNode;
  isSwipable?: boolean;
  swipeLeftText?: string;
  swipeRightText?: string;
  swipeLeftAction?: () => Promise<any> | void;
  swipeRightAction?: () => Promise<any> | void;
  leftBg?: string;
  rightBg?: string;
  threshold?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
};

export default function SwippableView({
  children,
  isSwipable = true,
  swipeLeftText = "Delete",
  swipeRightText = "Complete",
  swipeLeftAction,
  swipeRightAction,
  leftBg = "#ef4444",
  rightBg = "#22c55e",
  threshold = 80,
  leftIcon,
  rightIcon,
  className,
}: Props) {
  const [translateX, setTranslateX] = useState(0);

  const handleRelease = useCallback(() => {
    if (translateX > threshold && swipeRightAction) {
      swipeRightAction();
    } else if (translateX < -threshold && swipeLeftAction) {
      swipeLeftAction();
    }

    setTranslateX(0);
  }, [translateX, threshold, swipeLeftAction, swipeRightAction]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        isSwipable && Math.abs(gestureState.dx) > 5,

      onPanResponderMove: (_, gestureState) => {
        if (!isSwipable) return;
        setTranslateX(gestureState.dx);
      },

      onPanResponderRelease: handleRelease,
      onPanResponderTerminate: handleRelease,
    })
  ).current;

  const rightWidth = Math.max(0, translateX);
  const leftWidth = Math.max(0, -translateX);

  return (
    <View className={`relative overflow-hidden ${className || ""}`}>
      {/* Swipe Right Action (Complete) */}
      {swipeRightAction && (
        <MotiView
          animate={{
            width: rightWidth,
            opacity: rightWidth > threshold / 2 ? 1 : 0.5,
          }}
          transition={{ type: "timing", duration: 150 }}
          style={{ backgroundColor: rightBg }}
          className="absolute left-0 top-0 bottom-0 justify-center items-center pl-5"
        >
          <View className="items-center justify-center">
            {rightIcon}
            <Text className="text-white font-bold text-xs mt-1 text-center">
              {swipeRightText}
            </Text>
          </View>
        </MotiView>
      )}

      {/* Swipe Left Action (Delete) */}
      {swipeLeftAction && (
        <MotiView
          animate={{
            width: leftWidth,
            opacity: leftWidth > threshold / 2 ? 1 : 0.5,
          }}
          transition={{ type: "timing", duration: 150 }}
          style={{ backgroundColor: leftBg }}
          className="absolute right-0 top-0 bottom-0 justify-center items-center pr-5"
        >
          <View className="items-center justify-center">
            {leftIcon}
            <Text className="text-white font-bold text-xs mt-1 text-center">
              {swipeLeftText}
            </Text>
          </View>
        </MotiView>
      )}

      {/* Main Content */}
      <MotiView
        animate={{ translateX }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 150,
        }}
        className="z-10"
        {...panResponder.panHandlers}
      >
        {children}
      </MotiView>
    </View>
  );
}
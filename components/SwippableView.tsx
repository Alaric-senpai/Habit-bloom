import React, { useCallback } from "react";
import { Text, View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  runOnJS,
} from 'react-native-worklets'
type Props = {
  children: React.ReactNode;
  isSwipable?: boolean;
  swipeLeftText?: string;
  swipeRightText?: string;
  swipeLeftAction?: (data?: any) => Promise<any> | void;
  swipeRightAction?: (data?: any) => Promise<any> | void;
  leftBg?: string;
  rightBg?: string;
  styles?: StyleProp<ViewStyle>;
  className?: string;
  threshold?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
  styles: customStyles,
  threshold = 80,
  leftIcon,
  rightIcon,
}: Props) {
  const translateX = useSharedValue(0);
  const gestureInProgress = useSharedValue(false);

  const handleLeftAction = useCallback(() => {
    if (swipeLeftAction) {
      swipeLeftAction();
    }
  }, [swipeLeftAction]);

  const handleRightAction = useCallback(() => {
    if (swipeRightAction) {
      swipeRightAction();
    }
  }, [swipeRightAction]);

  const onGesture = Gesture.Pan()
    .onStart(() => {
      gestureInProgress.value = true;
    })
    .onUpdate((event) => {
      if (!isSwipable) return;
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      gestureInProgress.value = false;
      
      if (translateX.value > threshold && swipeRightAction) {
        runOnJS(handleRightAction)();
      } else if (translateX.value < -threshold && swipeLeftAction) {
        runOnJS(handleLeftAction)();
      }
      
      translateX.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    })
    .activeOffsetX([-10, 10]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
//   calculated width and opcaity when you swipe right and left 

  const leftActionStyle = useAnimatedStyle(() => {
    const width = interpolate(
      translateX.value,
      [0, threshold * 2],
      [0, threshold * 2],
      Extrapolation.EXTEND
    );
    
    const opacity = interpolate(
      translateX.value,
      [0, threshold / 2, threshold],
      [0, 0.5, 1],
      Extrapolation.EXTEND
    );

    return {
      opacity,
      width,
    };
  });   

  const rightActionStyle = useAnimatedStyle(() => {
    const absTranslateX = Math.abs(translateX.value);
    const width = interpolate(
      absTranslateX,
      [0, threshold * 2],
      [0, threshold * 2],
      Extrapolation.EXTEND
    );
    
    const opacity = interpolate(
      absTranslateX,
      [0, threshold / 2, threshold],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity: translateX.value < 0 ? opacity : 0,
      width: translateX.value < 0 ? width : 0,
    };
  });

  const leftActionContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [threshold / 2, threshold],
      [0, 1],
      Extrapolation.EXTEND
    ),
  }));

  const rightActionContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.value),
      [threshold / 2, threshold],
      [0, 1],
      Extrapolation.IDENTITY
    ),
  }));

  return (
    <View style={[styles.container, customStyles]}>
      {/* Right action (Complete) */}
      {swipeRightAction && (
        <Animated.View
          style={[
            styles.leftAction,
            { backgroundColor: rightBg },
            leftActionStyle,
          ]}
        >
          <Animated.View style={[styles.actionContent, leftActionContentStyle]}>
            {rightIcon}
            <Text style={styles.actionText}>{swipeRightText}</Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Left action (Delete) */}
      {swipeLeftAction && (
        <Animated.View
          style={[
            styles.rightAction,
            { backgroundColor: leftBg },
            rightActionStyle,
          ]}
        >
          <Animated.View style={[styles.actionContent, rightActionContentStyle]}>
            {leftIcon}
            <Text style={styles.actionText}>{swipeLeftText}</Text>
          </Animated.View>
        </Animated.View>
      )}

      <GestureDetector gesture={onGesture}>
        <Animated.View style={[styles.childContainer, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  childContainer: {
    backgroundColor: "#fff",
    zIndex: 2,
  },
  leftAction: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 20,
    zIndex: 1,
  },
  rightAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 20,
    zIndex: 1,
  },
  actionContent: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});

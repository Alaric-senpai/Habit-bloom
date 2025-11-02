import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { CircularProgress } from 'react-native-circular-progress';

interface CircularGaugeProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Size of the gauge */
  size?: number;
  /** Stroke width of the progress ring */
  strokeWidth?: number;
  /** Background color of the track */
  backgroundColor?: string;
  /** Color of the progress fill */
  fillColor?: string;
  /** Color of the progress gradient end (optional) */
  gradientEndColor?: string;
  /** Center text to display */
  centerText?: string;
  /** Subtitle text below center text */
  subtitle?: string;
  /** Additional styling for the container */
  containerClassName?: string;
  /** Animation duration in ms */
  animationDuration?: number;
}

export default function CircularGauge({
  progress = 0,
  size = 200,
  strokeWidth = 12,
  backgroundColor = '#E5E7EB',
  fillColor = '#3B82F6',
  gradientEndColor,
  centerText,
  subtitle,
  containerClassName = '',
  animationDuration = 1500
}: CircularGaugeProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Animation for smooth progress fill
  const animatedProgress = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: clampedProgress,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress, animationDuration]);

  // Calculate dimensions for 180-degree semicircle
  const radius = (size - strokeWidth) / 2;
  const gaugeHeight = size / 2 + strokeWidth + 20; // Add padding for better visual balance
  
  return (
    <View className={`items-center justify-center ${containerClassName}`} style={{ height: gaugeHeight }}>
      {/* Gauge Background - Full 180 degree arc */}
      <View 
        className="absolute"
        style={{ 
          width: size,
          height: size / 2 + strokeWidth / 2,
          overflow: 'hidden',
          transform: [{ rotate: '-90deg' }]
        }}
      >
        <CircularProgress
          size={size}
          width={strokeWidth}
          fill={0}
          tintColor="transparent"
          backgroundColor={backgroundColor}
          rotation={0}
          lineCap="round"
          arcSweepAngle={180}
          style={{
            transform: [{ rotate: '90deg' }]
          }}
        >
          {() => null}
        </CircularProgress>
      </View>

      {/* Animated Progress Fill */}
      <View 
        className="absolute"
        style={{ 
          width: size,
          height: size / 2 + strokeWidth / 2,
          overflow: 'hidden',
          transform: [{ rotate: '-90deg' }]
        }}
      >
        <Animated.View>
          <CircularProgress
            size={size}
            width={strokeWidth}
            fill={clampedProgress}
            tintColor={fillColor}
            backgroundColor="transparent"
            rotation={0}
            lineCap="round"
            arcSweepAngle={180}
            style={{
              transform: [{ rotate: '90deg' }]
            }}
          >
            {() => null}
          </CircularProgress>
        </Animated.View>
      </View>
      
      {/* Gauge Scale Markers */}
      <View 
        className="absolute"
        style={{
          width: size + 20,
          height: size / 2 + 30,
          bottom: -10,
        }}
      >
        {/* 0% marker */}
        <View 
          className="absolute w-0.5 h-4 bg-gray-400 dark:bg-gray-500"
          style={{
            left: 10,
            bottom: strokeWidth / 2 + 5,
            transform: [{ rotate: '0deg' }],
            transformOrigin: 'center bottom'
          }}
        />
        {/* 50% marker */}
        <View 
          className="absolute w-0.5 h-3 bg-gray-400 dark:bg-gray-500"
          style={{
            left: size / 2 + 10 - 1,
            bottom: size / 2 + strokeWidth / 2 + 5,
          }}
        />
        {/* 100% marker */}
        <View 
          className="absolute w-0.5 h-4 bg-gray-400 dark:bg-gray-500"
          style={{
            right: 10,
            bottom: strokeWidth / 2 + 5,
            transform: [{ rotate: '0deg' }],
            transformOrigin: 'center bottom'
          }}
        />
      </View>
      
      {/* Center content positioned at the bottom of the gauge */}
      <View 
        className="absolute items-center justify-center"
        style={{
          bottom: 10,
          width: size * 0.8,
        }}
      >
        {centerText && (
          <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            {centerText}
          </Text>
        )}
        {subtitle && (
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
            {subtitle}
          </Text>
        )}
      </View>

      {/* Progress indicator dot */}
      {clampedProgress > 0 && (
        <View
          className="absolute w-3 h-3 rounded-full shadow-lg border-2 border-white"
          style={{
            backgroundColor: fillColor,
            bottom: strokeWidth / 2 + radius + 5 - radius * Math.sin((clampedProgress / 100) * Math.PI),
            left: size / 2 + 10 - 6 + radius * Math.cos((clampedProgress / 100) * Math.PI),
          }}
        />
      )}
    </View>
  );
}

// Preset variants for common use cases
export function SuccessRateGauge({ 
  successRate, 
  size = 180,
  completed,
  total 
}: { 
  successRate: number; 
  size?: number;
  completed?: number;
  total?: number;
}) {
  const getColor = (rate: number) => {
    if (rate >= 80) return '#10B981'; // green
    if (rate >= 60) return '#F59E0B'; // yellow
    if (rate >= 40) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  return (
    <CircularGauge
      progress={successRate}
      size={size}
      fillColor={getColor(successRate)}
      backgroundColor="#F3F4F6"
      centerText={`${Math.round(successRate)}%`}
      subtitle={completed !== undefined && total !== undefined 
        ? `${completed}/${total} completed` 
        : 'Success Rate'
      }
      containerClassName="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
    />
  );
}

export function WeeklyProgressGauge({ 
  weeklyProgress,
  size = 160
}: { 
  weeklyProgress: number[]; 
  size?: number;
}) {
  const totalThisWeek = weeklyProgress.reduce((sum, day) => sum + day, 0);
  const avgLast3Weeks = 21; // This could be calculated from historical data
  const progressPercent = avgLast3Weeks > 0 ? Math.min(100, (totalThisWeek / avgLast3Weeks) * 100) : 0;

  return (
    <CircularGauge
      progress={progressPercent}
      size={size}
      fillColor="#8B5CF6"
      backgroundColor="#F3F4F6"
      centerText={`${totalThisWeek}`}
      subtitle="This Week"
      containerClassName="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
    />
  );
}
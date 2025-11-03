import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { CircularProgress } from 'react-native-circular-progress';

interface CircularGaugeProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  fillColor?: string;
  centerText?: string;
  subtitle?: string;
  containerClassName?: string;
  animationDuration?: number;
}

export default function CircularGauge({
  progress = 0,
  size = 230,
  strokeWidth = 20,
  backgroundColor = '#E5E7EB',
  fillColor = '#3B82F6',
  centerText,
  subtitle,
  containerClassName = '',
  animationDuration = 1500,
}: CircularGaugeProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const gaugeHeight = size / 2 + 60;

  return (
    <View
      className={`items-center justify-center ${containerClassName}`}
      style={{ height: gaugeHeight, width: size + 40 }}
    >
      {/* CircularProgress with 180 degree arc */}
      <View
        style={{
          width: size,
          height: size,
          transform: [{ rotate: '180deg' }],
        }}
      >
        <CircularProgress
          size={size}
          width={strokeWidth}
          fill={clampedProgress}
          tintColor={fillColor}
          backgroundColor={backgroundColor}
          // rotation={180}
          lineCap="round"
          arcSweepAngle={180}
        >
          {() => null}
        </CircularProgress>
      </View>

      {/* Center content positioned at bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 15,
          alignItems: 'center',
          width: size * 0.8,
        }}
      >
        {centerText && (
          <Text 
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign: 'center',
              marginBottom: subtitle ? 4 : 0
            }}
            className="dark:text-white"
          >
            {centerText}
          </Text>
        )}
        {subtitle && (
          <Text 
            style={{
              fontSize: 14,
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: 18
            }}
            className="dark:text-gray-400"
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Scale markers */}
      <View
        style={{
          position: 'absolute',
          bottom: size / 2 - 5,
          width: size + 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 5,
        }}
      >
        <View style={{ width: 2, height: 8, backgroundColor: '#9CA3AF' }} />
        <View style={{ width: 2, height: 6, backgroundColor: '#9CA3AF' }} />
        <View style={{ width: 2, height: 8, backgroundColor: '#9CA3AF' }} />
      </View>
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

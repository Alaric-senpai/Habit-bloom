import { View } from 'react-native'
import React from 'react'
import { Text } from '../ui/text';
import db from '@/lib/db';
import { Skeleton } from 'moti/skeleton'
import { useColorScheme } from 'nativewind';

const TodaysActions = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { isLoading, error, data } = db.useQuery({
    habit: {}
  });

  // Error State
  if (error) {
    return (
      <View className="p-4 items-center justify-center">
        <Text className="text-red-400">Failed to load habits. Please try again.</Text>
      </View>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <View className="px-4 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <View 
            key={idx} 
            className="w-full h-24 rounded-[32px] overflow-hidden bg-[#122222] p-4 flex-row items-center"
          >
            {/* Circle Icon Placeholder */}
            <Skeleton colorMode={colorScheme} radius="round" height={60} width={60} />
            <View className="ml-4 gap-2 flex-1">
              {/* Title Placeholder */}
              <Skeleton colorMode={colorScheme} height={20} width="60%" />
              {/* Subtitle Placeholder */}
              <Skeleton colorMode={colorScheme} height={15} width="40%" />
            </View>
            {/* Checkmark Placeholder */}
            <Skeleton colorMode={colorScheme} radius="round" height={40} width={40} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="px-4 my-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text variant="h4" className="text-white">Today's Habits</Text>
        <Text className="text-primary font-thin">60% Completed</Text>
      </View>

      {/* Map through your actual habit data here */}
      {/* {data?.habit.map((item) => (
        <SwippableView key={item.id}>
           <HabitCard habit={item} />
        </SwippableView>
      ))} 
      */}
    </View>
  );
};

export default TodaysActions;
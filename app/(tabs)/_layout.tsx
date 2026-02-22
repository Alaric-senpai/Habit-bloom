import { View } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar, MinimalTabBar } from '@/components/CustomTabBar';
import { useActions } from '@/contexts/HabitBloomGlobalContext';

export default function TabbedLayout() {


  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="moodstats"
        options={{
          title: 'Mood Stats',
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: 'Reports',
        }}
      />

      <Tabs.Screen
        name="habits"
        options={{
          title: 'My Habits',
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
        }}
      />
    </Tabs>
  );
}
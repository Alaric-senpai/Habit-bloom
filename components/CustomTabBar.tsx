import { View, Text, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useHabitBloom } from '@/contexts/HabitBloomGlobalContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Tab Icons Mapping
const TAB_ICONS: Record<string, { default: string; focused: string }> = {
  index: { default: 'home-outline', focused: 'home' },
  moodstats: { default: 'happy-outline', focused: 'happy' },
  report: { default: 'stats-chart-outline', focused: 'stats-chart' },
  habits: { default: 'checkmark-circle-outline', focused: 'checkmark-circle' },
  account: { default: 'person-outline', focused: 'person' },
};

// Tab Labels
const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  moodstats: 'Mood',
  report: 'Reports',
  habits: 'Habits',
  account: 'Account',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { services } = useHabitBloom();

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border">
      {/* Tabs Container */}
      <View className="flex-row items-center justify-around px-2 py-2">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = TAB_LABELS[route.name] || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              services.haptic.impact('light');
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            services.haptic.impact('medium');
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabBarItem
              key={route.key}
              label={label}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>

      {/* Safe Area Bottom Padding */}
      {Platform.OS === 'ios' && <View className="h-6 bg-background" />}
    </View>
  );
}

// Individual Tab Item Component
interface TabBarItemProps {
  label: string;
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabBarItem({ label, routeName, isFocused, onPress, onLongPress }: TabBarItemProps) {
  const icons = TAB_ICONS[routeName];
  const iconName = isFocused ? icons.focused : icons.default;

  // Animated styles
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isFocused ? 1.1 : 1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0.6, {
        duration: 200,
      }),
    };
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center py-2"
    >
      {/* Icon Container with Background */}
      <View className={`items-center justify-center ${isFocused ? 'mb-1' : 'mb-0.5'}`}>
        {isFocused && (
          <View className="absolute w-16 h-12 bg-primary/10 rounded-2xl" />
        )}
        <Animated.View style={animatedIconStyle}>
          <Ionicons
            name={iconName as any}
            size={24}
            color={isFocused ? 'hsl(165, 75%, 45%)' : 'hsl(215, 15%, 50%)'}
            // Uses primary color when focused, muted-foreground when not
          />
        </Animated.View>
      </View>

      {/* Label */}
      {/* <Animated.Text
        style={animatedLabelStyle}
        className={`text-xs font-semibold ${
          isFocused ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {label}
      </Animated.Text> */}

      {/* Active Indicator Dot */}
      {/* {isFocused && (
        <View className="absolute bottom-0 w-1 h-1 bg-primary rounded-full" />
      )} */}
    </TouchableOpacity>
  );
}

// Alternative: Minimal Tab Bar
export function MinimalTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { services } = useHabitBloom();

  return (
    <View className="absolute bottom-6 left-4 right-4 bg-card/95 backdrop-blur-xl rounded-3xl border border-border shadow-lg">
      <View className="flex-row items-center justify-around px-4 py-3">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name];
          const iconName = isFocused ? icons.focused : icons.default;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              services.haptic.impact('light');
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="p-3"
            >
              <Ionicons
                name={iconName as any}
                size={26}
                color={isFocused ? 'hsl(165, 75%, 45%)' : 'hsl(215, 15%, 50%)'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Alternative: Floating Action Tab Bar
export function FloatingActionTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { services } = useHabitBloom();

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <View className="bg-card/95 backdrop-blur-xl rounded-full px-6 py-3 border border-border shadow-2xl flex-row items-center space-x-4">
        {state.routes.map((route, index) => {
          if (route.name === 'habits') {
            // Center FAB
            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => {
                  services.haptic.impact('medium');
                  navigation.navigate(route.name);
                }}
                className="w-14 h-14 bg-primary rounded-full items-center justify-center -my-2 shadow-lg"
              >
                <Ionicons name="add" size={28} color="white" />
              </TouchableOpacity>
            );
          }

          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name];
          const iconName = isFocused ? icons.focused : icons.default;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => {
                if (!isFocused) {
                  services.haptic.impact('light');
                  navigation.navigate(route.name);
                }
              }}
              className="p-2"
            >
              <Ionicons
                name={iconName as any}
                size={24}
                color={isFocused ? 'hsl(165, 75%, 45%)' : 'hsl(215, 15%, 50%)'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
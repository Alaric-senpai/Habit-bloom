import * as React from 'react';
import { Pressable } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleToggle = () => {
    console.log('Before toggle:', colorScheme);
    toggleColorScheme();
    console.log('After toggle:', colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Pressable
      onPress={handleToggle}
      className="w-12 h-12 rounded-2xl bg-card border border-border items-center justify-center active:opacity-70"
    >
      {isDark ? (
        <Moon size={20} color='hsl(165, 75%, 45%)' />
      ) : (
        <Sun size={20} color='hsl(45, 100%, 55%)' />
      )}
    </Pressable>
  );
}

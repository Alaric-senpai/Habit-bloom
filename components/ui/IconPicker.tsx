// components/ui/IconPicker.tsx (Advanced Version)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import EmojiPicker, { 
  type EmojiType,
  en,
  // You can import other languages: pl, fr, de, es, etc.
} from 'rn-emoji-keyboard';

// Define the category types manually based on the library's available categories
type CategoryTypes = 
  | 'smileys_emotion'
  | 'people_body'
  | 'animals_nature'
  | 'food_drink'
  | 'travel_places'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags';

interface IconPickerProps {
  label?: string;
  value: string | null;
  onChange: (icon: string) => void;
  categoryOrder?: CategoryTypes[];
  disabledCategories?: CategoryTypes[];
}

export default function IconPicker({
  label,
  value,
  onChange,
  categoryOrder = [
    'smileys_emotion',
    'people_body', 
    'animals_nature',
    'food_drink',
    'activities',
    'travel_places',
    'objects',
    'symbols',
    'flags'
  ],
  disabledCategories,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleEmojiSelect = (emoji: EmojiType) => {
    onChange(emoji.emoji);
    setIsOpen(false);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between rounded-2xl bg-gray-200 dark:bg-slate-900 p-4 px-4"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <Text className="text-3xl mr-3">{value || '✨'}</Text>
          <Text className="text-base text-gray-900 dark:text-white font-semibold tracking-wide">
            Choose an icon
          </Text>
        </View>
        <ChevronDown size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <EmojiPicker
        onEmojiSelected={handleEmojiSelect}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        
        // Features
        enableRecentlyUsed
        enableSearchBar
        enableCategoryChangeAnimation
        enableCategoryChangeGesture
        
        // Layout
        categoryPosition="top"
        
        // Translation
        translation={en}
        
        // Custom category order
        categoryOrder={categoryOrder}
        
        // Disable specific categories (optional)
        disabledCategories={disabledCategories}
        
        // Theme - automatically adapts to dark/light mode
        theme={isDark ? {
          backdrop: 'rgba(0, 0, 0, 0.5)',
          knob: '#3B82F6',
          container: '#1F2937',
          header: '#111827',
          skinTonesContainer: '#374151',
          search: {
            text: '#F9FAFB',
            placeholder: '#9CA3AF',
            icon: '#9CA3AF',
            background: '#374151',
          },
          category: {
            icon: '#9CA3AF',
            iconActive: '#3B82F6',
            container: '#374151',
            containerActive: '#3B82F6',
          },
        } : {
          backdrop: 'rgba(22, 22, 24, 0.5)',
          knob: '#3B82F6',
          container: '#FFFFFF',
          header: '#F9FAFB',
          skinTonesContainer: '#E5E7EB',
          search: {
            text: '#1F2937',
            placeholder: '#9CA3AF',
            icon: '#6B7280',
            background: '#F3F4F6',
          },
          category: {
            icon: '#6B7280',
            iconActive: '#3B82F6',
            container: '#E5E7EB',
            containerActive: '#3B82F6',
          },
        }}
      />
    </View>
  );
}
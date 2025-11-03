// components/ui/Select.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string | null;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Select({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  required,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`flex-row items-center justify-between rounded-2xl bg-gray-200 dark:bg-slate-900 p-4 px-4 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <Text
          className={`flex-1 text-base font-semibold tracking-wide ${
            selectedOption
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400'
          }`}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown 
          size={20} 
          color="#9CA3AF"
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      {/* Modal Picker */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 justify-center items-center p-4">
            <Pressable
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {label || 'Select an option'}
                </Text>
              </View>

              {/* Options */}
              <ScrollView className="max-h-96">
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onValueChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex-row items-center justify-between p-4 ${
                      index !== options.length - 1
                        ? 'border-b border-gray-100 dark:border-gray-700'
                        : ''
                    }`}
                  >
                    <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1">
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Check size={20} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className="p-4 border-t border-gray-200 dark:border-gray-700"
              >
                <Text className="text-center text-base font-semibold text-blue-500">
                  Cancel
                </Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
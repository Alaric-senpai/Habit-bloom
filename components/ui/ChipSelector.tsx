import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ChipSelectorProps {
  label?: string;
  options: Array<{ value: string; label: string } | string>;
  value: string | string[] | null;
  onChange: (value: any) => void;
  multiSelect?: boolean;
  required?: boolean;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  label,
  options,
  value,
  onChange,
  multiSelect = false,
  required,
}) => {
  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValue = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiSelect) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}
      
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          
          return (
            <TouchableOpacity
              key={optionValue}
              onPress={() => handleSelect(optionValue)}
              className={`px-4 py-2.5 rounded-full ${
                isSelected(optionValue)
                  ? 'bg-blue-500 border-2 border-blue-500'
                  : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
              }`}
            >
              <Text className={`font-semibold ${
                isSelected(optionValue) 
                  ? 'text-white' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {optionLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Calendar, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  minimumDate,
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      onChange(date);
    }
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="flex-row items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row items-center">
          <Calendar size={20} color="#6B7280" style={{ marginRight: 12 }} />
          <Text className="text-gray-900 dark:text-white font-medium">
            {formatDate(selectedDate)}
          </Text>
        </View>
        <ChevronDown size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {error && <Text className="text-red-500 text-sm mt-1.5">{error}</Text>}
    </View>
  );
};
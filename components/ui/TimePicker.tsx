
import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Clock } from 'lucide-react-native';

interface TimePickerProps {
  label?: string;
  value: string | null; // Expecting time string in HH:mm format
  onChange: (time: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export default function TimePicker({ 
  label, 
  value, 
  onChange, 
  error, 
  required, 
  placeholder = "Select time" 
}: TimePickerProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  // Convert time string to Date object for the picker
  const getDateFromTimeString = (timeString: string | null): Date => {
    if (!timeString) return new Date();
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Convert Date object to time string
  const formatTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Format display time
  const formatDisplayTime = (timeString: string | null): string => {
    if (!timeString) return placeholder;
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return placeholder;
    }
  };

  const handleConfirm = (date: Date) => {
    const timeString = formatTimeString(date);
    onChange(timeString);
    setIsVisible(false);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="flex-row items-center justify-between rounded-2xl bg-gray-200 dark:bg-slate-900 p-4 px-4"
      >
        <View className="flex-row items-center flex-1">
          <Clock size={20} color="#9CA3AF" />
          <Text className="ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide">
            {formatDisplayTime(value)}
          </Text>
        </View>
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      <DateTimePickerModal
        isVisible={isVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={() => setIsVisible(false)}
        date={getDateFromTimeString(value)}
        is24Hour={false}
      />
    </View>
  )
}
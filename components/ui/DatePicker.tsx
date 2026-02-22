// components/ui/DatePicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Calendar } from 'lucide-react-native';
import DateTimePicker, { type DateType } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'single' | 'range';
}

export default function DatePicker({
  label,
  value,
  onChange,
  error,
  required,
  minimumDate,
  maximumDate,
  mode = 'single',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const formatDate = (date: Date) => {
    return dayjs(date).format('MMM DD, YYYY');
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setIsOpen(false);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 dark:text-white text-md my-3 font-semibold">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between rounded-2xl bg-gray-200 dark:bg-slate-900 p-4 px-4"
      >
        <View className="flex-row items-center flex-1">
          <Calendar size={20} color="#9CA3AF" />
          <Text className="ml-3 text-base text-gray-900 dark:text-white font-semibold tracking-wide">
            {formatDate(value)}
          </Text>
        </View>
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
                  {label || 'Select Date'}
                </Text>
              </View>

              {/* Date Picker */}
              <View className="p-4">
                {mode === 'single' ? (
                  <DateTimePicker
                    mode="single"
                    date={tempDate}
                    onChange={(params: { date: DateType }) => {
                      if (params?.date) {
                        // Handle different DateType formats - could be Date, string, or dayjs
                        const dateValue = params.date;
                        if (dateValue instanceof Date) {
                          setTempDate(dateValue);
                        } else if (typeof dateValue === 'string') {
                          setTempDate(new Date(dateValue));
                        } else if (dayjs.isDayjs(dateValue)) {
                          setTempDate(dateValue.toDate());
                        } else {
                          setTempDate(new Date(dateValue as any));
                        }
                      }
                    }}
                    minDate={minimumDate}
                    maxDate={maximumDate}
                  />
                ) : (
                  <DateTimePicker
                    mode="range"
                    startDate={tempDate}
                    onChange={(params: any) => {
                      if (params?.startDate) {
                        const dateValue = params.startDate;
                        if (dateValue instanceof Date) {
                          setTempDate(dateValue);
                        } else if (typeof dateValue === 'string') {
                          setTempDate(new Date(dateValue));
                        } else if (dayjs.isDayjs(dateValue)) {
                          setTempDate(dateValue.toDate());
                        } else {
                          setTempDate(new Date(dateValue as any));
                        }
                      }
                    }}
                    minDate={minimumDate}
                    maxDate={maximumDate}
                  />
                )}
              </View>

              {/* Action Buttons */}
              <View className="flex-row border-t border-gray-200 dark:border-gray-700">
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  className="flex-1 p-4 border-r border-gray-200 dark:border-gray-700"
                >
                  <Text className="text-center text-base font-semibold text-gray-500">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="flex-1 p-4"
                >
                  <Text className="text-center text-base font-semibold text-blue-500">
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
import React from 'react';
import { View, Text } from 'react-native';
import LineChart from './LineChart';

export default function ChartTest() {
  const testData = [
    { value: 1, label: '1', dataPointColor: '#22c55e' },
    { value: 0, label: '2', dataPointColor: '#ef4444' },
    { value: 1, label: '3', dataPointColor: '#22c55e' },
    { value: 1, label: '4', dataPointColor: '#22c55e' },
    { value: 0, label: '5', dataPointColor: '#ef4444' },
    { value: 1, label: '6', dataPointColor: '#22c55e' },
    { value: 1, label: '7', dataPointColor: '#22c55e' },
  ];

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Chart Test
      </Text>
      <LineChart
        data={testData}
        width={320}
        height={180}
        color="#2196F3"
        thickness={3}
        dataPointsRadius={4}
        noOfSections={3}
      />
    </View>
  );
}
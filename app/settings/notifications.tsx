import { View, Text } from 'react-native';
import React from 'react';
import { Container } from '@/components/Container';

export default function NotificationsSettings() {
  return (
    <Container>
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Notification Settings
        </Text>
        <Text className="text-muted-foreground">
          Notification settings coming soon...
        </Text>
      </View>
    </Container>
  );
}

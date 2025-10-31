import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export class NotificationService {
  private notificationReceivedListener?: Notifications.Subscription;
  private notificationResponseListener?: Notifications.Subscription;

  constructor() {
    // Set up default notification channel for Android
    if (Platform.OS === 'android') {
      this.setupAndroidNotificationChannel();
    }
  }

  private async setupAndroidNotificationChannel(): Promise<void> {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      // Additional channel for habit reminders
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
        sound: 'default',
      });
    } catch (error) {
      console.error('Error setting up Android notification channel:', error);
    }
  }

  async requestPermissions(): Promise<{
    granted: boolean;
    token?: string;
    canAskAgain?: boolean;
  }> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return {
          granted: false,
          canAskAgain: finalStatus === 'undetermined',
        };
      }

      // Only get push token if permissions are granted
      let token: string | undefined;
      try {
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId: "5aef5676-cf23-432d-bdc8-ca317d7ddfaa", // Add your project ID
        });
        token = pushToken.data;
      } catch (error) {
        console.error('Error getting push token:', error);
      }

      return {
        granted: true,
        token,
      };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return { granted: false };
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  async scheduleNotificationAsync({
    title,
    body,
    date,
    identifier,
    data,
    channelId,
  }: {
    title: string;
    body?: string;
    date: Date | Notifications.NotificationTriggerInput;
    identifier?: string;
    data?: Record<string, any>;
    channelId?: string;
  }): Promise<string | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return null;
      }

      // Convert Date to trigger object
      const trigger: Notifications.NotificationTriggerInput =
        date instanceof Date
          ? ({ type: 'date', date } as Notifications.NotificationTriggerInput)
          : date;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: body ?? '',
          data: data ?? {},
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: channelId ?? 'default',
          }),
        },
        trigger,
        identifier,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async scheduleRepeatingNotificationAsync({
    title,
    body,
    hour,
    minute,
    identifier,
    data,
    repeats = true,
    channelId,
  }: {
    title: string;
    body?: string;
    hour: number;
    minute: number;
    identifier?: string;
    data?: Record<string, any>;
    repeats?: boolean;
    channelId?: string;
  }): Promise<string | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: body ?? '',
          data: data ?? {},
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: channelId ?? 'habit-reminders',
          }),
        },
        trigger: ({ type: 'calendar', hour, minute, repeats } as Notifications.NotificationTriggerInput),
        identifier,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling repeating notification:', error);
      return null;
    }
  }

  async cancelNotificationAsync(identifier: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }

  async cancelAllScheduledNotificationsAsync(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      return false;
    }
  }

  async getAllScheduledNotificationsAsync(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  async dismissNotificationAsync(identifier: string): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(identifier);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  async dismissAllNotificationsAsync(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  }

  async getBadgeCountAsync(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCountAsync(count: number): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(count);
      return true;
    } catch (error) {
      console.error('Error setting badge count:', error);
      return false;
    }
  }

  // Listener management
  setupNotificationListeners(
    onReceived?: (notification: Notifications.Notification) => void,
    onResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Clean up existing listeners
    this.removeNotificationListeners();

    // Set up received listener (when app is in foreground)
    if (onReceived) {
      this.notificationReceivedListener =
        Notifications.addNotificationReceivedListener(onReceived);
    }

    // Set up response listener (when user taps notification)
    if (onResponse) {
      this.notificationResponseListener =
        Notifications.addNotificationResponseReceivedListener(onResponse);
    }
  }

  removeNotificationListeners(): void {
    if (this.notificationReceivedListener) {
      this.notificationReceivedListener.remove();
      this.notificationReceivedListener = undefined;
    }

    if (this.notificationResponseListener) {
      this.notificationResponseListener.remove();
      this.notificationResponseListener = undefined;
    }
  }

  // Individual listener methods (for custom usage)
  addReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  removeListener(subscription: Notifications.Subscription): void {
    subscription.remove();
  }

  // Get the notification that opened the app
  async getLastNotificationResponseAsync(): Promise<Notifications.NotificationResponse | null> {
    try {
      return await Notifications.getLastNotificationResponseAsync();
    } catch (error) {
      console.error('Error getting last notification response:', error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
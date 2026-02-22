import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as constants from 'expo-constants';
import { router } from 'expo-router';
import { NotificationActions } from '@/database/actions';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationData {
  notificationId?: number;
  userId?: number;
  habitId?: number;
  type?: 'reminder' | 'achievement' | 'system' | 'streak' | 'custom';
  screen?: string;
  params?: Record<string, any>;
}

export class NotificationService {
  private notificationReceivedListener?: Notifications.Subscription;
  private notificationResponseListener?: Notifications.Subscription;
  private notificationActions?: NotificationActions;

  constructor() {
    if(!Device.isDevice) return
    // Set up default notification channel for Android
    if (Platform.OS === 'android') {
      this.setupAndroidNotificationChannel();
    }

    // Initialize notification actions
    this.notificationActions = new NotificationActions();
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
        const projectId = constants.default?.expoConfig?.extra?.eas?.projectId;
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        console.log('Notification token', pushToken.data);
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
    date: Date | Notifications.NotificationTriggerInput | null;
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

      // Handle null date (immediate notification)
      let trigger: Notifications.NotificationTriggerInput | null = null;
      
      if (date instanceof Date) {
        trigger = { type: 'date', date } as Notifications.NotificationTriggerInput;
      } else if (date) {
        trigger = date;
      }

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

      console.log('Notification scheduled', { notificationId, identifier });

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
        trigger: {
          type: 'calendar',
          hour,
          minute,
          repeats,
        } as Notifications.NotificationTriggerInput,
        identifier,
      });

      console.log('Repeating notification scheduled', { notificationId, hour, minute });

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

  /**
   * Handle notification navigation
   */
  private handleNotificationNavigation(data: NotificationData) {
    try {
      // If custom screen is specified, navigate there
      if (data.screen) {
        router.push(data.screen as any);
        return;
      }

      // Navigate based on notification type
      if (data.notificationId) {
        // Navigate to notification detail
        router.push(`/(tabs)/notifications/${data.notificationId}` as any);
      } else if (data.habitId) {
        // Navigate to habit detail
        router.push(`/(tabs)/habits/${data.habitId}` as any);
      } else {
        // Default to notifications list
        router.push('/(tabs)/notifications' as any);
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
      // Fallback to home
      router.push('/(tabs)/home' as any);
    }
  }

  /**
   * Mark notification as received in database
   */
  private async markNotificationReceived(notificationId: number, userId: number) {
    try {
      if (this.notificationActions) {
        await this.notificationActions.markAsDelivered(notificationId, userId);
      }
    } catch (error) {
      console.error('Error marking notification as received:', error);
    }
  }

  /**
   * Mark notification as read in database
   */
  private async markNotificationRead(notificationId: number, userId: number) {
    try {
      if (this.notificationActions) {
        await this.notificationActions.markAsRead(notificationId, userId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Setup notification listeners with enhanced handling
   */
  setupNotificationListeners(
    onReceived?: (notification: Notifications.Notification) => void,
    onResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Clean up existing listeners
    this.removeNotificationListeners();

    // Set up received listener (when app is in foreground)
    this.notificationReceivedListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log('Notification received', {
          title: notification.request.content.title,
          body: notification.request.content.body,
        });

        // Extract data
        const data = notification.request.content.data as NotificationData;

        // Mark as delivered in database
        if (data.notificationId && data.userId) {
          await this.markNotificationReceived(data.notificationId, data.userId);
        }

        // Call custom handler if provided
        if (onReceived) {
          onReceived(notification);
        }
      }
    );

    // Set up response listener (when user taps notification)
    this.notificationResponseListener = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log('Notification tapped', {
          actionIdentifier: response.actionIdentifier,
        });

        // Extract data
        const data = response.notification.request.content.data as NotificationData;

        // Mark as read in database
        if (data.notificationId && data.userId) {
          await this.markNotificationRead(data.notificationId, data.userId);
        }

        // Handle navigation
        this.handleNotificationNavigation(data);

        // Call custom handler if provided
        if (onResponse) {
          onResponse(response);
        }
      }
    );

    console.log('Notification listeners set up');
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

    console.log('Notification listeners removed');
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
      const response = await Notifications.getLastNotificationResponseAsync();
      
      if (response) {
        console.log('App opened from notification', response);
        
        // Handle navigation from the notification that opened the app
        const data = response.notification.request.content.data as NotificationData;
        
        // Mark as read
        if (data.notificationId && data.userId && this.notificationActions) {
          await this.notificationActions.markAsRead(data.notificationId, data.userId);
        }
        
        // Navigate
        this.handleNotificationNavigation(data);
      }
      
      return response;
    } catch (error) {
      console.error('Error getting last notification response:', error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
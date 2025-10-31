import { useState, useEffect, useCallback } from 'react';
import { calendarService } from '@/lib/services';
import { notificationService } from '@/lib/services';
import { updatesService } from '@/lib/services';
import { clipboardService } from '@/lib/services';
import { hapticService } from '@/lib/services';
import * as Calendar from 'expo-calendar';
import { UpdateStatus } from '@/lib/services/updates';

// ============================================================================
// Calendar Hooks
// ============================================================================

/**
 * Hook for calendar permissions
 */
export function useCalendarPermissions() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const requestPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const granted = await calendarService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    hasPermission,
    loading,
    requestPermissions,
  };
}

/**
 * Hook for creating calendar events
 */
export function useCalendarEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createEvent = useCallback(
    async (details: {
      title: string;
      startDate: Date;
      endDate: Date;
      notes?: string;
      timeZone?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const eventId = await calendarService.createEventAsync(details);
        return eventId;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create event');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      await calendarService.deleteEventAsync(eventId);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete event');
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createEvent,
    deleteEvent,
    loading,
    error,
  };
}

// ============================================================================
// Notification Hooks
// ============================================================================

/**
 * Hook for notification permissions
 */
export function useNotificationPermissions() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [token, setToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const requestPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.requestPermissions();
      setHasPermission(result.granted);
      setToken(result.token);
      return result.granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestPermissions();
  }, []);

  return {
    hasPermission,
    token,
    loading,
    requestPermissions,
  };
}

/**
 * Hook for scheduling notifications
 */
export function useNotifications() {
  const [loading, setLoading] = useState(false);

  const scheduleNotification = useCallback(
    async (details: {
      title: string;
      body?: string;
      date: Date;
      identifier?: string;
      data?: Record<string, any>;
    }) => {
      setLoading(true);
      try {
        const id = await notificationService.scheduleNotificationAsync(details);
        return id;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const scheduleRepeating = useCallback(
    async (details: {
      title: string;
      body?: string;
      hour: number;
      minute: number;
      identifier?: string;
    }) => {
      setLoading(true);
      try {
        const id = await notificationService.scheduleRepeatingNotificationAsync(details);
        return id;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelNotification = useCallback(async (identifier: string) => {
    return await notificationService.cancelNotificationAsync(identifier);
  }, []);

  const cancelAll = useCallback(async () => {
    return await notificationService.cancelAllScheduledNotificationsAsync();
  }, []);

  return {
    scheduleNotification,
    scheduleRepeating,
    cancelNotification,
    cancelAll,
    loading,
  };
}

/**
 * Hook for listening to notification events
 */
export function useNotificationListeners(
  onReceived?: (notification: any) => void,
  onResponse?: (response: any) => void
) {
  useEffect(() => {
    notificationService.setupNotificationListeners(onReceived, onResponse);

    return () => {
      notificationService.removeNotificationListeners();
    };
  }, [onReceived, onResponse]);
}

// ============================================================================
// Updates Hooks
// ============================================================================

/**
 * Hook for app updates
 */
export function useAppUpdates() {
  const [status, setStatus] = useState<UpdateStatus>(updatesService['currentStatus']);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = updatesService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const checkForUpdate = useCallback(async () => {
    setChecking(true);
    try {
      const result = await updatesService.checkForUpdateAsync();
      return result;
    } finally {
      setChecking(false);
    }
  }, []);

  const downloadAndApply = useCallback(async (autoReload: boolean = false) => {
    return await updatesService.checkAndApplyUpdateAsync({ autoReload });
  }, []);

  const applyUpdate = useCallback(async () => {
    await updatesService.reloadAsync();
  }, []);

  return {
    ...status,
    checking,
    checkForUpdate,
    downloadAndApply,
    applyUpdate,
    statusMessage: updatesService.getStatusMessage(),
    isEnabled: updatesService.isEnabled(),
  };
}

/**
 * Hook for automatic update checks
 */
export function useAutomaticUpdates(intervalMinutes: number = 30, enabled: boolean = true) {
  useEffect(() => {
    if (enabled) {
      updatesService.startAutomaticUpdateChecks(intervalMinutes);
    }

    return () => {
      updatesService.stopAutomaticUpdateChecks();
    };
  }, [intervalMinutes, enabled]);
}

// ============================================================================
// Clipboard Hooks
// ============================================================================

/**
 * Hook for clipboard operations
 */
export function useClipboard() {
  const [clipboardContent, setClipboardContent] = useState<string>('');
  const [hasContent, setHasContent] = useState(false);

  const copy = useCallback(
    async (text: string, withFeedback: boolean = true) => {
      if (withFeedback) {
        return await clipboardService.copyWithFeedback(text, {
          haptic: true,
        });
      }
      return await clipboardService.copy(text);
    },
    []
  );

  const paste = useCallback(async () => {
    const content = await clipboardService.paste();
    setClipboardContent(content);
    return content;
  }, []);

  const checkHasText = useCallback(async () => {
    const has = await clipboardService.hasText();
    setHasContent(has);
    return has;
  }, []);

  const clear = useCallback(async () => {
    await clipboardService.clear();
    setClipboardContent('');
    setHasContent(false);
  }, []);

  return {
    copy,
    paste,
    clear,
    checkHasText,
    clipboardContent,
    hasContent,
  };
}

/**
 * Hook for clipboard monitoring
 */
export function useClipboardMonitor(options?: { interval?: number; enabled?: boolean }) {
  const { interval = 1000, enabled = true } = options || {};
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (!enabled) return;

    let lastContent = '';

    const checkClipboard = async () => {
      const current = await clipboardService.paste();
      if (current !== lastContent) {
        lastContent = current;
        setContent(current);
      }
    };

    checkClipboard();
    const intervalId = setInterval(checkClipboard, interval);

    return () => clearInterval(intervalId);
  }, [interval, enabled]);

  return content;
}

// ============================================================================
// Haptic Hooks
// ============================================================================

/**
 * Hook for haptic feedback
 */
export function useHaptics() {
  const [enabled, setEnabled] = useState(hapticService.isHapticsEnabled());

  const toggleHaptics = useCallback((value: boolean) => {
    hapticService.setEnabled(value);
    setEnabled(value);
  }, []);

  const impact = useCallback(
    (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      hapticService.impact(style);
    },
    []
  );

  const selection = useCallback(() => {
    hapticService.selection();
  }, []);

  const notification = useCallback(
    (type: 'success' | 'warning' | 'error' = 'success') => {
      hapticService.notification(type);
    },
    []
  );

  // Convenience methods
  const buttonPress = useCallback(() => hapticService.buttonPress(), []);
  const toggle = useCallback(() => hapticService.toggle(), []);
  const success = useCallback(() => hapticService.success(), []);
  const error = useCallback(() => hapticService.error(), []);
  const habitComplete = useCallback(() => hapticService.habitComplete(), []);
  const streakMilestone = useCallback(() => hapticService.streakMilestone(), []);

  return {
    enabled,
    toggleHaptics,
    impact,
    selection,
    notification,
    buttonPress,
    toggle,
    success,
    error,
    habitComplete,
    streakMilestone,
  };
}

/**
 * Hook for haptic button feedback
 */
export function useHapticButton() {
  const onPress = useCallback(() => {
    hapticService.buttonPress();
  }, []);

  const onLongPress = useCallback(() => {
    hapticService.longPress();
  }, []);

  return {
    onPress,
    onLongPress,
  };
}

/**
 * Hook for toggle with haptic feedback
 */
export function useHapticToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => {
      hapticService.toggle();
      return !prev;
    });
  }, []);

  const setWithHaptic = useCallback((newValue: boolean) => {
    if (newValue !== value) {
      hapticService.toggle();
    }
    setValue(newValue);
  }, [value]);

  return [value, toggle, setWithHaptic] as const;
}
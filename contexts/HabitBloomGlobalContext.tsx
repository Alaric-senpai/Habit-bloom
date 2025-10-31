import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { calendarService } from '@/lib/services';
import { notificationService } from '@/lib/services';
import { updatesService } from '@/lib/services';
import { networkService } from '@/lib/services';
import { clipboardService } from '@/lib/services';
import { hapticService } from '@/lib/services';
import { NetworkStatus } from '@/lib/services/network';
// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  settings: {
    notificationsEnabled: boolean;
    hapticsEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
    defaultReminderTime: { hour: number; minute: number };
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PermissionsState {
  calendar: boolean;
  notifications: boolean;
  notificationToken?: string;
}

export interface HabitBloomContextType {
  // Auth
  auth: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  updateUserSettings: (settings: Partial<User['settings']>) => Promise<void>;

  // Permissions
  permissions: PermissionsState;
  requestCalendarPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;

  // Calendar
  createCalendarEvent: (details: {
    title: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
  }) => Promise<string | null>;
  deleteCalendarEvent: (eventId: string) => Promise<boolean>;

  // Notifications
  scheduleNotification: (details: {
    title: string;
    body?: string;
    date: Date;
    identifier?: string;
    data?: Record<string, any>;
  }) => Promise<string | null>;
  scheduleRepeatingNotification: (details: {
    title: string;
    body?: string;
    hour: number;
    minute: number;
    identifier?: string;
  }) => Promise<string | null>;
  cancelNotification: (identifier: string) => Promise<boolean>;
  cancelAllNotifications: () => Promise<boolean>;

  // Network
  network: NetworkStatus;
  isOnline: boolean;
  refreshNetwork: () => Promise<void>;

  // Updates
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
  hasUpdateAvailable: boolean;

  // Clipboard
  copyToClipboard: (text: string, withFeedback?: boolean) => Promise<boolean>;
  pasteFromClipboard: () => Promise<string>;

  // Haptics
  triggerHaptic: (
    type: 'impact' | 'selection' | 'success' | 'error' | 'warning',
    intensity?: 'light' | 'medium' | 'heavy'
  ) => void;
  habitCompleteHaptic: () => void;
  streakMilestoneHaptic: () => void;

  // Global loading state
  isInitializing: boolean;
}

// ============================================================================
// Context
// ============================================================================

const HabitBloomContext = createContext<HabitBloomContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function HabitBloomProvider({ children }: { children: ReactNode }) {
  // ========================================
  // Auth State (Dummy for now)
  // ========================================
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // ========================================
  // Permissions State
  // ========================================
  const [permissions, setPermissions] = useState<PermissionsState>({
    calendar: false,
    notifications: false,
  });

  // ========================================
  // Network State
  // ========================================
  const [network, setNetwork] = useState<NetworkStatus>(networkService.getStatus());
  const [isOnline, setIsOnline] = useState(true);

  // ========================================
  // Updates State
  // ========================================
  const [hasUpdateAvailable, setHasUpdateAvailable] = useState(false);

  // ========================================
  // Initialization State
  // ========================================
  const [isInitializing, setIsInitializing] = useState(true);

  // ========================================
  // Initialize Services
  // ========================================
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check stored auth (dummy implementation)
        // TODO: Replace with actual auth check
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Initialize dummy user if needed
        const storedUser = null; // TODO: Get from secure storage
        if (storedUser) {
          setAuth({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuth((prev) => ({ ...prev, isLoading: false }));
        }

        // Check permissions
        const calendarGranted = await calendarService.requestPermissions();
        const notificationResult = await notificationService.requestPermissions();

        setPermissions({
          calendar: calendarGranted,
          notifications: notificationResult.granted,
          notificationToken: notificationResult.token,
        });

        // Set up notification listeners
        notificationService.setupNotificationListeners(
          (notification) => {
            console.log('Notification received:', notification);
          },
          (response) => {
            console.log('Notification tapped:', response);
            // Handle navigation based on notification data
          }
        );

        // Start network monitoring
        const unsubscribeNetwork = networkService.subscribe((status) => {
          setNetwork(status);
          setIsOnline(status.isConnected && status.isInternetReachable === true);
        });

        // Check for updates
        if (updatesService.isEnabled()) {
          const updateCheck = await updatesService.checkForUpdateAsync();
          setHasUpdateAvailable(updateCheck.isAvailable);
          
          // Start periodic update checks
          updatesService.startAutomaticUpdateChecks(30);
        }

        // Apply user haptic settings
        if (auth.user?.settings.hapticsEnabled === false) {
          hapticService.setEnabled(false);
        }

        setIsInitializing(false);

        return () => {
          unsubscribeNetwork();
          notificationService.removeNotificationListeners();
          updatesService.cleanup();
          networkService.cleanup();
        };
      } catch (error) {
        console.error('Error initializing HabitBloom:', error);
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  // ========================================
  // Auth Methods (Dummy implementations)
  // ========================================
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuth((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Dummy user
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        createdAt: new Date(),
        settings: {
          notificationsEnabled: true,
          hapticsEnabled: true,
          theme: 'auto',
          defaultReminderTime: { hour: 9, minute: 0 },
        },
      };

      setAuth({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      hapticService.success();
      return true;
    } catch (error) {
      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Login failed',
      });
      hapticService.error();
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    // TODO: Replace with actual logout logic
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    hapticService.impact('medium');
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const user: User = {
          id: '1',
          email,
          name,
          createdAt: new Date(),
          settings: {
            notificationsEnabled: true,
            hapticsEnabled: true,
            theme: 'auto',
            defaultReminderTime: { hour: 9, minute: 0 },
          },
        };

        setAuth({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        hapticService.success();
        return true;
      } catch (error) {
        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Registration failed',
        });
        hapticService.error();
        return false;
      }
    },
    []
  );

  const updateUserSettings = useCallback(
    async (settings: Partial<User['settings']>) => {
      if (!auth.user) return;

      const updatedSettings = { ...auth.user.settings, ...settings };
      
      // Update haptics if changed
      if (settings.hapticsEnabled !== undefined) {
        hapticService.setEnabled(settings.hapticsEnabled);
      }

      setAuth((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, settings: updatedSettings } : null,
      }));

      // TODO: Persist to backend/storage
      hapticService.success();
    },
    [auth.user]
  );

  // ========================================
  // Permission Methods
  // ========================================
  const requestCalendarPermission = useCallback(async (): Promise<boolean> => {
    const result = await calendarService.requestPermissions();
    const granted = result;
    setPermissions((prev) => ({ ...prev, calendar: granted }));
    return granted;
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    const result = await notificationService.requestPermissions();
    setPermissions((prev) => ({
      ...prev,
      notifications: result.granted,
      notificationToken: result.token,
    }));
    return result.granted;
  }, []);

  // ========================================
  // Calendar Methods
  // ========================================
  const createCalendarEvent = useCallback(
    async (details: {
      title: string;
      startDate: Date;
      endDate: Date;
      notes?: string;
    }) => {
      try {
        const eventId = await calendarService.createEventAsync(details);
        hapticService.success();
        return eventId;
      } catch (error) {
        console.error('Error creating calendar event:', error);
        hapticService.error();
        return null;
      }
    },
    []
  );

  const deleteCalendarEvent = useCallback(async (eventId: string) => {
    try {
      await calendarService.deleteEventAsync(eventId);
      hapticService.success();
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      hapticService.error();
      return false;
    }
  }, []);

  // ========================================
  // Notification Methods
  // ========================================
  const scheduleNotification = useCallback(
    async (details: {
      title: string;
      body?: string;
      date: Date;
      identifier?: string;
      data?: Record<string, any>;
    }) => {
      return await notificationService.scheduleNotificationAsync(details);
    },
    []
  );

  const scheduleRepeatingNotification = useCallback(
    async (details: {
      title: string;
      body?: string;
      hour: number;
      minute: number;
      identifier?: string;
    }) => {
      return await notificationService.scheduleRepeatingNotificationAsync(details);
    },
    []
  );

  const cancelNotification = useCallback(async (identifier: string) => {
    return await notificationService.cancelNotificationAsync(identifier);
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    return await notificationService.cancelAllScheduledNotificationsAsync();
  }, []);

  // ========================================
  // Network Methods
  // ========================================
  const refreshNetwork = useCallback(async () => {
    await networkService.refresh();
  }, []);

  // ========================================
  // Update Methods
  // ========================================
  const checkForUpdates = useCallback(async () => {
    const result = await updatesService.checkForUpdateAsync();
    setHasUpdateAvailable(result.isAvailable);
  }, []);

  const applyUpdate = useCallback(async () => {
    await updatesService.reloadAsync();
  }, []);

  // ========================================
  // Clipboard Methods
  // ========================================
  const copyToClipboard = useCallback(
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

  const pasteFromClipboard = useCallback(async () => {
    return await clipboardService.paste();
  }, []);

  // ========================================
  // Haptic Methods
  // ========================================
  const triggerHaptic = useCallback(
    (
      type: 'impact' | 'selection' | 'success' | 'error' | 'warning',
      intensity: 'light' | 'medium' | 'heavy' = 'medium'
    ) => {
      switch (type) {
        case 'impact':
          hapticService.impact(intensity);
          break;
        case 'selection':
          hapticService.selection();
          break;
        case 'success':
          hapticService.success();
          break;
        case 'error':
          hapticService.error();
          break;
        case 'warning':
          hapticService.notification('warning');
          break;
      }
    },
    []
  );

  const habitCompleteHaptic = useCallback(() => {
    hapticService.habitComplete();
  }, []);

  const streakMilestoneHaptic = useCallback(() => {
    hapticService.streakMilestone();
  }, []);

  // ========================================
  // Context Value
  // ========================================
  const value: HabitBloomContextType = {
    // Auth
    auth,
    login,
    logout,
    register,
    updateUserSettings,

    // Permissions
    permissions,
    requestCalendarPermission,
    requestNotificationPermission,

    // Calendar
    createCalendarEvent,
    deleteCalendarEvent,

    // Notifications
    scheduleNotification,
    scheduleRepeatingNotification,
    cancelNotification,
    cancelAllNotifications,

    // Network
    network,
    isOnline,
    refreshNetwork,

    // Updates
    checkForUpdates,
    applyUpdate,
    hasUpdateAvailable,

    // Clipboard
    copyToClipboard,
    pasteFromClipboard,

    // Haptics
    triggerHaptic,
    habitCompleteHaptic,
    streakMilestoneHaptic,

    // Global state
    isInitializing,
  };

  return (
    <HabitBloomContext.Provider value={value}>
      {children}
    </HabitBloomContext.Provider>
  );
}

// ============================================================================
// Hook to use context
// ============================================================================

export function useHabitBloom() {
  const context = useContext(HabitBloomContext);
  if (context === undefined) {
    throw new Error('useHabitBloom must be used within a HabitBloomProvider');
  }
  return context;
}

// ============================================================================
// Specialized hooks for specific features
// ============================================================================

/**
 * Hook for auth operations
 */
export function useAuth() {
  const { auth, login, logout, register, updateUserSettings } = useHabitBloom();
  return { auth, login, logout, register, updateUserSettings };
}

/**
 * Hook for permissions
 */
export function usePermissions() {
  const {
    permissions,
    requestCalendarPermission,
    requestNotificationPermission,
  } = useHabitBloom();
  return {
    permissions,
    requestCalendarPermission,
    requestNotificationPermission,
  };
}

/**
 * Hook for calendar operations
 */
export function useCalendar() {
  const { createCalendarEvent, deleteCalendarEvent, permissions } = useHabitBloom();
  return {
    createEvent: createCalendarEvent,
    deleteEvent: deleteCalendarEvent,
    hasPermission: permissions.calendar,
  };
}

/**
 * Hook for notification operations
 */
export function useNotifications() {
  const {
    scheduleNotification,
    scheduleRepeatingNotification,
    cancelNotification,
    cancelAllNotifications,
    permissions,
  } = useHabitBloom();
  return {
    schedule: scheduleNotification,
    scheduleRepeating: scheduleRepeatingNotification,
    cancel: cancelNotification,
    cancelAll: cancelAllNotifications,
    hasPermission: permissions.notifications,
  };
}

/**
 * Hook for network status
 */
export function useNetworkStatus() {
  const { network, isOnline, refreshNetwork } = useHabitBloom();
  return { network, isOnline, refresh: refreshNetwork };
}

/**
 * Hook for app updates
 */
export function useUpdates() {
  const { checkForUpdates, applyUpdate, hasUpdateAvailable } = useHabitBloom();
  return { check: checkForUpdates, apply: applyUpdate, hasUpdate: hasUpdateAvailable };
}
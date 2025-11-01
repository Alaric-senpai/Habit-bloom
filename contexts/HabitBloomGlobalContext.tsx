import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { calendarService, notificationService, updatesService, networkService, clipboardService, hapticService } from '@/lib/services';
import { NetworkStatus } from '@/lib/services/network';
import { LoginSchemaType, RegisterSchemaType, sanitizedUserSchemaType } from '@/types';
import storage from '@/lib/storage/mmkv';
import { 
  UserActions, 
  HabitActions, 
  HabitLogActions, 
  MoodActions, 
  NotificationActions, 
  AchievementActions, 
  UserAnswerActions 
} from '@/database/actions';
import { NotificationTriggerInput } from 'expo-notifications';

// ============================================================================
// Types
// ============================================================================

export interface AuthState {
  user: sanitizedUserSchemaType | null;
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
  login: (data: LoginSchemaType) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegisterSchemaType) => Promise<boolean>;

  // Database Actions (Direct Access)
  actions: {
    user: UserActions;
    habit: HabitActions;
    habitLog: HabitLogActions;
    mood: MoodActions;
    notification: NotificationActions;
    achievement: AchievementActions;
    userAnswer: UserAnswerActions;
  };

  // System Services (Direct Access)
  services: {
    calendar: typeof calendarService;
    notification: typeof notificationService;
    updates: typeof updatesService;
    network: typeof networkService;
    clipboard: typeof clipboardService;
    haptic: typeof hapticService;
  };

  // Permissions
  permissions: PermissionsState;
  requestCalendarPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;

  // Calendar (Convenience Methods)
  createCalendarEvent: (details: {
    title: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
  }) => Promise<string | null>;
  deleteCalendarEvent: (eventId: string) => Promise<boolean>;

  // Notifications (Convenience Methods)
  scheduleNotification: (details: {
    title: string;
    body?: string;
    date: Date | NotificationTriggerInput;
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

  // Clipboard (Convenience Methods)
  copyToClipboard: (text: string, withFeedback?: boolean) => Promise<boolean>;
  pasteFromClipboard: () => Promise<string>;

  // Haptics (Convenience Methods)
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
  // Initialize Actions (Memoized)
  // ========================================
  const actions = useMemo(() => ({
    user: new UserActions(),
    habit: new HabitActions(),
    habitLog: new HabitLogActions(),
    mood: new MoodActions(),
    notification: new NotificationActions(),
    achievement: new AchievementActions(),
    userAnswer: new UserAnswerActions(),
  }), []);

  // ========================================
  // Services Reference (Memoized)
  // ========================================
  const services = useMemo(() => ({
    calendar: calendarService,
    notification: notificationService,
    updates: updatesService,
    network: networkService,
    clipboard: clipboardService,
    haptic: hapticService,
  }), []);

  // ========================================
  // Auth State
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
  // Check stored auth
  const userid = await storage.getNumber('activeUserID');

        if (!userid) {
          setAuth({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          setIsInitializing(false);
          return;
        }

        // Get user from database
        try {
          const storedUser = await actions.user.getUserById(userid);
          if (storedUser) {
            setAuth({
              user: storedUser as sanitizedUserSchemaType,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // User not found, clear storage
            await storage.remove('activeUserID');
            setAuth({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          await storage.remove('activeUserID');
          setAuth({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to load user',
          });
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
          updatesService.startAutomaticUpdateChecks(30);
        }

        // Set up haptics from storage
        const hapticsEnabled = await storage.getBoolean('hapticsEnabled');
        if (hapticsEnabled !== null) {
          hapticService.setEnabled(hapticsEnabled);
        } else {
          await storage.set('hapticsEnabled', true);
          hapticService.setEnabled(true);
        }

        // Check if app was opened from notification
        const lastNotification = await notificationService.getLastNotificationResponseAsync();
        if (lastNotification) {
          console.log('App opened from notification', lastNotification);
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
  }, [actions.user]);

  // ========================================
  // Auth Methods
  // ========================================
  const login = useCallback(
    async (data: LoginSchemaType): Promise<boolean> => {
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const loginResponse = await actions.user.login(data);

        if (loginResponse) {
          setAuth({
            user: loginResponse as sanitizedUserSchemaType,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('Login successful', { userId: loginResponse.id });
          hapticService.success();
          return true;
        }

        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Login failed',
        });
        hapticService.error();
        return false;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        console.error('Login error:', error);

        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });
        hapticService.error();
        return false;
      }
    },
    [actions.user]
  );

  const logout = useCallback(async () => {
    try {
      await storage.remove('activeUserID');
      await notificationService.cancelAllScheduledNotificationsAsync();

      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      console.log('User logged out');
      hapticService.impact('medium');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const register = useCallback(
    async (data: RegisterSchemaType): Promise<boolean> => {
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const registerResponse = await actions.user.createAccount(data);

        if (registerResponse) {
          setAuth({
            user: registerResponse as sanitizedUserSchemaType,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('Registration successful', { userId: registerResponse.id });
          hapticService.success();
          return true;
        }

        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Registration failed',
        });
        hapticService.error();
        return false;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        console.error('Registration error:', error);

        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });
        hapticService.error();
        return false;
      }
    },
    [actions.user]
  );

  // ========================================
  // Permission Methods
  // ========================================
  const requestCalendarPermission = useCallback(async (): Promise<boolean> => {
    const result = await calendarService.requestPermissions();
    setPermissions((prev) => ({ ...prev, calendar: result }));
    return result;
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
  // Calendar Methods (Convenience)
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
  // Notification Methods (Convenience)
  // ========================================
  const scheduleNotification = useCallback(
    async (details: {
      title: string;
      body?: string;
      date: Date | NotificationTriggerInput;
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
  // Clipboard Methods (Convenience)
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
  // Haptic Methods (Convenience)
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

    // Actions (Direct Access)
    actions,

    // Services (Direct Access)
    services,

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

  return <HabitBloomContext.Provider value={value}>{children}</HabitBloomContext.Provider>;
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
  const { auth, login, logout, register } = useHabitBloom();
  return { auth, login, logout, register };
}

/**
 * Hook for database actions
 */
export function useActions() {
  const { actions } = useHabitBloom();
  return actions;
}

/**
 * Hook for system services
 */
export function useServices() {
  const { services } = useHabitBloom();
  return services;
}

/**
 * Hook for permissions
 */
export function usePermissions() {
  const { permissions, requestCalendarPermission, requestNotificationPermission } =
    useHabitBloom();
  return {
    permissions,
    requestCalendarPermission,
    requestNotificationPermission,
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
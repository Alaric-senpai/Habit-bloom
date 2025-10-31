import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

export interface UpdateCheckResult {
  isAvailable: boolean;
  manifest?: Updates.Manifest;
  error?: any;
}

export interface UpdateFetchResult {
  isNew: boolean;
  manifest?: Updates.Manifest;
  error?: any;
}

export interface UpdateStatus {
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  error?: string;
}

export class UpdatesService {
  private updateCheckInterval?: ReturnType<typeof setInterval>;
  private listeners: Set<(status: UpdateStatus) => void> = new Set();
  private currentStatus: UpdateStatus = {
    isChecking: false,
    isDownloading: false,
    isUpdateAvailable: false,
    isUpdatePending: false,
  };

  constructor() {
    // Log current update info on initialization
    this.logUpdateInfo();
  }

  private logUpdateInfo(): void {
    if (__DEV__) {
      console.log('Updates Service - Development mode, updates disabled');
      return;
    }

    console.log('Updates Service Info:', {
      isEnabled: Updates.isEnabled,
      channel: Updates.channel,
      updateId: Updates.updateId,
      runtimeVersion: Updates.runtimeVersion,
      createdAt: Updates.createdAt,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentStatus));
  }

  private updateStatus(partial: Partial<UpdateStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...partial };
    this.notifyListeners();
  }

  /**
   * Subscribe to update status changes
   */
  subscribe(listener: (status: UpdateStatus) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current status
    listener(this.currentStatus);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if updates are enabled (not in development mode)
   */
  isEnabled(): boolean {
    return Updates.isEnabled && !__DEV__;
  }

  /**
   * Get current update information
   */
  getCurrentUpdateInfo(): {
    updateId: string | undefined;
    channel: string | undefined;
    runtimeVersion: string | undefined;
    createdAt: Date | undefined;
    isEmergencyLaunch: boolean;
  } {

    let date = new Date()

    return {
      updateId: Updates.updateId ?? undefined,
      channel: Updates.channel ?? undefined,
      runtimeVersion: Updates.runtimeVersion ?? undefined,
      createdAt: Updates.createdAt ?? date,
      isEmergencyLaunch: Updates.isEmergencyLaunch,
    };
  }

  /**
   * Check for available updates
   */
  async checkForUpdateAsync(): Promise<UpdateCheckResult> {
    if (!this.isEnabled()) {
      return {
        isAvailable: false,
        error: 'Updates are disabled in development mode',
      };
    }

    this.updateStatus({ isChecking: true, error: undefined });

    try {
      const update = await Updates.checkForUpdateAsync();
      
      this.updateStatus({
        isChecking: false,
        isUpdateAvailable: update.isAvailable,
      });

      return {
        isAvailable: update.isAvailable,
        manifest: update.manifest,
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      
      this.updateStatus({
        isChecking: false,
        error: error instanceof Error ? error.message : 'Failed to check for updates',
      });

      return {
        isAvailable: false,
        error,
      };
    }
  }

  /**
   * Download available update
   */
  async fetchUpdateAsync(): Promise<UpdateFetchResult> {
    if (!this.isEnabled()) {
      return {
        isNew: false,
        error: 'Updates are disabled in development mode',
      };
    }

    this.updateStatus({ isDownloading: true, error: undefined });

    try {
      const result = await Updates.fetchUpdateAsync();
      
      this.updateStatus({
        isDownloading: false,
        isUpdatePending: result.isNew,
      });

      return {
        isNew: result.isNew,
        manifest: result.manifest,
      };
    } catch (error) {
      console.error('Error fetching update:', error);
      
      this.updateStatus({
        isDownloading: false,
        error: error instanceof Error ? error.message : 'Failed to download update',
      });

      return {
        isNew: false,
        error,
      };
    }
  }

  /**
   * Reload the app with the new update
   */
  async reloadAsync(): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('Cannot reload: Updates are disabled in development mode');
      return;
    }

    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
      throw error;
    }
  }

  /**
   * Check, download, and apply update automatically
   */
  async checkAndApplyUpdateAsync(options?: {
    autoReload?: boolean;
  }): Promise<{
    success: boolean;
    isAvailable?: boolean;
    isNew?: boolean;
    error?: any;
  }> {
    const { autoReload = true } = options || {};

    if (!this.isEnabled()) {
      return {
        success: false,
        error: 'Updates are disabled in development mode',
      };
    }

    try {
      // Check for updates
      const checkResult = await this.checkForUpdateAsync();
      
      if (checkResult.error) {
        return {
          success: false,
          isAvailable: false,
          error: checkResult.error,
        };
      }

      if (!checkResult.isAvailable) {
        return {
          success: true,
          isAvailable: false,
        };
      }

      // Fetch the update
      const fetchResult = await this.fetchUpdateAsync();
      
      if (fetchResult.error) {
        return {
          success: false,
          isAvailable: true,
          isNew: false,
          error: fetchResult.error,
        };
      }

      if (!fetchResult.isNew) {
        return {
          success: true,
          isAvailable: true,
          isNew: false,
        };
      }

      // Reload if autoReload is enabled
      if (autoReload) {
        await this.reloadAsync();
      }

      return {
        success: true,
        isAvailable: true,
        isNew: true,
      };
    } catch (error) {
      console.error('Error in checkAndApplyUpdate:', error);
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * Start automatic update checking at intervals
   */
  startAutomaticUpdateChecks(intervalMinutes: number = 30): void {
    if (!this.isEnabled()) {
      console.warn('Cannot start automatic checks: Updates are disabled');
      return;
    }

    // Clear existing interval
    this.stopAutomaticUpdateChecks();

    // Check immediately
    this.checkForUpdateAsync();

    // Set up interval
    this.updateCheckInterval = setInterval(
      () => {
        this.checkForUpdateAsync();
      },
      intervalMinutes * 60 * 1000
    );

    console.log(`Automatic update checks started (every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop automatic update checking
   */
  stopAutomaticUpdateChecks(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = undefined;
      console.log('Automatic update checks stopped');
    }
  }

  /**
   * Check and prompt user before applying update
   */
  async checkAndPromptUpdate(
    onUpdateAvailable: (manifest?: Updates.Manifest) => Promise<boolean>
  ): Promise<{
    success: boolean;
    userAccepted?: boolean;
    error?: any;
  }> {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: 'Updates are disabled in development mode',
      };
    }

    try {
      const checkResult = await this.checkForUpdateAsync();

      if (!checkResult.isAvailable || checkResult.error) {
        return {
          success: true,
          userAccepted: false,
        };
      }

      // Ask user if they want to update
      const userAccepted = await onUpdateAvailable(checkResult.manifest);

      if (!userAccepted) {
        return {
          success: true,
          userAccepted: false,
        };
      }

      // User accepted, fetch and apply update
      const fetchResult = await this.fetchUpdateAsync();

      if (fetchResult.error || !fetchResult.isNew) {
        return {
          success: false,
          userAccepted: true,
          error: fetchResult.error || 'Update not available',
        };
      }

      await this.reloadAsync();

      return {
        success: true,
        userAccepted: true,
      };
    } catch (error) {
      console.error('Error in checkAndPromptUpdate:', error);
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * Get readable status message
   */
  getStatusMessage(): string {
    const { isChecking, isDownloading, isUpdateAvailable, isUpdatePending, error } =
      this.currentStatus;

    if (error) return error;
    if (isChecking) return 'Checking for updates...';
    if (isDownloading) return 'Downloading update...';
    if (isUpdatePending) return 'Update ready to install';
    if (isUpdateAvailable) return 'Update available';
    return 'App is up to date';
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopAutomaticUpdateChecks();
    this.listeners.clear();
  }
}

export const updatesService = new UpdatesService();
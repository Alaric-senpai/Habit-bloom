import * as Network from 'expo-network';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export enum NetworkType {
  NONE = 'NONE',
  WIFI = 'WIFI',
  CELLULAR = 'CELLULAR',
  BLUETOOTH = 'BLUETOOTH',
  ETHERNET = 'ETHERNET',
  WIMAX = 'WIMAX',
  VPN = 'VPN',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

export enum ConnectionQuality {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  MODERATE = 'MODERATE',
  POOR = 'POOR',
  OFFLINE = 'OFFLINE',
  UNKNOWN = 'UNKNOWN',
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetworkType;
  isWifi: boolean;
  isCellular: boolean;
  isExpensive: boolean | null;
  quality: ConnectionQuality;
  details: {
    ipAddress?: string;
    carrier?: string;
    ssid?: string;
    strength?: number;
    isConnectionExpensive?: boolean;
  };
}

export interface NetworkInfo {
  ipAddress?: string;
  airplane: boolean;
}

export class NetworkService {
  private netInfoUnsubscribe?: NetInfoSubscription;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private currentStatus: NetworkStatus = {
    isConnected: false,
    isInternetReachable: null,
    type: NetworkType.UNKNOWN,
    isWifi: false,
    isCellular: false,
    isExpensive: null,
    quality: ConnectionQuality.UNKNOWN,
    details: {},
  };
  private connectionCheckInterval?: ReturnType<typeof setInterval>;
  private readonly PING_TIMEOUT = 5000; // 5 seconds
  private readonly PING_URLS = [
    'https://www.google.com',
    'https://www.cloudflare.com',
    'https://1.1.1.1',
  ];

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Get initial network state
    await this.updateNetworkStatus();
    
    // Start listening to network changes
    this.startNetworkMonitoring();
  }

  private async updateNetworkStatus(): Promise<void> {
    try {
      const state = await NetInfo.fetch();
      this.processNetworkState(state);
    } catch (error) {
      console.error('Error updating network status:', error);
    }
  }

  private processNetworkState(state: NetInfoState): void {
    const type = this.mapNetworkType(state.type);
    const quality = this.determineConnectionQuality(state);

    this.currentStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type,
      isWifi: type === NetworkType.WIFI,
      isCellular: type === NetworkType.CELLULAR,
      isExpensive: state.details?.isConnectionExpensive ?? null,
      quality,
      details: {
        // @ts-expect-error
        ipAddress: state.details?.ipAddress,
        // @ts-expect-error

        carrier: state.details?.cellularGeneration,
        // @ts-expect-error

        ssid: state.details?.ssid,
        // @ts-expect-error

        strength: state.details?.strength,
        isConnectionExpensive: state.details?.isConnectionExpensive,
      },
    };

    this.notifyListeners();
  }

  private mapNetworkType(type: string): NetworkType {
    switch (type.toLowerCase()) {
      case 'wifi':
        return NetworkType.WIFI;
      case 'cellular':
        return NetworkType.CELLULAR;
      case 'bluetooth':
        return NetworkType.BLUETOOTH;
      case 'ethernet':
        return NetworkType.ETHERNET;
      case 'wimax':
        return NetworkType.WIMAX;
      case 'vpn':
        return NetworkType.VPN;
      case 'none':
        return NetworkType.NONE;
      case 'other':
        return NetworkType.OTHER;
      default:
        return NetworkType.UNKNOWN;
    }
  }

  private determineConnectionQuality(state: NetInfoState): ConnectionQuality {
    if (!state.isConnected) {
      return ConnectionQuality.OFFLINE;
    }

    // If internet is not reachable, quality is poor
    if (state.isInternetReachable === false) {
      return ConnectionQuality.POOR;
    }

    // WiFi quality determination
    if (state.type === 'wifi' && state.details?.strength !== undefined) {
      const strength = state.details.strength;
      if(!strength){
        return ConnectionQuality.UNKNOWN
      }
      if (strength >= 75) return ConnectionQuality.EXCELLENT;
      if (strength >= 50) return ConnectionQuality.GOOD;
      if (strength >= 25) return ConnectionQuality.MODERATE;
      return ConnectionQuality.POOR;
    }

    // Cellular quality determination
    if (state.type === 'cellular') {
      const generation = state.details?.cellularGeneration;
      if (generation === '5g') return ConnectionQuality.EXCELLENT;
      if (generation === '4g') return ConnectionQuality.GOOD;
      if (generation === '3g') return ConnectionQuality.MODERATE;
      if (generation === '2g') return ConnectionQuality.POOR;
    }

    // Default to good if connected with internet
    if (state.isInternetReachable === true) {
      return ConnectionQuality.GOOD;
    }

    return ConnectionQuality.UNKNOWN;
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentStatus));
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current status
    listener(this.currentStatus);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Start monitoring network changes
   */
  private startNetworkMonitoring(): void {
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      this.processNetworkState(state);
    });
  }

  /**
   * Stop monitoring network changes
   */
  private stopNetworkMonitoring(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = undefined;
    }
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if device is connected to internet
   */
  isConnected(): boolean {
    return this.currentStatus.isConnected;
  }

  /**
   * Check if internet is reachable
   */
  isInternetReachable(): boolean {
    return this.currentStatus.isInternetReachable === true;
  }

  /**
   * Check if connection is WiFi
   */
  isWifi(): boolean {
    return this.currentStatus.isWifi;
  }

  /**
   * Check if connection is cellular
   */
  isCellular(): boolean {
    return this.currentStatus.isCellular;
  }

  /**
   * Check if connection is expensive (metered)
   */
  isExpensive(): boolean {
    return this.currentStatus.isExpensive === true;
  }

  /**
   * Get connection quality
   */
  getQuality(): ConnectionQuality {
    return this.currentStatus.quality;
  }

  /**
   * Get network type
   */
  getType(): NetworkType {
    return this.currentStatus.type;
  }

  /**
   * Get detailed network information using expo-network
   */
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const [ipAddress, airplaneMode] = await Promise.all([
        Network.getIpAddressAsync().catch(() => undefined),
        Network.isAirplaneModeEnabledAsync().catch(() => false),
      ]);

      return {
        ipAddress,
        airplane: airplaneMode,
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        airplane: false,
      };
    }
  }

  /**
   * Get IP address
   */
  async getIpAddress(): Promise<string | null> {
    try {
      return await Network.getIpAddressAsync();
    } catch (error) {
      console.error('Error getting IP address:', error);
      return null;
    }
  }

  /**
   * Check if airplane mode is enabled
   */
  async isAirplaneModeEnabled(): Promise<boolean> {
    try {
      return await Network.isAirplaneModeEnabledAsync();
    } catch (error) {
      console.error('Error checking airplane mode:', error);
      return false;
    }
  }

  /**
   * Get network state type
   */
  async getNetworkStateType(): Promise<Network.NetworkState | Network.NetworkStateType> {
    try {
      return await Network.getNetworkStateAsync();
    } catch (error) {
      console.error('Error getting network state type:', error);
      return Network.NetworkStateType.UNKNOWN;
    }
  }

  /**
   * Ping a URL to check connectivity
   */
  async ping(url: string = this.PING_URLS[0], timeout: number = this.PING_TIMEOUT): Promise<{
    success: boolean;
    duration?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      return {
        success: response.ok,
        duration,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ping failed',
      };
    }
  }

  /**
   * Test internet connectivity by pinging multiple URLs
   */
  async testConnectivity(): Promise<{
    isReachable: boolean;
    averageLatency?: number;
    successfulPings: number;
    totalPings: number;
  }> {
    const results = await Promise.all(
      this.PING_URLS.map((url) => this.ping(url))
    );

    const successfulPings = results.filter((r) => r.success);
    const totalPings = results.length;
    const successCount = successfulPings.length;

    if (successCount === 0) {
      return {
        isReachable: false,
        successfulPings: 0,
        totalPings,
      };
    }

    const averageLatency =
      successfulPings.reduce((sum, r) => sum + (r.duration || 0), 0) / successCount;

    return {
      isReachable: true,
      averageLatency,
      successfulPings: successCount,
      totalPings,
    };
  }

  /**
   * Wait for internet connection
   */
  async waitForConnection(
    timeout: number = 30000,
    checkInterval: number = 1000
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const check = async () => {
        if (Date.now() - startTime >= timeout) {
          resolve(false);
          return;
        }

        const connected = await this.testConnectivity();
        if (connected.isReachable) {
          resolve(true);
          return;
        }

        setTimeout(check, checkInterval);
      };

      check();
    });
  }

  /**
   * Start periodic connection checks
   */
  startConnectionChecks(intervalSeconds: number = 60): void {
    this.stopConnectionChecks();

    this.connectionCheckInterval = setInterval(() => {
      this.testConnectivity().then((result) => {
        if (!result.isReachable && this.currentStatus.isInternetReachable) {
          // Update status if connectivity changed
          this.updateNetworkStatus();
        }
      });
    }, intervalSeconds * 1000);

    console.log(`Connection checks started (every ${intervalSeconds} seconds)`);
  }

  /**
   * Stop periodic connection checks
   */
  stopConnectionChecks(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = undefined;
      console.log('Connection checks stopped');
    }
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage(): string {
    const { isConnected, isInternetReachable, type, quality } = this.currentStatus;

    if (!isConnected) {
      return 'No network connection';
    }

    if (isInternetReachable === false) {
      return `Connected to ${type} but no internet access`;
    }

    const qualityText = quality !== ConnectionQuality.UNKNOWN ? ` (${quality})` : '';
    return `Connected via ${type}${qualityText}`;
  }

  /**
   * Check if good enough for specific operations
   */
  canPerformOperation(operation: 'light' | 'medium' | 'heavy'): boolean {
    if (!this.isConnected() || !this.isInternetReachable()) {
      return false;
    }

    const { quality, isExpensive } = this.currentStatus;

    switch (operation) {
      case 'light':
        // Light operations can work with any connection
        return quality !== ConnectionQuality.OFFLINE;

      case 'medium':
        // Medium operations need at least moderate quality
        return (
          quality === ConnectionQuality.EXCELLENT ||
          quality === ConnectionQuality.GOOD ||
          quality === ConnectionQuality.MODERATE
        );

      case 'heavy':
        // Heavy operations need good quality and preferably not expensive
        return (
          (quality === ConnectionQuality.EXCELLENT || quality === ConnectionQuality.GOOD) &&
          !isExpensive
        );

      default:
        return false;
    }
  }

  /**
   * Refresh network status
   */
  async refresh(): Promise<NetworkStatus> {
    await this.updateNetworkStatus();
    return this.getStatus();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopNetworkMonitoring();
    this.stopConnectionChecks();
    this.listeners.clear();
  }
}

export const networkService = new NetworkService();
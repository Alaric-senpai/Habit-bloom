import { useState, useEffect, useCallback } from 'react';
import {
  networkService,
  NetworkStatus,
  ConnectionQuality,
  NetworkType,
} from '@/lib/services/network';

/**
 * Hook to monitor network status
 */
export function useNetwork() {
  const [status, setStatus] = useState<NetworkStatus>(networkService.getStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = networkService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await networkService.refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    ...status,
    isRefreshing,
    refresh,
    statusMessage: networkService.getStatusMessage(),
  };
}

/**
 * Hook to check if internet is available
 */
export function useInternetConnection() {
  const [isConnected, setIsConnected] = useState(networkService.isInternetReachable());

  useEffect(() => {
    const unsubscribe = networkService.subscribe((status) => {
      setIsConnected(status.isInternetReachable === true);
    });
    return unsubscribe;
  }, []);

  return isConnected;
}

/**
 * Hook to check connection quality
 */
export function useConnectionQuality() {
  const [quality, setQuality] = useState<ConnectionQuality>(networkService.getQuality());

  useEffect(() => {
    const unsubscribe = networkService.subscribe((status) => {
      setQuality(status.quality);
    });
    return unsubscribe;
  }, []);

  const isGoodConnection = 
    quality === ConnectionQuality.EXCELLENT || 
    quality === ConnectionQuality.GOOD;

  return {
    quality,
    isGoodConnection,
    isOffline: quality === ConnectionQuality.OFFLINE,
  };
}

/**
 * Hook to check if connection is WiFi
 */
export function useIsWifi() {
  const [isWifi, setIsWifi] = useState(networkService.isWifi());

  useEffect(() => {
    const unsubscribe = networkService.subscribe((status) => {
      setIsWifi(status.isWifi);
    });
    return unsubscribe;
  }, []);

  return isWifi;
}

/**
 * Hook to warn about expensive connections
 */
export function useExpensiveConnection(options?: {
  warnOnCellular?: boolean;
  onExpensiveConnection?: () => void;
}) {
  const { warnOnCellular = true, onExpensiveConnection } = options || {};
  const [isExpensive, setIsExpensive] = useState(networkService.isExpensive());

  useEffect(() => {
    const unsubscribe = networkService.subscribe((status) => {
      const expensive = status.isExpensive || (warnOnCellular && status.isCellular);
      setIsExpensive(expensive);

      if (expensive && onExpensiveConnection) {
        onExpensiveConnection();
      }
    });
    return unsubscribe;
  }, [warnOnCellular, onExpensiveConnection]);

  return isExpensive;
}

/**
 * Hook to handle offline/online events
 */
export function useOnlineStatus(options?: {
  onOnline?: () => void;
  onOffline?: () => void;
}) {
  const { onOnline, onOffline } = options || {};
  const [isOnline, setIsOnline] = useState(networkService.isConnected());

  useEffect(() => {
    let wasOnline = networkService.isConnected();

    const unsubscribe = networkService.subscribe((status) => {
      const nowOnline = status.isConnected && status.isInternetReachable === true;
      
      if (nowOnline !== wasOnline) {
        if (nowOnline && onOnline) {
          onOnline();
        } else if (!nowOnline && onOffline) {
          onOffline();
        }
        wasOnline = nowOnline;
      }

      setIsOnline(nowOnline);
    });

    return unsubscribe;
  }, [onOnline, onOffline]);

  return isOnline;
}

/**
 * Hook to check if operations can be performed
 */
export function useCanPerformOperation(operation: 'light' | 'medium' | 'heavy') {
  const [canPerform, setCanPerform] = useState(
    networkService.canPerformOperation(operation)
  );

  useEffect(() => {
    const unsubscribe = networkService.subscribe(() => {
      setCanPerform(networkService.canPerformOperation(operation));
    });
    return unsubscribe;
  }, [operation]);

  return canPerform;
}

/**
 * Hook for network-aware data fetching
 */
export function useNetworkAwareFetch<T>(
  fetchFn: () => Promise<T>,
  options?: {
    requireWifi?: boolean;
    minQuality?: ConnectionQuality;
    autoFetch?: boolean;
    onError?: (error: Error) => void;
  }
) {
  const {
    requireWifi = false,
    minQuality = ConnectionQuality.MODERATE,
    autoFetch = true,
    onError,
  } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const canFetch = useCallback(() => {
    const status = networkService.getStatus();

    if (!status.isConnected || !status.isInternetReachable) {
      return false;
    }

    if (requireWifi && !status.isWifi) {
      return false;
    }

    const qualityOrder = [
      ConnectionQuality.OFFLINE,
      ConnectionQuality.POOR,
      ConnectionQuality.MODERATE,
      ConnectionQuality.GOOD,
      ConnectionQuality.EXCELLENT,
    ];

    const currentQualityIndex = qualityOrder.indexOf(status.quality);
    const minQualityIndex = qualityOrder.indexOf(minQuality);

    return currentQualityIndex >= minQualityIndex;
  }, [requireWifi, minQuality]);

  const fetch = useCallback(async () => {
    if (!canFetch()) {
      const err = new Error('Network conditions not suitable for this operation');
      setError(err);
      onError?.(err);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, canFetch, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    data,
    loading,
    error,
    refetch: fetch,
    canFetch: canFetch(),
  };
}
import { useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '@/services/api';

interface SSEOptions {
  enabled?: boolean;
  withCredentials?: boolean;
}

interface SSEMessage {
  type: string;
  payload: unknown;
}

/**
 * Hook to connect to Server-Sent Events endpoint.
 * Uses cookie-based authentication for SSE connections.
 */
export function useSSE<T = unknown>(
  url: string,
  options: SSEOptions = {}
): {
  data: T | null;
  error: Error | null;
  isConnected: boolean;
  reconnect: () => void;
} {
  const { enabled = true, withCredentials = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  // Store url/enabled in refs so the reconnect callback doesn't need to change
  const urlRef = useRef(url);
  const enabledRef = useRef(enabled);

  urlRef.current = url;
  enabledRef.current = enabled;

  const disconnect = useRef(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  });

  const connect = useRef(() => {
    if (!enabledRef.current || eventSourceRef.current) return;

    const eventSource = new EventSource(urlRef.current, { withCredentials });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
        if (message.type === 'update' || message.type === 'initial') {
          setData(message.payload as T);
        }
      } catch {
        setData(event.data as T);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError(new Error('SSE connection failed'));
      eventSource.close();
      eventSourceRef.current = null;

      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        if (enabledRef.current) {
          connect.current();
        }
      }, delay);
    };
  });

  const reconnect = useRef(() => {
    disconnect.current();
    reconnectAttemptsRef.current = 0;
    connect.current();
  });

  useEffect(() => {
    if (enabled) {
      connect.current();
    }
    return () => {
      disconnect.current();
    };
  }, [enabled]);

  return { data, error, isConnected, reconnect: reconnect.current };
}

/**
 * Hook specifically for live survey response count.
 */
export function useLiveResponseCount(surveyId: string, enabled = true) {
  const sseUrl = `${API_BASE_URL}/surveys/${surveyId}/live-responses`;

  const { data, error, isConnected } = useSSE<{ count: number; lastResponseAt?: string }>(
    sseUrl,
    { enabled: enabled && !!surveyId }
  );

  return {
    responseCount: data?.count ?? null,
    lastResponseAt: data?.lastResponseAt ?? null,
    error,
    isConnected,
  };
}

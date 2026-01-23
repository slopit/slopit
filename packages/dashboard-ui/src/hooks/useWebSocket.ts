/**
 * WebSocket hook for real-time dashboard updates.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  SessionNewEventData,
  SyncProgressEventData,
  VerdictComputedEventData,
  WebSocketEventType,
  WebSocketMessage,
} from "../types/index.js";

/**
 * WebSocket connection state.
 */
export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

/**
 * WebSocket hook options.
 */
export interface UseWebSocketOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onSessionNew?: (data: SessionNewEventData) => void;
  onVerdictComputed?: (data: VerdictComputedEventData) => void;
  onSyncProgress?: (data: SyncProgressEventData) => void;
  onError?: (error: Event) => void;
}

/**
 * WebSocket hook return value.
 */
export interface UseWebSocketReturn {
  connectionState: ConnectionState;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook for managing WebSocket connection to dashboard backend.
 *
 * @example
 * ```tsx
 * const { connectionState, lastMessage } = useWebSocket({
 *   url: "ws://localhost:8000/ws",
 *   onSessionNew: (data) => {
 *     console.log("New session:", data.sessionId);
 *   },
 *   onVerdictComputed: (data) => {
 *     console.log("Verdict:", data.verdict);
 *   },
 * });
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onSessionNew,
    onVerdictComputed,
    onSyncProgress,
    onError,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        setLastMessage(message);

        switch (message.type as WebSocketEventType) {
          case "session.new":
            onSessionNew?.(message.data as SessionNewEventData);
            break;
          case "verdict.computed":
            onVerdictComputed?.(message.data as VerdictComputedEventData);
            break;
          case "sync.progress":
            onSyncProgress?.(message.data as SyncProgressEventData);
            break;
        }
      } catch {
        console.error("Failed to parse WebSocket message:", event.data);
      }
    },
    [onSessionNew, onVerdictComputed, onSyncProgress],
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState("connected");
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = handleMessage;

    ws.onerror = (event) => {
      setConnectionState("error");
      onError?.(event);
    };

    ws.onclose = () => {
      setConnectionState("disconnected");
      wsRef.current = null;

      if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };
  }, [url, reconnect, reconnectInterval, maxReconnectAttempts, handleMessage, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent reconnection

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionState("disconnected");
  }, [maxReconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    connect,
    disconnect,
  };
}

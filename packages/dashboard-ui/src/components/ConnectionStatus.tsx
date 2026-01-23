/**
 * WebSocket connection status indicator.
 */

import type { ConnectionState } from "../hooks/useWebSocket.js";

export interface ConnectionStatusProps {
  state: ConnectionState;
  showLabel?: boolean;
}

/**
 * Visual indicator for WebSocket connection status.
 *
 * @example
 * ```tsx
 * const { connectionState } = useWebSocket({ url: "ws://..." });
 * <ConnectionStatus state={connectionState} showLabel />
 * ```
 */
export function ConnectionStatus({ state, showLabel = true }: ConnectionStatusProps) {
  const labels: Record<ConnectionState, string> = {
    connecting: "Connecting...",
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Connection Error",
  };

  return (
    <div className="slopit-connection-status">
      <span className={`slopit-connection-indicator slopit-connection-indicator--${state}`} />
      {showLabel && <span>{labels[state]}</span>}
    </div>
  );
}

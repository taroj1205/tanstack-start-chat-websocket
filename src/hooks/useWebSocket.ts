import { useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface WebSocketConfig {
  url: () => string;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  maxRetries?: number;
  connectionTimeout?: number;
}

interface WebSocketState {
  isConnected: boolean;
  retryCount: number;
  socket: WebSocket | null;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  maxRetries = 5,
  connectionTimeout = 5000,
}: WebSocketConfig) {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);

  const {
    data: wsState = { isConnected: false, retryCount: 0, socket: null },
  } = useQuery<WebSocketState>({
    queryKey: ["websocket", url()],
    queryFn: () => {
      if (socketRef.current) {
        if (
          socketRef.current.readyState === WebSocket.CONNECTING ||
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          socketRef.current.close();
        }
        socketRef.current = null;
      }

      const socket = new WebSocket(url());
      socketRef.current = socket;

      return new Promise<WebSocketState>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (socket.readyState === WebSocket.CONNECTING) {
            console.log("Connection attempt timed out");
            socket.close();
            reject(new Error("Connection timeout"));
          }
        }, connectionTimeout);

        socket.addEventListener("open", () => {
          clearTimeout(timeoutId);
          onOpen?.();
          resolve({ isConnected: true, retryCount: 0, socket });
        });

        socket.addEventListener("error", (error) => {
          console.error("WebSocket connection error:", error);
          clearTimeout(timeoutId);
          onError?.(error);
          reject(error);
        });

        socket.addEventListener("close", (event) => {
          clearTimeout(timeoutId);
          if (event.wasClean) {
            console.log("Clean connection close");
            onClose?.(event);
            resolve({ isConnected: false, retryCount: 0, socket: null });
            return;
          }

          const currentState = queryClient.getQueryData<WebSocketState>([
            "websocket",
            url(),
          ]) || {
            isConnected: false,
            retryCount: 0,
            socket: null,
          };

          const newRetryCount = currentState.retryCount + 1;
          if (newRetryCount <= maxRetries) {
            const backoffDelay = Math.min(
              1000 * Math.pow(2, currentState.retryCount),
              10000
            );
            console.log(
              `Reconnecting in ${backoffDelay}ms (attempt ${newRetryCount}/${maxRetries})`
            );
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["websocket", url()] });
            }, backoffDelay);
          } else {
            console.log("Max reconnection attempts reached");
            onClose?.(event);
            resolve({ isConnected: false, retryCount: 0, socket: null });
          }
        });

        socket.addEventListener("message", (event) => onMessage?.(event));
      });
    },
    retry: maxRetries,
    retryDelay: (attemptIndex) =>
      Math.min(1000 * Math.pow(2, attemptIndex), 10000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const connect = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["websocket", url()] });
  }, [queryClient, url]);

  const send = useCallback(
    (data: unknown) => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        console.log("WebSocket not ready, attempting to reconnect...");
        connect();
        return false;
      }

      try {
        socketRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error("Failed to send message:", error);
        connect();
        return false;
      }
    },
    [connect]
  );

  return {
    isConnected: wsState.isConnected,
    send,
    connect,
    retryCount: wsState.retryCount,
    maxRetries,
  };
}

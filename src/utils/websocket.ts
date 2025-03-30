import { SYSTEM_INFO } from "~/constants";
import { db } from "~/db";
import { Message } from "~/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";

export function useMessaging(url: () => string) {
  const ref = useRef<WebSocket | null>(null);
  const target = useRef(url);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    if (ref.current) {
      if (
        ref.current.readyState === WebSocket.CONNECTING ||
        ref.current.readyState === WebSocket.OPEN
      ) {
        ref.current.close();
      }
      ref.current = null;
    }

    const socket = new WebSocket(target.current());
    setIsConnected(false);

    const connectionTimeout = setTimeout(() => {
      if (socket.readyState === WebSocket.CONNECTING) {
        console.log("Connection attempt timed out");
        socket.close();
      }
    }, 5000);

    const handleOpen = () => {
      clearTimeout(connectionTimeout);
      setIsConnected(true);
      ref.current = socket;
      retryCount.current = 0;
    };

    const handleError = (error: Event) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
      clearTimeout(connectionTimeout);
      socket.close();
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("error", handleError);

    socket.addEventListener("close", () => {
      clearTimeout(connectionTimeout);
      setIsConnected(false);
      if (ref.current === socket) {
        ref.current = null;
      }
    });

    return socket;
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      return await db.messages.toArray();
    },
  });

  const { data: onlineCount = 0 } = useQuery({
    queryKey: ["onlineCount"],
    queryFn: () => Promise.resolve(0),
    enabled: false, // Initially disabled as it's updated via WebSocket
  });

  const { data: userId } = useQuery({
    queryKey: ["userId"],
    queryFn: async () => {
      const userId = localStorage.getItem("userId");
      console.log(userId);
      if (!userId) {
        const id = nanoid();
        localStorage.setItem("userId", id);
        return id;
      }
      return userId;
    },
  });

  useEffect(() => {
    const socket = connect();
    if (!socket) return;

    const controller = new AbortController();

    socket.addEventListener(
      "open",
      () => {
        console.log("Connection opened");
        setIsConnected(true);
        retryCount.current = 0;
      },
      controller
    );

    socket.addEventListener(
      "message",
      async (event) => {
        console.log("Incoming event:", event);
        const payload =
          typeof event.data === "string" ? event.data : await event.data.text();
        const data = JSON.parse(payload);

        if (("type" in data && data.type === "join") || data.type === "leave") {
          if (data.type === "join") {
            queryClient.setQueryData(
              ["onlineCount"],
              (old: number = 0) => old + 1
            );
          } else {
            queryClient.setQueryData(
              ["onlineCount"],
              (old: number = 0) => old - 1
            );
          }
          return;
        }

        const message = data as Message;
        console.log("Incoming message:", message);
        console.log(message.senderId, SYSTEM_INFO.senderId, message.text);
        if (message.senderId !== SYSTEM_INFO.senderId) {
          await db.messages.add(message);
        }
        queryClient.setQueryData(["messages"], (old: Message[] = []) => [
          ...old,
          message,
        ]);
      },
      controller
    );

    socket.addEventListener(
      "error",
      (error) => {
        console.error(
          "An error occurred while connecting to the server",
          error
        );
      },
      controller
    );

    socket.addEventListener(
      "close",
      (event) => {
        console.log("Connection closed", event.code, event.reason);
        setIsConnected(false);
        if (ref.current) {
          ref.current.close();
          ref.current = null;
        }

        // Don't attempt to reconnect if it was a clean close
        if (event.wasClean) {
          console.log("Clean connection close, not attempting to reconnect");
          return;
        }

        // Add exponential backoff for reconnection
        const backoffDelay = Math.min(
          1000 * Math.pow(2, retryCount.current),
          10000
        );
        retryCount.current++;

        if (retryCount.current <= maxRetries) {
          console.log(
            `Reconnecting in ${backoffDelay}ms (attempt ${retryCount.current}/${maxRetries})`
          );
          setTimeout(() => {
            connect();
          }, backoffDelay);
        } else {
          console.log("Max reconnection attempts reached");
          retryCount.current = 0;
        }
      },
      controller
    );

    return () => {
      controller.abort();
      if (ref.current) {
        ref.current.close();
        ref.current = null;
      }
    };
  }, [queryClient, connect]);

  const sendMessage = useCallback(
    async (message: Omit<Message, "id">) => {
      if (!ref.current || ref.current.readyState !== ref.current.OPEN) {
        console.log("WebSocket not ready, attempting to reconnect...");
        connect();
        return;
      }
      console.log("Outgoing message:", message);
      try {
        ref.current.send(JSON.stringify(message));
        const id = await db.messages.add(message);
        queryClient.setQueryData(["messages"], (old: Message[] = []) => [
          ...old,
          { id, ...message },
        ]);
      } catch (error) {
        console.error("Failed to send message:", error);
        setIsConnected(false);
        connect(); // Use connect instead of handleReconnect since it's not in scope
      }
    },
    [queryClient, connect]
  );

  return [
    messages,
    sendMessage,
    onlineCount,
    userId,
    isConnected,
    connect,
    retryCount.current,
    maxRetries,
  ] as const;
}

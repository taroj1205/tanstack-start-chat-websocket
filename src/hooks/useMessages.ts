import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotice } from "@yamada-ui/react";
import { nanoid } from "nanoid";
import { Message } from "~/types";
import { db } from "~/db";
import { SYSTEM_INFO } from "~/constants";
import { useWebSocket } from "./useWebSocket";
import { getMessages } from "~/db/hooks";

export function useMessages(wsUrl: () => string) {
  const queryClient = useQueryClient();
  const notice = useNotice({ variant: "subtle" });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      return getMessages();
    },
  });

  const { data: onlineCount = 1 } = useQuery({
    queryKey: ["onlineCount"],
    queryFn: () => Promise.resolve(0),
    enabled: false,
  });

  const { data: userId } = useQuery({
    queryKey: ["userId"],
    queryFn: async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        const id = nanoid();
        localStorage.setItem("userId", id);
        return id;
      }
      return userId;
    },
  });

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      const payload =
        typeof event.data === "string" ? event.data : await event.data.text();
      const data = JSON.parse(payload);

      if (("type" in data && data.type === "join") || data.type === "leave") {
        queryClient.setQueryData(["onlineCount"], () => data.count);
        return;
      }

      const message = data as Message;
      if (message.senderId !== SYSTEM_INFO.senderId) {
        await db.messages.add(message);
      }
      queryClient.setQueryData(["messages"], (old: Message[] = []) => [
        ...old,
        message,
      ]);
    },
    [queryClient]
  );

  const { isConnected, send, connect, retryCount, maxRetries } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: async ({ id }: { id: string }): Promise<void> => {
      await db.messages.update(id, {
        deletedAt: new Date().toISOString(),
      });
    },
    onSuccess: (_, { id }) => {
      queryClient.setQueryData(["messages"], (old: Message[] = []) =>
        old.filter((m) => m.id !== id)
      );
    },
    onError: (error) => {
      console.error("Failed to delete message:", error);
    },
  });

  const { mutate: handlePurge } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      await db.messages
        .where("senderId")
        .equals(userId)
        .modify({ deletedAt: new Date().toISOString() });
    },
    onSuccess: (_, { userId }) => {
      queryClient.setQueryData(["messages"], (old: Message[] = []) =>
        old.filter((m) => m.senderId !== userId)
      );
      notice({
        title: "Messages Purged",
        description: `All messages from ${userId} have been deleted.`,
        status: "success",
      });
    },
    onError: () => {
      notice({
        title: "Error",
        description: "Failed to purge messages.",
        status: "error",
      });
    },
  });

  const { mutate: sendMessage } = useMutation({
    mutationFn: async (message: Omit<Message, "id">) => {
      const success = send(message);
      if (success) {
        const id = await db.messages.add(message);
        return { id, ...message };
      }
      throw new Error("Failed to send message");
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(["messages"], (old: Message[] = []) => [
        ...old,
        newMessage,
      ]);
    },
  });

  return {
    messages,
    isMessagesLoading: isLoading,
    sendMessage,
    onlineCount,
    userId,
    isConnected,
    connect,
    retryCount,
    maxRetries,
    handleDelete,
    handlePurge,
  };
}

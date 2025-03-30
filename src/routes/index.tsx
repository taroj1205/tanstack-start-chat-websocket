import { createFileRoute } from "@tanstack/react-router";
import { For, ScrollArea, VStack, Box, IconButton } from "@yamada-ui/react";
import { useCallback, useEffect, useRef } from "react";
import { MessageInput } from "~/components/message-input";
import { MessageCard } from "~/components/message-card";
import { ArrowDownIcon } from "@yamada-ui/lucide";
import { useMessaging } from "~/utils/websocket";
import { SettingsModal } from "~/components/settings-modal";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const isProd = process.env.NODE_ENV === "production";
  const hostname = isProd ? "chat.poyo.jp" : "localhost:3000";
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);
  const wsUrl = `ws${isProd ? "s" : ""}://${hostname}/ws`;
  const [
    messages,
    sendMessage,
    onlineCount,
    userId,
    isConnected,
    connect,
    retryCount,
    maxRetries,
    handleDelete,
    handlePurge,
  ] = useMessaging(() => wsUrl);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollArea;
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 1;
    };

    scrollArea.addEventListener("scroll", handleScroll);
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (shouldScrollRef.current && scrollAreaRef.current) {
      handleScrollToBottom();
    }
  }, [messages, handleScrollToBottom]);

  return (
    <VStack w="full" maxH="100svh" overflowY="hidden">
      <ScrollArea
        innerProps={{ as: VStack, gap: "0" }}
        h="100svh"
        my="0"
        ref={scrollAreaRef}
      >
        <For each={messages}>
          {(message) => (
            <MessageCard
              key={message.id}
              message={message}
              userId={userId}
              handleDelete={handleDelete}
              handlePurge={handlePurge}
            />
          )}
        </For>
        <Box minH="20" w="full" px="1rem" />
      </ScrollArea>
      <VStack position="fixed" bottom="2xl" right="md" z={10} w="fit-content">
        <SettingsModal />
        <IconButton
          onClick={handleScrollToBottom}
          colorScheme="secondary"
          variant="subtle"
          rounded="full"
        >
          <ArrowDownIcon />
        </IconButton>
      </VStack>
      <MessageInput
        sendMessage={sendMessage}
        onlineCount={onlineCount}
        isConnected={isConnected}
        onReconnect={connect}
        retryCount={retryCount}
        maxRetries={maxRetries}
      />
    </VStack>
  );
}

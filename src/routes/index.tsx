import { createFileRoute } from "@tanstack/react-router"
import { VStack } from "@yamada-ui/react"
import { useEffect } from "react"
import { ControlButtons } from "~/components/control-buttons"
import { MessageInput } from "~/components/message-input"
import { MessageList } from "~/components/message-list"
import { useMessages } from "~/hooks/useMessages"
import { useScrollBehavior } from "~/hooks/useScrollBehavior"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  const isProd = process.env.NODE_ENV === "production"
  const hostname = isProd ? "chat.poyo.jp" : "localhost:3000"
  const wsUrl = `ws${isProd ? "s" : ""}://${hostname}/ws`

  const { scrollAreaRef, handleScrollToBottom, scrollToBottomIfNeeded } =
    useScrollBehavior()

  const {
    messages,
    isMessagesLoading,
    sendMessage,
    onlineCount,
    userId,
    isConnected,
    connect,
    retryCount,
    maxRetries,
    handleDelete,
    handlePurge,
  } = useMessages({
    wsUrl: () => wsUrl,
    scrollToBottom: scrollToBottomIfNeeded,
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies:  We want to scroll on message update
  useEffect(() => {
    scrollToBottomIfNeeded()
  }, [messages, scrollToBottomIfNeeded])

  return (
    <VStack w="full" maxH="100svh" overflowY="hidden">
      <MessageList
        messages={messages}
        isMessagesLoading={isMessagesLoading}
        userId={userId}
        handleDelete={handleDelete}
        handlePurge={handlePurge}
        scrollAreaRef={scrollAreaRef}
      />
      <ControlButtons handleScrollToBottom={handleScrollToBottom} />
      <MessageInput
        sendMessage={sendMessage}
        onlineCount={onlineCount}
        isConnected={isConnected}
        onReconnect={connect}
        retryCount={retryCount}
        maxRetries={maxRetries}
      />
    </VStack>
  )
}

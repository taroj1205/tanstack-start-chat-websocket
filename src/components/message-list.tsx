import {
  For,
  ScrollArea,
  VStack,
  Box,
  HStack,
  Skeleton,
  Card,
  CardBody,
} from "@yamada-ui/react";
import { MessageCard } from "./message-card";
import { Message } from "~/types";
import { memo } from "react";

interface MessageListProps {
  messages: Message[];
  isMessagesLoading: boolean;
  userId: string | undefined;
  handleDelete: (params: { id: string }) => void;
  handlePurge: (params: { userId: string }) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList = memo(function MessageList({
  messages,
  isMessagesLoading,
  userId,
  handleDelete,
  handlePurge,
  scrollAreaRef,
}: MessageListProps) {
  return (
    <ScrollArea
      innerProps={{ as: VStack, gap: "0" }}
      h="100svh"
      my="0"
      ref={scrollAreaRef}
    >
      {isMessagesLoading ? (
        <VStack w="full" gap="0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} w="full" variant="unstyled" p="0">
              <CardBody py="sm" px="md">
                <HStack w="full" align="flex-start" gap="md">
                  <Skeleton rounded="full" w="40px" h="40px" />
                  <VStack align="start" flex={1} gap="1">
                    <HStack w="full" justify="space-between" align="center">
                      <HStack gap="2">
                        <Skeleton w="120px" h="16px" />
                      </HStack>
                    </HStack>
                    <Skeleton w="90%" h="16px" />
                    <Skeleton w="60%" h="16px" />
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : (
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
      )}
      <Box minH="20" w="full" px="1rem" />
    </ScrollArea>
  );
});

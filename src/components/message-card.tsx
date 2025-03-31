import type { UseMutateFunction } from "@tanstack/react-query"
import {
  CheckCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  CloudOffIcon,
  EyeIcon,
  FileIcon,
} from "@yamada-ui/lucide"
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  ContextMenu,
  ContextMenuTrigger,
  HStack,
  Icon,
  Image,
  Link,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
  Skeleton,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
} from "@yamada-ui/react"
import { format, isValid } from "date-fns"
import { type FC, memo, useCallback } from "react"
import type { Message } from "~/types"

interface MessageCardProps {
  message: Message
  userId: string | undefined
  handleDelete: UseMutateFunction<
    void,
    Error,
    {
      id: string
    },
    unknown
  >
  handlePurge: UseMutateFunction<
    void,
    Error,
    {
      userId: string
    },
    unknown
  >
}

export const MessageCard: FC<MessageCardProps> = memo(
  ({ message, userId, handleDelete, handlePurge }) => {
    const { open, onClose, onOpen } = useDisclosure()
    const isOwnMessage = message.senderId === userId

    // Format createdAt safely
    const formattedTime =
      message.createdAt && isValid(new Date(message.createdAt))
        ? format(new Date(message.createdAt), "h:mm a")
        : ""

    const formattedDate =
      message.createdAt && isValid(new Date(message.createdAt))
        ? format(new Date(message.createdAt), "PPpp")
        : ""

    // Status icons
    const statusIcons = {
      sent: (
        <CheckIcon
          boxSize="xs"
          color={isOwnMessage ? ["blue", "blue.300"] : ["gray", "gray.400"]}
        />
      ),
      delivered: (
        <CheckCheckIcon
          boxSize="xs"
          color={isOwnMessage ? ["blue", "blue.300"] : ["gray", "gray.400"]}
        />
      ),
      seen: (
        <EyeIcon
          boxSize="xs"
          color={isOwnMessage ? ["blue", "blue.300"] : ["gray", "gray.400"]}
        />
      ),
      error: <CircleAlertIcon boxSize="xs" color="danger" />,
    }

    return (
      <ContextMenu>
        <ContextMenuTrigger
          as={HStack}
          w="full"
          align="flex-start"
          gap="md"
          py="sm"
          px="md"
          _hover={{
            bg: ["blackAlpha.100", "whiteAlpha.50"],
          }}
          transition="background 0.2s ease"
          borderRadius="md"
          cursor="context-menu"
        >
          {/* Avatar always on the left */}
          <Avatar
            name={message.senderName || "User"}
            size="sm"
            colorScheme={isOwnMessage ? "primary" : "gray"}
            opacity={isOwnMessage ? 0.9 : 1}
          />

          {/* Message content */}
          <VStack align="flex-start" gap="xs" minW={0}>
            {/* Header with name, time and status */}
            <HStack w="full" gap="sm">
              <HStack gap="sm">
                <Text
                  fontWeight="medium"
                  fontSize="sm"
                  color={isOwnMessage ? "primary" : "gray"}
                >
                  {message.senderName}
                </Text>

                {message.isLocal && (
                  <Tooltip label="Saving locally">
                    <Icon as={CloudOffIcon} boxSize="xs" color="warning" />
                  </Tooltip>
                )}
              </HStack>

              <HStack gap="xs">
                {message.status && statusIcons[message.status]}

                <Tooltip label={formattedDate} placement="top">
                  <Text
                    fontSize="xs"
                    color={isOwnMessage ? ["primary", "primary.300"] : "muted"}
                    whiteSpace="nowrap"
                  >
                    {formattedTime}
                  </Text>
                </Tooltip>
              </HStack>
            </HStack>

            {/* Message bubble */}
            <Card
              bg={
                isOwnMessage
                  ? ["primary.50", "primary.900"]
                  : ["blackAlpha.200", "whiteAlpha.50"]
              }
              borderWidth={1}
              borderColor={
                isOwnMessage
                  ? ["primary.200", "primary.700"]
                  : ["gray.200", "gray.700"]
              }
              borderRadius="lg"
              overflow="hidden"
              maxW="95%"
              boxShadow="sm"
            >
              <CardBody py="sm" px="md">
                {/* Message text */}
                {message.text && (
                  <Text
                    wordBreak="break-word"
                    whiteSpace="pre-wrap"
                    color={["gray.800", "whiteAlpha.900"]}
                  >
                    {message.text}
                  </Text>
                )}

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <VStack
                    align="flex-start"
                    w="full"
                    gap="sm"
                    paddingTop={message.text ? "sm" : 0}
                  >
                    {message.text && <Separator />}

                    {message.attachments.map((attachment) => (
                      <Box key={attachment.url || attachment.name} w="full">
                        {attachment.type === "image" ? (
                          <VStack align="flex-start" gap="xs">
                            <Image
                              src={attachment.url}
                              alt={`Image: ${attachment.name || "Attachment"}`}
                              borderRadius="md"
                              maxH="200px"
                              objectFit="cover"
                              w="auto"
                              fallback={
                                <Skeleton
                                  h="120px"
                                  w="200px"
                                  borderRadius="md"
                                />
                              }
                              loading="lazy"
                              transition="transform 0.3s ease"
                              _hover={{
                                transform: "scale(1.02)",
                              }}
                            />
                            <Text
                              fontSize="xs"
                              color={
                                isOwnMessage
                                  ? ["primary", "primary.300"]
                                  : ["gray", "gray.400"]
                              }
                            >
                              {attachment.name || "Image"}
                              {attachment.size && (
                                <> · {Math.round(attachment.size / 1024)} KB</>
                              )}
                            </Text>
                          </VStack>
                        ) : (
                          <Link
                            href={attachment.url}
                            external
                            display="flex"
                            alignItems="center"
                            gap="sm"
                            p="sm"
                            borderRadius="md"
                            bg={["blackAlpha.50", "whiteAlpha.50"]}
                            _hover={{
                              bg: ["blackAlpha.100", "whiteAlpha.100"],
                              textDecoration: "none",
                            }}
                            transition="all 0.2s"
                            title={attachment.name}
                          >
                            <Icon
                              as={FileIcon}
                              color={
                                isOwnMessage
                                  ? ["primary", "primary.300"]
                                  : ["gray", "gray.400"]
                              }
                              boxSize="md"
                            />
                            <VStack
                              align="flex-start"
                              gap={0}
                              flex={1}
                              minW={0}
                            >
                              <Text
                                fontSize="sm"
                                fontWeight="medium"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                w="full"
                              >
                                {attachment.name || "File"}
                              </Text>
                              {attachment.size && (
                                <Text
                                  fontSize="xs"
                                  color={
                                    isOwnMessage
                                      ? ["primary", "primary.300"]
                                      : ["gray", "gray.400"]
                                  }
                                >
                                  {Math.round(attachment.size / 1024)} KB
                                </Text>
                              )}
                            </VStack>
                          </Link>
                        )}
                      </Box>
                    ))}
                  </VStack>
                )}

                {/* Error message */}
                {message.status === "error" && (
                  <Text color="danger" fontSize="xs" paddingTop="xs">
                    Message failed to send. Tap to retry.
                  </Text>
                )}
              </CardBody>
            </Card>
          </VStack>
        </ContextMenuTrigger>

        <MenuList>
          <MenuItem
            color="danger"
            onClick={() => handleDelete({ id: message.id })}
          >
            Delete
          </MenuItem>
          <MenuItem
            color="danger"
            onClick={() => {
              onOpen()
            }}
          >
            Purge User Messages
          </MenuItem>
        </MenuList>

        <Modal open={open} onClose={onClose}>
          <ModalHeader>Confirm Purge Messages</ModalHeader>
          <ModalBody>
            Are you sure you want to delete all messages from{" "}
            {message.senderName}? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              colorScheme="danger"
              onClick={async () => {
                await handlePurge({ userId: message.senderId })
                onClose()
              }}
            >
              Purge
            </Button>
          </ModalFooter>
        </Modal>
      </ContextMenu>
    )
  },
)

MessageCard.displayName = "MessageCard"

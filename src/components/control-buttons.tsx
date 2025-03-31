import { ArrowDownIcon } from "@yamada-ui/lucide"
import { IconButton, VStack } from "@yamada-ui/react"
import { memo } from "react"
import { SettingsModal } from "./settings-modal"

interface ControlButtonsProps {
  handleScrollToBottom: () => void
}

export const ControlButtons = memo(function ControlButtons({
  handleScrollToBottom,
}: ControlButtonsProps) {
  return (
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
  )
})

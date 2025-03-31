import { VStack, IconButton } from "@yamada-ui/react";
import { ArrowDownIcon } from "@yamada-ui/lucide";
import { SettingsModal } from "./settings-modal";
import { memo } from "react";

interface ControlButtonsProps {
  handleScrollToBottom: () => void;
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
  );
});

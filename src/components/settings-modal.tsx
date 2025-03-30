import { CogIcon } from "@yamada-ui/lucide";
import {
  IconButton,
  Modal,
  ModalBody,
  ModalHeader,
  useDisclosure,
  VStack,
  FormControl,
  Input,
  Button,
  Center,
  ModalFooter,
} from "@yamada-ui/react";
import { memo, useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { db } from "~/db";
import { nanoid } from "nanoid";
import { ReactNode } from "@tanstack/react-router";

export const SettingsModal = memo(() => {
  const { open, onClose, onOpen } = useDisclosure();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createNewUser = useCallback(async () => {
    const newId = nanoid();
    await db.users.add({
      id: newId,
      username: "User",
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "online",
    });
    setUserId(newId);
    return newId;
  }, []);

  const checkUserId = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      const newId = await createNewUser();
      localStorage.setItem("userId", newId);
      return newId;
    }
    const user = await db.users.where("id").equals(userId).first();
    if (!user) {
      const newId = await createNewUser();
      localStorage.setItem("userId", newId);
      return newId;
    }
    setUserId(userId);
    return userId;
  }, [createNewUser]);

  useEffect(() => {
    checkUserId();
  }, [checkUserId]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser", userId],
    queryFn: async () => {
      if (!userId) return null;
      return await db.users.where("id").equals(userId).first();
    },
    enabled: !!userId,
  });

  const form = useForm({
    defaultValues: {
      username: currentUser?.username || "",
    },
    onSubmit: async ({ value }) => {
      if (!userId || !value.username.trim() || isLoading) return;

      setIsLoading(true);
      try {
        await db.users.where("id").equals(userId).modify({
          username: value.username.trim(),
          updatedAt: new Date().toISOString(),
        });
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        onClose();
      } catch (error) {
        console.error("Failed to update username:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const formErrors = useStore(form.store, (formState) => formState.errors);

  return (
    <>
      <IconButton
        onClick={onOpen}
        colorScheme="secondary"
        variant="subtle"
        rounded="full"
      >
        <CogIcon />
      </IconButton>
      <Modal
        open={open}
        onClose={onClose}
        size="xl"
        as="form"
        onSubmit={(e) => {
          console.log("form submitted");
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <ModalHeader>Settings</ModalHeader>
        <ModalBody>
          <Center p="md" w="full">
            <VStack gap="md">
              {formErrors.map((error) => (
                <FormControl key={error} errorMessage={error as ReactNode} />
              ))}
              <form.Field
                name="username"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return "Username is required";
                    if (value.length < 2)
                      return "Username must be at least 2 characters";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <FormControl
                    label="Username"
                    errorMessage={field.state.meta.errors?.[0]}
                  >
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter new username"
                      disabled={isLoading}
                    />
                  </FormControl>
                )}
              </form.Field>
            </VStack>
          </Center>
        </ModalBody>
        <ModalFooter>
          <form.Subscribe
            selector={(formState) => [
              formState.canSubmit,
              formState.isSubmitting,
            ]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isLoading}
                colorScheme="primary"
                loading={isLoading || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </form.Subscribe>
        </ModalFooter>
      </Modal>
    </>
  );
});

SettingsModal.displayName = "SettingsModal";

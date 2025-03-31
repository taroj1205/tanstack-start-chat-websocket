import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Container, Center, HStack, VStack, Button } from "@yamada-ui/react";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error("DefaultCatchBoundary Error:", error);

  return (
    <Container minW="0" flex="1" p="lg">
      <Center>
        <VStack gap="lg">
          <ErrorComponent error={error} />
          <HStack gap="sm" alignItems="center" flexWrap="wrap">
            <Button
              onClick={() => {
                router.invalidate();
              }}
              colorScheme="gray"
              textTransform="uppercase"
              fontWeight="black"
              size="sm"
            >
              Try Again
            </Button>
            {isRoot ? (
              <Button
                as={Link}
                to="/"
                colorScheme="gray"
                textTransform="uppercase"
                fontWeight="black"
                size="sm"
              >
                Home
              </Button>
            ) : (
              <Button
                as={Link}
                to="/"
                colorScheme="gray"
                textTransform="uppercase"
                fontWeight="black"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
              >
                Go Back
              </Button>
            )}
          </HStack>
        </VStack>
      </Center>
    </Container>
  );
}

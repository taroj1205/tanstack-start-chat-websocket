import { Link } from "@tanstack/react-router";
import {
  Box,
  Button,
  Center,
  Heading,
  Text,
  VStack,
  Wrap,
} from "@yamada-ui/react";

export function NotFound({ children }: { children?: any }) {
  return (
    <Center as={VStack} gap="lg" minH="100svh">
      <Heading size="4xl" lineHeight={1}>
        404
      </Heading>
      <Center as={VStack}>
        <Text color="muted">
          {children || (
            <Text>The page you are looking for does not exist.</Text>
          )}
        </Text>
        <Wrap gap="sm">
          <Button
            onClick={() => window.history.back()}
            colorScheme="green"
            textTransform="uppercase"
            fontWeight="black"
            size="sm"
          >
            Go back
          </Button>
          <Button
            as={Link}
            to="/"
            colorScheme="cyan"
            textTransform="uppercase"
            fontWeight="black"
            size="sm"
          >
            Start Over
          </Button>
        </Wrap>
      </Center>
    </Center>
  );
}

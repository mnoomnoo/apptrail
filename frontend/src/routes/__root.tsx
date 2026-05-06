import { Box, Flex, HStack, Text } from "@chakra-ui/react"
import { Outlet, NavLink } from "react-router-dom"

export function RootLayout() {
  return (
    <Box minH="100vh" bg="gray.950">
      <Box as="nav" bg="gray.900" borderBottomWidth="1px" borderColor="gray.800" px={6} py={3}>
        <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
          <Text fontWeight="bold" fontSize="lg" color="white" letterSpacing="tight">
            AppTrail
          </Text>
          <HStack gap={6}>
            <NavLink to="/jobs">
              {({ isActive }) => (
                <Text
                  color={isActive ? "blue.300" : "gray.400"}
                  fontWeight={isActive ? "semibold" : "normal"}
                  _hover={{ color: "white" }}
                  transition="color 0.15s"
                >
                  Jobs
                </Text>
              )}
            </NavLink>
            <NavLink to="/resumes">
              {({ isActive }) => (
                <Text
                  color={isActive ? "blue.300" : "gray.400"}
                  fontWeight={isActive ? "semibold" : "normal"}
                  _hover={{ color: "white" }}
                  transition="color 0.15s"
                >
                  Resumes
                </Text>
              )}
            </NavLink>
          </HStack>
        </Flex>
      </Box>
      <Box maxW="1200px" mx="auto" px={6} py={8}>
        <Outlet />
      </Box>
    </Box>
  )
}

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function RootLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <Box minH="100vh" bg="gray.950">
      <Box as="nav" bg="gray.900" borderBottomWidth="1px" borderColor="gray.800" px={6} py={3}>
        <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
          <HStack gap={2}>
            <img src="/favicon.svg" alt="" width="24" height="24" />
            <Text fontWeight="bold" fontSize="lg" color="white" letterSpacing="tight">
              AppTrail
            </Text>
          </HStack>
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
            <NavLink to="/settings">
              {({ isActive }) => (
                <Text
                  color={isActive ? "blue.300" : "gray.400"}
                  fontWeight={isActive ? "semibold" : "normal"}
                  _hover={{ color: "white" }}
                  transition="color 0.15s"
                >
                  Settings
                </Text>
              )}
            </NavLink>
            <Button size="sm" variant="ghost" colorPalette="gray" onClick={handleLogout}>
              Sign Out
            </Button>
          </HStack>
        </Flex>
      </Box>
      <Box maxW="1200px" mx="auto" px={6} py={8}>
        <Outlet />
      </Box>
    </Box>
  )
}

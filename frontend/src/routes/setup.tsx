import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react"
import { setupCredentials } from "../client/auth"
import { toaster } from "../components/ui/toaster"

export function SetupPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setConfirmError("Passwords do not match")
      return
    }
    setConfirmError("")
    setLoading(true)
    try {
      await setupCredentials({ username, password })
      toaster.create({ type: "success", title: "Account created — please sign in" })
      navigate("/login", { replace: true })
    } catch {
      toaster.create({ type: "error", title: "Setup failed, please try again" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
      <Box
        bg="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
        borderRadius="xl"
        p={8}
        w="full"
        maxW="360px"
      >
        <Text fontWeight="bold" fontSize="2xl" color="white" mb={1} textAlign="center">
          AppTrail
        </Text>
        <Text color="gray.500" fontSize="sm" mb={6} textAlign="center">
          Create your account to get started
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <Box w="full">
              <Text mb={1} fontSize="sm" color="gray.400">
                Username
              </Text>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                autoComplete="username"
                required
              />
            </Box>
            <Box w="full">
              <Text mb={1} fontSize="sm" color="gray.400">
                Password
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </Box>
            <Box w="full">
              <Text mb={1} fontSize="sm" color="gray.400">
                Confirm Password
              </Text>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value)
                  if (confirmError) setConfirmError("")
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              {confirmError && (
                <Text mt={1} fontSize="xs" color="red.400">
                  {confirmError}
                </Text>
              )}
            </Box>
            <Button type="submit" colorPalette="blue" w="full" loading={loading} mt={2}>
              Create Account
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  )
}

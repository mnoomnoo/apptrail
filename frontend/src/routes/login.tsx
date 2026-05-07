import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react"
import { login as apiLogin } from "../client/auth"
import { useAuth } from "../context/AuthContext"
import { toaster } from "../components/ui/toaster"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { access_token } = await apiLogin(username, password)
      login(access_token)
      navigate("/jobs", { replace: true })
    } catch {
      toaster.create({ type: "error", title: "Invalid username or password" })
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
          Sign in to continue
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
                autoComplete="current-password"
                required
              />
            </Box>
            <Button type="submit" colorPalette="blue" w="full" loading={loading} mt={2}>
              Sign In
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  )
}

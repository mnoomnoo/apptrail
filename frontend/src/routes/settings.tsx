import { useRef, useState } from "react"
import { Box, Button, HStack, Input, Text, VStack } from "@chakra-ui/react"
import pkg from "../../package.json"
import { generateCredentials } from "../client/auth"
import { useAuth } from "../context/AuthContext"
import { toaster } from "../components/ui/toaster"

function CopyableValue({ value, label }: { value: string; label: string }) {
  async function copy() {
    await navigator.clipboard.writeText(value)
    toaster.create({ type: "success", title: `${label} copied to clipboard` })
  }

  return (
    <Box w="full">
      <Text mb={1} fontSize="sm" color="gray.400">
        {label}
      </Text>
      <HStack gap={2}>
        <Input value={value} readOnly fontFamily="mono" fontSize="xs" color="green.300" />
        <Button size="sm" variant="outline" colorPalette="gray" flexShrink={0} onClick={copy}>
          Copy
        </Button>
      </HStack>
      <Text mt={2} fontSize="xs" color="gray.500">
        Copy this value into your <code>.env</code> file and restart the server for it to take
        effect.
      </Text>
    </Box>
  )
}

function ChangePasswordSection() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [hash, setHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const confirmRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toaster.create({ type: "error", title: "Passwords do not match" })
      confirmRef.current?.focus()
      return
    }
    setLoading(true)
    try {
      const res = await generateCredentials({ new_password: password })
      setHash(res.password_hash ?? null)
      setPassword("")
      setConfirm("")
    } catch {
      toaster.create({ type: "error", title: "Failed to generate hash" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box bg="gray.900" borderWidth="1px" borderColor="gray.800" borderRadius="xl" p={6}>
      <Text fontWeight="semibold" fontSize="lg" color="white" mb={4}>
        Change Password
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">
              New Password
            </Text>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Box>
          <Box>
            <Text mb={1} fontSize="sm" color="gray.400">
              Confirm Password
            </Text>
            <Input
              ref={confirmRef}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Box>
          <Button type="submit" colorPalette="blue" loading={loading}>
            Generate Hash
          </Button>
        </VStack>
      </form>
      {hash && (
        <Box mt={6}>
          <CopyableValue value={hash} label="AUTH_PASSWORD_HASH" />
        </Box>
      )}
    </Box>
  )
}

function RegenerateKeySection() {
  const [key, setKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await generateCredentials({ regenerate_key: true })
      setKey(res.secret_key ?? null)
    } catch {
      toaster.create({ type: "error", title: "Failed to generate key" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box bg="gray.900" borderWidth="1px" borderColor="gray.800" borderRadius="xl" p={6}>
      <Text fontWeight="semibold" fontSize="lg" color="white" mb={1}>
        Secret Key
      </Text>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Rotating the key invalidates all active sessions on next restart.
      </Text>
      <Button colorPalette="gray" variant="outline" loading={loading} onClick={handleGenerate}>
        Generate New Key
      </Button>
      {key && (
        <Box mt={6}>
          <CopyableValue value={key} label="AUTH_SECRET_KEY" />
        </Box>
      )}
    </Box>
  )
}

export function SettingsPage() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return null

  return (
    <Box>
      <Text fontWeight="bold" fontSize="2xl" color="white" mb={6}>
        Settings
      </Text>
      <VStack gap={6} align="stretch" maxW="600px">
        <ChangePasswordSection />
        <RegenerateKeySection />
        <Box bg="gray.900" borderWidth="1px" borderColor="gray.800" borderRadius="xl" p={6}>
          <Text fontWeight="semibold" fontSize="lg" color="white" mb={1}>
            About
          </Text>
          <Text fontSize="sm" color="gray.500">
            AppTrail v{pkg.version}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

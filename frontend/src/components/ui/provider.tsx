import { ChakraProvider, Theme, createSystem, defaultConfig } from "@chakra-ui/react"

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {},
    },
  },
  globalCss: {
    "html, body": {
      colorScheme: "dark",
      bg: "gray.950",
    },
  },
})

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <Theme appearance="dark">
        {children}
      </Theme>
    </ChakraProvider>
  )
}

import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react"
import React from "react"

interface TooltipProps {
  content: string
  children: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <ChakraTooltip.Root openDelay={300} closeDelay={100}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content maxW="300px" whiteSpace="pre-wrap">
            {content}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  )
}

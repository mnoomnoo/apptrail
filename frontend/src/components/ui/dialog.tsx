import { Dialog as ChakraDialog, Portal } from "@chakra-ui/react"
import React from "react"

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export function Dialog({ open, onClose, title, children, footer, size = "md" }: DialogProps) {
  return (
    <ChakraDialog.Root
      open={open}
      onOpenChange={(e: { open: boolean }) => { if (!e.open) onClose() }}
      size={size}
    >
      <Portal>
        <ChakraDialog.Backdrop />
        <ChakraDialog.Positioner>
          <ChakraDialog.Content>
            <ChakraDialog.Header>
              <ChakraDialog.Title>{title}</ChakraDialog.Title>
            </ChakraDialog.Header>
            <ChakraDialog.Body overflowY="auto" maxH="75vh">{children}</ChakraDialog.Body>
            {footer && <ChakraDialog.Footer>{footer}</ChakraDialog.Footer>}
            <ChakraDialog.CloseTrigger asChild>
              <button
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </ChakraDialog.CloseTrigger>
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  )
}

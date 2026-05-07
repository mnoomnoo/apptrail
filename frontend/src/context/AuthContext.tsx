import { createContext, useCallback, useContext, useState } from "react"
import { clearToken, getToken, setToken } from "../client/auth"

interface AuthContextValue {
  isLoggedIn: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken())

  const login = useCallback((token: string) => {
    setToken(token)
    setIsLoggedIn(true)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setIsLoggedIn(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

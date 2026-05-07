import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "./components/ui/provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { RootLayout } from "./routes/__root"
import { LoginPage } from "./routes/login"
import { JobsPage } from "./routes/jobs"
import { ResumesPage } from "./routes/resumes"
import { SettingsPage } from "./routes/settings"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <RootLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/jobs" replace />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/resumes" element={<ResumesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)

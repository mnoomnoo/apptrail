import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "./components/ui/provider"
import { Toaster } from "./components/ui/toaster"
import { RootLayout } from "./routes/__root"
import { JobsPage } from "./routes/jobs"
import { ResumesPage } from "./routes/resumes"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<Navigate to="/jobs" replace />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/resumes" element={<ResumesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)

import api from "./index"

export interface TokenResponse {
  access_token: string
  token_type: string
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const params = new URLSearchParams()
  params.append("username", username)
  params.append("password", password)
  const res = await api.post<TokenResponse>("/auth/token", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  return res.data
}

export async function checkStatus(): Promise<{ needs_setup: boolean }> {
  const res = await api.get<{ needs_setup: boolean }>("/auth/status")
  return res.data
}

export interface SetupRequest {
  username: string
  password: string
}

export async function setupCredentials(body: SetupRequest): Promise<void> {
  await api.post("/auth/setup", body)
}

const TOKEN_KEY = "apptrail_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export interface GenerateCredentialsRequest {
  new_password?: string
  regenerate_key?: boolean
}

export interface GenerateCredentialsResponse {
  password_hash?: string
  secret_key?: string
}

export async function generateCredentials(
  body: GenerateCredentialsRequest,
): Promise<GenerateCredentialsResponse> {
  const res = await api.post<GenerateCredentialsResponse>("/auth/generate-credentials", body)
  return res.data
}

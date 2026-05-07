import axios from "axios"
import { getToken, clearToken } from "./auth"

const api = axios.create({ baseURL: "/api/v1" })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
      clearToken()
      window.location.href = "/login"
    }
    return Promise.reject(err)
  },
)

export default api

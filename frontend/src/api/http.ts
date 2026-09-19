import axios, { AxiosError } from 'axios'

import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export type FieldErrors = Record<string, string>

export class ApiError extends Error {
  status: number
  fieldErrors: FieldErrors

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface ValidationIssue {
  type?: string
  loc?: (string | number)[]
  ctx?: { min_length?: number; max_length?: number }
}

function describeIssue(issue: ValidationIssue): string {
  switch (issue.type) {
    case 'string_too_short':
      return `Минимум ${issue.ctx?.min_length ?? 1} симв.`
    case 'string_too_long':
      return `Максимум ${issue.ctx?.max_length ?? ''} симв.`
    case 'missing':
      return 'Обязательное поле'
    case 'time_parsing':
    case 'time_type':
      return 'Неверный формат времени'
    default:
      return 'Проверьте значение'
  }
}

/** Maps FastAPI's 422 payload ({detail: [{loc, type, ctx}]}) to {field: message}. */
function toFieldErrors(detail: unknown): FieldErrors {
  if (!Array.isArray(detail)) return {}
  const result: FieldErrors = {}
  for (const issue of detail as ValidationIssue[]) {
    const field = String(issue.loc?.[issue.loc.length - 1] ?? 'form')
    result[field] ??= describeIssue(issue)
  }
  return result
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

const FALLBACK_MESSAGE = 'Что-то пошло не так. Попробуйте ещё раз.'
const NETWORK_MESSAGE = 'Нет связи с сервером. Проверьте соединение.'
const VALIDATION_MESSAGE = 'Проверьте введённые данные.'

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status ?? 0
    const detail = error.response?.data?.detail

    if (import.meta.env.DEV) console.debug('[api]', error.config?.method, error.config?.url, status, detail)

    if (status === 401) {
      const authStore = useAuthStore()
      const wasAuthenticated = authStore.isAuthenticated
      authStore.clearSession()
      if (wasAuthenticated) router.push({ name: 'auth' })
    }

    if (status === 0) return Promise.reject(new ApiError(NETWORK_MESSAGE, 0))
    if (status === 422) return Promise.reject(new ApiError(VALIDATION_MESSAGE, 422, toFieldErrors(detail)))

    const message = typeof detail === 'string' ? detail : FALLBACK_MESSAGE
    return Promise.reject(new ApiError(message, status))
  },
)

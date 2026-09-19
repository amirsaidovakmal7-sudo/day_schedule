import { http } from '@/api/http'
import type { AuthTokenResponse, User } from '@/types/api'

export function register(username: string, password: string) {
  return http.post<User>('/auth/register', { username, password }).then((r) => r.data)
}

export function login(username: string, password: string) {
  return http.post<AuthTokenResponse>('/auth/login', { username, password }).then((r) => r.data)
}

export function logout() {
  return http.post<void>('/auth/logout').then((r) => r.data)
}

export function fetchMe() {
  return http.get<User>('/auth/me').then((r) => r.data)
}

export function updateUsername(username: string) {
  return http.put<User>('/auth/username', { username }).then((r) => r.data)
}

export function updatePassword(oldPassword: string, newPassword: string) {
  return http
    .put<void>('/auth/password', { old_password: oldPassword, new_password: newPassword })
    .then((r) => r.data)
}

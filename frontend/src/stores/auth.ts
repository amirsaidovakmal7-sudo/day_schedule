import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import * as authApi from '@/api/auth'
import type { User } from '@/types/api'

const TOKEN_STORAGE_KEY = 'day-diary:token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function setToken(value: string | null) {
    token.value = value
    if (value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, value)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }

  function clearSession() {
    setToken(null)
    user.value = null
  }

  async function register(username: string, password: string) {
    await authApi.register(username, password)
    await login(username, password)
  }

  async function login(username: string, password: string) {
    const { access_token } = await authApi.login(username, password)
    setToken(access_token)
    user.value = await authApi.fetchMe()
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }

  async function restoreSession() {
    if (!token.value) return
    try {
      user.value = await authApi.fetchMe()
    } catch {
      clearSession()
    }
  }

  async function changeUsername(username: string) {
    user.value = await authApi.updateUsername(username)
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    await authApi.updatePassword(oldPassword, newPassword)
  }

  return {
    token,
    user,
    isAuthenticated,
    clearSession,
    register,
    login,
    logout,
    restoreSession,
    changeUsername,
    changePassword,
  }
})

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ColorScheme = 'light' | 'dark'
export type ToastTone = 'default' | 'danger'

const THEME_STORAGE_KEY = 'day-diary:theme'
let toastTimer: ReturnType<typeof setTimeout> | undefined

function applyTheme(theme: ColorScheme | null) {
  const root = document.documentElement
  if (theme) {
    root.setAttribute('data-theme', theme)
  } else {
    root.removeAttribute('data-theme')
  }
}

export const useUiStore = defineStore('ui', () => {
  const preference = ref<ThemePreference>(
    (localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null) ?? 'system',
  )
  /** Telegram's own colorScheme, used only while preference === 'system'. */
  const telegramScheme = ref<ColorScheme | null>(null)

  const toastMessage = ref<string | null>(null)
  const toastTone = ref<ToastTone>('default')

  const pageTransition = ref<'page-forward' | 'page-back' | 'page-fade'>('page-fade')
  function setPageTransition(name: 'page-forward' | 'page-back' | 'page-fade') {
    pageTransition.value = name
  }

  /** which colour environment is centred on screen while scrolling Today */
  const scenePhase = ref<'paper' | 'ink' | 'accent'>('paper')
  function setScenePhase(phase: 'paper' | 'ink' | 'accent') {
    scenePhase.value = phase
  }

  const navOpen = ref(false)
  function openNav() {
    navOpen.value = true
  }
  function closeNav() {
    navOpen.value = false
  }
  function toggleNav() {
    navOpen.value = !navOpen.value
  }

  function showToast(message: string, tone: ToastTone = 'default') {
    toastMessage.value = message
    toastTone.value = tone
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastMessage.value = null
    }, 3200)
  }

  function resolve(): ColorScheme | null {
    if (preference.value !== 'system') return preference.value
    return telegramScheme.value
  }

  function setPreference(next: ThemePreference) {
    preference.value = next
    localStorage.setItem(THEME_STORAGE_KEY, next)
  }

  function setTelegramScheme(scheme: ColorScheme | null) {
    telegramScheme.value = scheme
  }

  watch([preference, telegramScheme], () => applyTheme(resolve()), { immediate: true })

  return {
    preference,
    setPreference,
    setTelegramScheme,
    toastMessage,
    toastTone,
    showToast,
    pageTransition,
    setPageTransition,
    scenePhase,
    setScenePhase,
    navOpen,
    openNav,
    closeNav,
    toggleNav,
  }
})

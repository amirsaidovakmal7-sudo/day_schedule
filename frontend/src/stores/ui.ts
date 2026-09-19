import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ColorScheme = 'light' | 'dark'
export type ToastTone = 'default' | 'danger'
/** which colour environment is centred on screen; the navigation follows it */
export type ScenePhase = 'plain' | 'field' | 'board'
export type PageTransition = 'page-forward' | 'page-back' | 'page-fade'

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

  const pageTransition = ref<PageTransition>('page-fade')
  function setPageTransition(name: PageTransition) {
    pageTransition.value = name
  }

  const scenePhase = ref<ScenePhase>('plain')
  function setScenePhase(phase: ScenePhase) {
    scenePhase.value = phase
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
  }
})

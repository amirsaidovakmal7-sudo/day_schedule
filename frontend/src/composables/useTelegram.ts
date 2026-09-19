import { backButton, init, isTMA, mainButton, themeParams, viewport } from '@telegram-apps/sdk'
import { onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { useUiStore } from '@/stores/ui'

let bootstrapped = false

/**
 * Boots the Telegram Mini Apps bridge once for the whole app lifetime.
 * Safe to call outside Telegram (plain browser during development) — every
 * SDK call is guarded, so the app degrades to a no-op instead of throwing.
 */
export function bootstrapTelegram() {
  if (bootstrapped || !isTMA('simple')) return
  bootstrapped = true

  try {
    init()

    if (backButton.mount.isAvailable()) backButton.mount()
    if (mainButton.mount.isAvailable()) mainButton.mount()

    if (viewport.mount.isAvailable()) {
      viewport.mount().then(() => {
        if (viewport.expand.isAvailable()) viewport.expand()
      })
    }

    if (themeParams.mount.isAvailable()) {
      themeParams.mount()
      syncThemeFromTelegram()
      themeParams.state.sub(syncThemeFromTelegram)
    }
  } catch {
    // Outside a genuine Telegram client the bridge can still be flaky —
    // never let Telegram integration break the app itself.
  }
}

function syncThemeFromTelegram() {
  const uiStore = useUiStore()
  const bg = themeParams.backgroundColor()
  if (!bg) return

  const [r, g, b] = hexToRgb(bg)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  uiStore.setTelegramScheme(luminance < 0.5 ? 'dark' : 'light')
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function useBackButton(onBack: () => void) {
  if (!isTMA('simple') || !backButton.isMounted()) return

  backButton.show()
  const off = backButton.onClick(onBack)

  onScopeDispose(() => {
    off()
    if (backButton.isMounted()) backButton.hide()
  })
}

export function useMainButton(options: {
  text: MaybeRefOrGetter<string>
  onClick: () => void
  disabled?: MaybeRefOrGetter<boolean>
}) {
  if (!isTMA('simple') || !mainButton.isMounted()) return

  watch(
    () => [toValue(options.text), toValue(options.disabled) ?? false] as const,
    ([text, disabled]) => {
      mainButton.setParams({ text, isVisible: true, isEnabled: !disabled })
    },
    { immediate: true },
  )

  const off = mainButton.onClick(options.onClick)

  onScopeDispose(() => {
    off()
    if (mainButton.isMounted()) mainButton.setParams({ isVisible: false })
  })
}

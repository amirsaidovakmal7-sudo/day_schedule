import { hapticFeedback, isTMA } from '@telegram-apps/sdk'

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'error' | 'success' | 'warning'

function safe(fn: () => void) {
  if (!isTMA('simple')) return
  try {
    fn()
  } catch {
    // Haptics are a nicety — never let them break an interaction.
  }
}

export function useHaptics() {
  function impact(style: ImpactStyle = 'light') {
    safe(() => hapticFeedback.impactOccurred(style))
  }

  function notify(type: NotificationType) {
    safe(() => hapticFeedback.notificationOccurred(type))
  }

  return { impact, notify }
}

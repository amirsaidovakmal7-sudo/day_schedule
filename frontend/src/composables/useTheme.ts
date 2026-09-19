import { storeToRefs } from 'pinia'

import { useUiStore, type ThemePreference } from '@/stores/ui'

export function useTheme() {
  const uiStore = useUiStore()
  const { preference } = storeToRefs(uiStore)

  function setPreference(value: ThemePreference) {
    uiStore.setPreference(value)
  }

  return { preference, setPreference }
}

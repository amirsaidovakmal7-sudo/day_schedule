import { onBeforeUnmount } from 'vue'

import { observeInView } from '@/composables/useInView'
import { type ScenePhase, useUiStore } from '@/stores/ui'

/**
 * The navigation follows the colour environment centred on screen.
 * Register each full-bleed section with track(); everything is released on unmount.
 */
export function useScenePhase(initial: ScenePhase = 'plain') {
  const uiStore = useUiStore()
  const stops = new Map<HTMLElement, () => void>()

  uiStore.setScenePhase(initial)

  function track(target: unknown, phase: ScenePhase) {
    const node = (target as { $el?: HTMLElement } | null)?.$el ?? (target as HTMLElement | null)
    if (!node || stops.has(node)) return
    stops.set(
      node,
      observeInView(node, (visible) => visible && uiStore.setScenePhase(phase), {
        threshold: 0,
        rootMargin: '-45% 0px -45% 0px',
      }),
    )
  }

  onBeforeUnmount(() => {
    stops.forEach((stop) => stop())
    stops.clear()
    uiStore.setScenePhase('plain')
  })

  return { track }
}

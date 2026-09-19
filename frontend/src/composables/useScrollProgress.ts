import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/*
  One passive scroll listener shared by every consumer, flushed once per frame.
  Consumers only read layout (getBoundingClientRect) inside that single frame.
*/
const subscribers = new Set<() => void>()
let listening = false
let queued = false

function flush() {
  queued = false
  subscribers.forEach((run) => run())
}

function onScroll() {
  if (queued) return
  queued = true
  requestAnimationFrame(flush)
}

function subscribe(run: () => void): () => void {
  subscribers.add(run)
  if (!listening) {
    listening = true
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  }
  return () => {
    subscribers.delete(run)
    if (subscribers.size === 0 && listening) {
      listening = false
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }
}

const clamp = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Progress 0..1 of a tall section scrolling past a sticky stage: 0 while the
 * section top is at the viewport top, 1 when its bottom reaches the viewport bottom.
 */
export function useStickyProgress(el: Ref<HTMLElement | undefined>) {
  const progress = ref(0)
  let stop: (() => void) | undefined

  function measure() {
    const node = el.value
    if (!node) return
    const rect = node.getBoundingClientRect()
    const travel = rect.height - window.innerHeight
    progress.value = travel > 0 ? clamp(-rect.top / travel) : 0
  }

  onMounted(() => {
    measure()
    stop = subscribe(measure)
  })
  onBeforeUnmount(() => stop?.())

  return progress
}

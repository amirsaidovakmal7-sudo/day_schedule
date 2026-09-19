import type { Directive } from 'vue'

type VisibilityCallback = (visible: boolean, entry: IntersectionObserverEntry) => void

interface ObserveOptions {
  threshold?: number
  rootMargin?: string
}

interface SharedObserver {
  observer: IntersectionObserver
  /** callbacks are scoped to (observer, element), so several consumers can watch one element */
  callbacks: WeakMap<Element, Set<VisibilityCallback>>
}

const observers = new Map<string, SharedObserver>()

function getObserver({ threshold = 0.15, rootMargin = '0px' }: ObserveOptions): SharedObserver {
  const key = `${threshold}|${rootMargin}`
  let shared = observers.get(key)
  if (!shared) {
    const callbacks = new WeakMap<Element, Set<VisibilityCallback>>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          callbacks.get(entry.target)?.forEach((callback) => callback(entry.isIntersecting, entry))
        }
      },
      { threshold, rootMargin },
    )
    shared = { observer, callbacks }
    observers.set(key, shared)
  }
  return shared
}

/** Observes an element through a shared IntersectionObserver. Returns a stop function. */
export function observeInView(
  el: Element,
  callback: VisibilityCallback,
  options: ObserveOptions = {},
): () => void {
  const { observer, callbacks } = getObserver(options)
  let set = callbacks.get(el)
  if (!set) {
    set = new Set()
    callbacks.set(el, set)
  }
  set.add(callback)
  observer.observe(el)

  return () => {
    const current = callbacks.get(el)
    current?.delete(callback)
    if (current && current.size === 0) {
      callbacks.delete(el)
      observer.unobserve(el)
    }
  }
}

interface InViewBinding {
  once?: boolean
  threshold?: number
  rootMargin?: string
}

const stops = new WeakMap<Element, () => void>()

/**
 * v-inview — flips data-inview="false" → "true" the first time the element
 * scrolls into view. CSS owns the animation; this only reports visibility.
 */
export const vInview: Directive<HTMLElement, InViewBinding | undefined> = {
  created(el) {
    el.dataset.inview = 'false'
  },
  mounted(el, binding) {
    const { once = true, threshold, rootMargin } = binding.value ?? {}
    const stop = observeInView(
      el,
      (visible) => {
        if (visible) {
          el.dataset.inview = 'true'
          if (once) {
            stops.get(el)?.()
            stops.delete(el)
          }
        } else if (!once) {
          el.dataset.inview = 'false'
        }
      },
      { threshold, rootMargin },
    )
    stops.set(el, stop)
  },
  unmounted(el) {
    stops.get(el)?.()
    stops.delete(el)
  },
}

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const { toastMessage, toastTone } = storeToRefs(uiStore)
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toastMessage" class="toast" :class="`toast--${toastTone}`" role="status" aria-live="polite">
        <span class="toast__bar" aria-hidden="true" />
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  left: var(--gutter);
  bottom: calc(var(--space-5) + var(--safe-bottom));
  z-index: 70;
  max-width: min(26rem, calc(100vw - var(--gutter) * 2));
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-5);
  background: var(--ink);
  color: var(--ink-text);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-overlay);
  font-size: var(--fs-meta);
  font-weight: 500;
}

.toast__bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  background: var(--ink-accent);
}

.toast--danger .toast__bar {
  background: var(--danger);
}

.toast-enter-active {
  transition:
    transform var(--duration-slow) var(--ease-out),
    opacity var(--duration-base) var(--ease-standard);
}

.toast-leave-active {
  transition:
    transform var(--duration-fast) var(--ease-in),
    opacity var(--duration-fast) var(--ease-in);
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(-16px);
  opacity: 0;
}
</style>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const { toastMessage, toastTone } = storeToRefs(uiStore)
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toastMessage"
        class="toast env-board"
        :class="`toast--${toastTone}`"
        role="status"
        aria-live="polite"
      >
        <span class="toast__mark" aria-hidden="true" />
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  left: var(--gutter);
  bottom: calc(var(--tabbar-height) + var(--space-4) + var(--safe-bottom));
  z-index: 70;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  max-width: min(28rem, calc(100vw - var(--gutter) * 2));
  padding: var(--space-4) var(--space-5);
  background: var(--bg);
  color: var(--fg);
  box-shadow: var(--shadow-overlay);
  font-size: var(--fs-meta);
  font-weight: 600;
}

@media (min-width: 1024px) {
  .toast {
    bottom: var(--space-6);
    left: calc(var(--rail-width) + var(--space-6));
  }
}

.toast__mark {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  background: var(--fill);
}

.toast--danger .toast__mark {
  background: var(--danger);
}

.toast-enter-active {
  transition:
    clip-path var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.toast-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-in),
    transform var(--duration-fast) var(--ease-in);
}

.toast-enter-from {
  clip-path: inset(0 100% 0 0);
  transform: translateX(-12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

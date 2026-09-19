<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onBeforeUnmount, watch } from 'vue'

import IconButton from '@/components/base/IconButton.vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet-backdrop">
      <div v-if="open" class="sheet-backdrop" @click="emit('close')" />
    </Transition>
    <Transition name="sheet-panel">
      <div v-if="open" class="sheet env-plain" role="dialog" aria-modal="true" :aria-label="title">
        <span class="sheet__bar" aria-hidden="true" />
        <header class="sheet__header">
          <h2 class="sheet__title">{{ title }}</h2>
          <IconButton :icon="X" label="Закрыть" @click="emit('close')" />
        </header>
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  z-index: 60;
}

.sheet {
  --bg: var(--surface);
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 61;
  background: var(--bg);
  color: var(--fg);
  padding: var(--space-5) var(--gutter) calc(var(--space-6) + var(--safe-bottom));
  max-height: 92vh;
  overflow-y: auto;
}

/* The heavy rule that draws in across the top edge */
.sheet__bar {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 6px;
  background: var(--fill);
  transform-origin: left;
  animation: sheet-bar var(--duration-slow) var(--ease-out) 120ms both;
}

@media (min-width: 640px) {
  .sheet {
    left: 50%;
    right: auto;
    bottom: auto;
    top: 50%;
    width: min(32rem, calc(100vw - 2rem));
    translate: -50% -50%;
    border: var(--stroke) solid var(--fg);
    box-shadow: var(--shadow-overlay);
    padding: var(--space-6) var(--space-6) var(--space-6);
  }
}

.sheet__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.sheet__header :deep(.icon-btn) {
  margin: calc(var(--space-2) * -1) calc(var(--space-2) * -1) 0 0;
}

.sheet__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 2rem + 2vw, 3.5rem);
  font-weight: 800;
  line-height: var(--lh-display);
  letter-spacing: -0.005em;
}

@keyframes sheet-bar {
  from {
    transform: scaleX(0);
  }
}

.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  opacity: 0;
}

.sheet-panel-enter-active {
  transition:
    transform var(--duration-slow) var(--ease-out),
    opacity var(--duration-base) var(--ease-standard);
}

.sheet-panel-leave-active {
  transition:
    transform var(--duration-fast) var(--ease-in),
    opacity var(--duration-fast) var(--ease-in);
}

.sheet-panel-enter-from,
.sheet-panel-leave-to {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .sheet-panel-enter-from,
  .sheet-panel-leave-to {
    transform: translateY(16px);
    opacity: 0;
  }
}
</style>

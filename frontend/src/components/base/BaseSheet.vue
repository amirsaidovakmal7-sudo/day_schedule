<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onBeforeUnmount, watch } from 'vue'

import IconButton from '@/components/base/IconButton.vue'

const props = defineProps<{ open: boolean; title: string; eyebrow?: string }>()
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
      <div v-if="open" class="sheet" role="dialog" aria-modal="true" :aria-label="title">
        <header class="sheet__header">
          <div>
            <p v-if="eyebrow" class="label sheet__eyebrow">{{ eyebrow }}</p>
            <h2 class="sheet__title">{{ title }}</h2>
          </div>
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
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 61;
  background: var(--surface);
  color: var(--text);
  border-top: 2px solid var(--accent);
  box-shadow: var(--shadow-overlay);
  padding: var(--space-5) var(--gutter) calc(var(--space-6) + var(--safe-bottom));
  max-height: 90vh;
  overflow-y: auto;
}

@media (min-width: 640px) {
  .sheet {
    left: 50%;
    right: auto;
    bottom: auto;
    top: 50%;
    width: min(30rem, calc(100vw - 2rem));
    translate: -50% -50%;
    border-radius: var(--radius-lg);
    border-top-width: 2px;
    padding: var(--space-5) var(--space-6) var(--space-6);
  }
}

.sheet__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.sheet__header :deep(.icon-btn) {
  margin: calc(var(--space-2) * -1) calc(var(--space-2) * -1) 0 0;
}

.sheet__eyebrow {
  color: var(--accent);
  margin-bottom: var(--space-1);
}

.sheet__title {
  font-family: var(--font-display);
  font-size: var(--fs-section-title);
  font-weight: 400;
  line-height: var(--lh-tight);
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
    transform: translateY(14px);
    opacity: 0;
  }
}
</style>

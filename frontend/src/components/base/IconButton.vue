<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'

import BaseIcon from '@/components/base/BaseIcon.vue'

withDefaults(
  defineProps<{
    icon: LucideIcon
    label: string
    tone?: 'default' | 'danger' | 'accent'
    size?: number
  }>(),
  { tone: 'default', size: 18 },
)
</script>

<template>
  <button type="button" class="icon-btn" :class="`icon-btn--${tone}`" :aria-label="label" :title="label">
    <BaseIcon :icon="icon" :size="size" />
  </button>
</template>

<style scoped>
.icon-btn {
  width: var(--tap-target-min);
  height: var(--tap-target-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  color: var(--muted);
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    transform var(--duration-instant) var(--ease-standard);
}

.icon-btn:hover {
  color: var(--text);
  background: var(--background-alt);
}

.icon-btn:active {
  transform: scale(0.92);
}

.icon-btn--danger:hover,
.icon-btn--danger.is-armed {
  color: var(--danger);
  background: var(--danger-soft);
}

.icon-btn--accent {
  color: var(--accent);
}

.icon-btn--accent:hover {
  color: var(--accent);
  background: var(--accent-soft);
}
</style>

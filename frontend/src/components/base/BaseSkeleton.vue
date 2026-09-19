<script setup lang="ts">
withDefaults(defineProps<{ height?: string; width?: string }>(), {
  height: '1rem',
  width: '100%',
})
</script>

<template>
  <span class="base-skeleton" :style="{ height, width }" />
</template>

<style scoped>
.base-skeleton {
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--rule);
}

.base-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, color-mix(in srgb, var(--fg) 14%, transparent) 50%, transparent 70%);
  transform: translateX(-100%);
  animation: skeleton-run 1.5s var(--ease-in-out) infinite;
}

@keyframes skeleton-run {
  to {
    transform: translateX(100%);
  }
}
</style>

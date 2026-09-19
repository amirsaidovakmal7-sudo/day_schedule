<script setup lang="ts">
withDefaults(defineProps<{ height?: string; width?: string; radius?: string }>(), {
  height: '1rem',
  width: '100%',
  radius: 'var(--radius-sm)',
})
</script>

<template>
  <span class="base-skeleton" :style="{ height, width, borderRadius: radius }" />
</template>

<style scoped>
.base-skeleton {
  display: block;
  background: linear-gradient(
    100deg,
    var(--border) 30%,
    var(--background-alt) 50%,
    var(--border) 70%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  from {
    background-position: 150% 0;
  }
  to {
    background-position: -50% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-skeleton {
    animation: none;
    background: var(--border);
  }
}
</style>

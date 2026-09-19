<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'

withDefaults(defineProps<{ icon: LucideIcon; size?: number }>(), { size: 20 })
</script>

<template>
  <component :is="icon" :size="size" :stroke-width="2" stroke-linecap="square" class="base-icon" aria-hidden="true" />
</template>

<style scoped>
.base-icon {
  display: block;
  flex-shrink: 0;
  color: currentColor;
}
</style>

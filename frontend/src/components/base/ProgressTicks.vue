<script setup lang="ts">
/* One tick per task. Done ticks fill in order, like marks on a ruler. */
defineProps<{ done: number; total: number }>()
</script>

<template>
  <div class="ticks" aria-hidden="true">
    <span v-for="n in total" :key="n" class="tick" :class="{ 'is-done': n <= done }" :style="{ '--i': n - 1 }" />
  </div>
</template>

<style scoped>
.ticks {
  display: flex;
  gap: 3px;
  width: 100%;
}

.tick {
  flex: 1;
  min-width: 3px;
  height: 0.875rem;
  border: 2px solid var(--fg);
  background: transparent;
  transition:
    background-color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard);
  transition-delay: calc(var(--i) * 30ms);
}

.tick.is-done {
  background: var(--fill);
  border-color: var(--fill);
}
</style>

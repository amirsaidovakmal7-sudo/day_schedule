<script setup lang="ts">
defineProps<{ modelValue: boolean; label?: string; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <button
    type="button"
    class="check"
    :class="{ 'is-checked': modelValue, 'is-static': disabled }"
    :aria-pressed="modelValue"
    :aria-label="label"
    :disabled="disabled"
    @click="emit('update:modelValue', !modelValue)"
  >
    <svg viewBox="0 0 24 24" class="check__box" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" class="check__bg" />
      <path
        d="M7.4 12.4L10.4 15.4L16.6 8.8"
        class="check__mark"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        pathLength="1"
      />
    </svg>
  </button>
</template>

<style scoped>
.check {
  width: var(--tap-target-min);
  height: var(--tap-target-min);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--sec-on-accent, var(--on-accent));
}

.check.is-static {
  cursor: default;
}

.check__box {
  width: 24px;
  height: 24px;
  transition: transform var(--duration-fast) var(--ease-standard);
}

.check:active:not(:disabled) .check__box {
  transform: scale(0.9);
}

/* Square outline morphs into a filled rounded form when checked */
.check__bg {
  rx: 3px;
  fill: transparent;
  stroke: var(--sec-muted, var(--muted));
  stroke-width: 1.5;
  transition:
    rx var(--duration-slow) var(--ease-out),
    fill var(--duration-base) var(--ease-standard),
    stroke var(--duration-base) var(--ease-standard);
}

.check:hover:not(:disabled):not(.is-checked) .check__bg {
  stroke: var(--sec-accent, var(--accent));
}

.check__mark {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset var(--duration-base) var(--ease-in-out);
}

.check.is-checked .check__bg {
  rx: 9px;
  fill: var(--sec-accent, var(--accent));
  stroke: var(--sec-accent, var(--accent));
}

.check.is-checked .check__mark {
  stroke-dashoffset: 0;
  transition-delay: 90ms;
}

@media (prefers-reduced-motion: reduce) {
  .check__bg {
    transition: none;
  }
}
</style>

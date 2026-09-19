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
    <svg viewBox="0 0 28 28" class="check__box" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="24" height="24" class="check__bg" />
      <path d="M8 14.4L12.2 18.6L20.2 9.6" class="check__mark" pathLength="1" />
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
}

.check.is-static {
  cursor: default;
}

.check__box {
  width: 28px;
  height: 28px;
  transition: transform var(--duration-fast) var(--ease-standard);
}

.check:active:not(:disabled) .check__box {
  transform: scale(0.88);
}

.check__bg {
  fill: transparent;
  stroke: var(--fg);
  stroke-width: 2;
  transition:
    fill var(--duration-base) var(--ease-standard),
    stroke var(--duration-base) var(--ease-standard);
}

.check:hover:not(:disabled):not(.is-checked) .check__bg {
  fill: var(--tint);
  stroke: var(--hl);
}

.check__mark {
  stroke: var(--on-fill);
  stroke-width: 3;
  stroke-linecap: square;
  stroke-linejoin: miter;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset var(--duration-base) var(--ease-in-out);
}

.check.is-checked .check__bg {
  fill: var(--fill);
  stroke: var(--fill);
}

.check.is-checked .check__mark {
  stroke-dashoffset: 0;
  transition-delay: 100ms;
}
</style>

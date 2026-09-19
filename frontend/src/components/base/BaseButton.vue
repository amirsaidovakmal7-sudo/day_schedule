<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'text' | 'danger'
    loading?: boolean
    disabled?: boolean
    block?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', loading: false, disabled: false, block: false, type: 'button' },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, { 'is-loading': loading, 'is-block': block }]"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span class="btn__label"><slot /></span>
    <span v-if="$slots.icon" class="btn__icon"><slot name="icon" /></span>
  </button>
</template>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: var(--tap-target-min);
  padding: 0 var(--space-5);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: var(--fs-meta);
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  transition:
    transform var(--duration-instant) var(--ease-standard),
    background-color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
}

.btn.is-block {
  display: flex;
  width: 100%;
}

.btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.985);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.btn__icon {
  display: inline-flex;
  transition: transform var(--duration-base) var(--ease-out);
}

.btn:hover:not(:disabled) .btn__icon {
  transform: translateX(4px);
}

/* Primary: solid accent */
.btn--primary {
  background: var(--sec-accent, var(--accent));
  color: var(--sec-on-accent, var(--on-accent));
}

.btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--sec-accent, var(--accent)) 86%, var(--sec-text, #000));
}

/* Secondary: outline */
.btn--secondary {
  border-color: var(--sec-line-strong, var(--border-strong));
  color: var(--sec-text, var(--text));
}

.btn--secondary:hover:not(:disabled) {
  border-color: var(--sec-text, var(--text));
}

/* Text action: underline sweeps in from the left */
.btn--text {
  min-height: var(--tap-target-min);
  padding: 0 var(--space-1);
  color: var(--sec-text-2, var(--text-secondary));
}

.btn--text .btn__label {
  background: linear-gradient(currentColor, currentColor) left bottom / 0 1px no-repeat;
  padding-bottom: 2px;
  transition: background-size var(--duration-slow) var(--ease-out);
}

.btn--text:hover:not(:disabled) {
  color: var(--sec-text, var(--text));
}

.btn--text:hover:not(:disabled) .btn__label {
  background-size: 100% 1px;
}

/* Destructive */
.btn--danger {
  border-color: var(--danger);
  color: var(--danger);
}

.btn--danger:hover:not(:disabled) {
  background: var(--danger);
  color: var(--on-accent);
}

/* Loading: a thin line sweeps under the label instead of a spinner */
.btn.is-loading::after {
  content: '';
  position: absolute;
  left: var(--space-5);
  right: var(--space-5);
  bottom: 8px;
  height: 1px;
  background: currentColor;
  transform-origin: left;
  animation: btn-sweep 1s var(--ease-in-out) infinite;
}

@keyframes btn-sweep {
  0% {
    transform: scaleX(0);
    transform-origin: left;
  }
  50% {
    transform: scaleX(1);
    transform-origin: left;
  }
  51% {
    transform-origin: right;
  }
  100% {
    transform: scaleX(0);
    transform-origin: right;
  }
}
</style>

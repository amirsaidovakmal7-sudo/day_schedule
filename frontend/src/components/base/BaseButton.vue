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
    <span class="btn__wash" aria-hidden="true" />
    <span class="btn__label"><slot /></span>
    <span v-if="$slots.icon" class="btn__icon"><slot name="icon" /></span>
  </button>
</template>

<style scoped>
.btn {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 3rem;
  padding: 0 var(--space-5);
  border: var(--stroke) solid var(--fg);
  font-family: var(--font-ui);
  font-size: 1rem;
  font-weight: 650;
  letter-spacing: 0.005em;
  line-height: 1.2;
  text-align: center;
  max-width: 100%;
  padding-block: var(--space-2);
  transition:
    transform var(--duration-instant) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
}

.btn.is-block {
  display: flex;
  width: 100%;
}

/* The wash: a colour that sweeps in from the left on hover */
.btn__wash {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--wash-bg);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-base) var(--ease-out);
}

.btn:hover:not(:disabled) .btn__wash,
.btn:focus-visible:not(:disabled) .btn__wash {
  transform: scaleX(1);
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.btn__icon {
  display: inline-flex;
  transition: transform var(--duration-base) var(--ease-out);
}

.btn:hover:not(:disabled) .btn__icon {
  transform: translateX(4px);
}

/* Primary: solid inverse of the surroundings, hover sweeps the environment's colour in */
.btn--primary {
  --wash-bg: var(--btn-hover-bg);
  background: var(--fg);
  border-color: var(--fg);
  color: var(--bg);
}

.btn--primary:hover:not(:disabled),
.btn--primary:focus-visible:not(:disabled) {
  color: var(--btn-hover-fg);
  border-color: var(--btn-hover-bg);
}

/* Secondary: outline that fills with the text colour */
.btn--secondary {
  --wash-bg: var(--fg);
  background: transparent;
  color: var(--fg);
}

.btn--secondary:hover:not(:disabled),
.btn--secondary:focus-visible:not(:disabled) {
  color: var(--bg);
}

/* Text action: underline sweeps out and back in */
.btn--text {
  min-height: var(--tap-target-min);
  padding: 0 var(--space-1);
  border-color: transparent;
  overflow: visible;
  color: var(--fg-2);
}

.btn--text .btn__wash {
  display: none;
}

.btn--text .btn__label {
  background: linear-gradient(currentColor, currentColor) left bottom / 100% 2px no-repeat;
  padding-bottom: 3px;
  transition: background-size var(--duration-slow) var(--ease-out);
}

.btn--text:hover:not(:disabled) {
  color: var(--fg);
}

.btn--text:hover:not(:disabled) .btn__label {
  background-position: right bottom;
  background-size: 0 2px;
}

/* Destructive */
.btn--danger {
  --wash-bg: var(--danger);
  border-color: var(--danger);
  background: transparent;
  color: var(--danger);
}

.btn--danger:hover:not(:disabled),
.btn--danger:focus-visible:not(:disabled) {
  color: #ffffff;
}

/* Loading: a bar runs along the bottom edge instead of a spinner */
.btn.is-loading::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: currentColor;
  transform-origin: left;
  animation: btn-run 1s var(--ease-in-out) infinite;
}

@keyframes btn-run {
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

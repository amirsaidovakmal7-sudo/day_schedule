<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    autocomplete?: string
    autofocus?: boolean
    disabled?: boolean
    inputmode?: 'text' | 'numeric' | 'search'
    /** larger display type, used for the time field */
    display?: boolean
  }>(),
  { type: 'text' },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const id = `field-${Math.random().toString(36).slice(2, 9)}`
const revealed = ref(false)
const shaking = ref(false)

const isPassword = computed(() => props.type === 'password')
const resolvedType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type))

watch(
  () => props.error,
  (next) => {
    if (!next) return
    shaking.value = false
    requestAnimationFrame(() => (shaking.value = true))
  },
)
</script>

<template>
  <div
    class="field"
    :class="{
      'is-filled': modelValue.length > 0,
      'has-error': error,
      'is-disabled': disabled,
      'is-shaking': shaking,
      'is-display': display,
    }"
    @animationend="shaking = false"
  >
    <label class="field__label" :for="id">{{ label }}</label>
    <div class="field__control">
      <input
        :id="id"
        class="field__input"
        :class="{ 'has-trailing': isPassword }"
        :type="resolvedType"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :disabled="disabled"
        :inputmode="inputmode"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${id}-error` : undefined"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="field__reveal"
        :aria-pressed="revealed"
        :disabled="disabled"
        @click="revealed = !revealed"
      >
        {{ revealed ? 'Скрыть' : 'Показать' }}
      </button>
      <span class="field__bar" aria-hidden="true" />
    </div>
    <Transition name="field-msg">
      <p v-if="error" :id="`${id}-error`" class="field__msg field__msg--error" role="alert">{{ error }}</p>
      <p v-else-if="hint" class="field__msg">{{ hint }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__label {
  font-size: var(--fs-label);
  font-weight: 650;
  letter-spacing: 0.02em;
  color: var(--fg-2);
  transition: color var(--duration-base) var(--ease-standard);
}

.field:focus-within .field__label {
  color: var(--hl);
}

.field.has-error .field__label {
  color: var(--danger);
}

.field__control {
  position: relative;
  display: flex;
  overflow: hidden;
  border: var(--stroke) solid color-mix(in srgb, var(--fg) 38%, transparent);
  background: transparent;
  transition:
    border-color var(--duration-base) var(--ease-standard),
    background-color var(--duration-base) var(--ease-standard);
}

.field.is-filled .field__control {
  border-color: var(--fg);
}

.field:hover:not(.is-disabled) .field__control {
  border-color: var(--fg);
}

.field__control:focus-within {
  border-color: var(--hl);
  background: var(--tint);
}

.field.has-error .field__control {
  border-color: var(--danger);
}

.field.is-disabled .field__control {
  border-style: dashed;
  opacity: 0.55;
}

.field__input {
  width: 100%;
  min-height: 3.25rem;
  padding: 0 var(--space-4);
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--fg);
  font-size: 1.125rem;
  font-weight: 500;
}

.field.is-display .field__input {
  min-height: 4rem;
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums lining-nums;
}

.field__input.has-trailing {
  padding-right: 6.5rem;
}

.field__input::placeholder {
  color: var(--fg-muted);
  opacity: 0.85;
  font-weight: 400;
}

.field__input:focus,
.field__input:focus-visible {
  outline: none;
}

.field__input:disabled {
  cursor: not-allowed;
}

/* Bar that sweeps in along the bottom edge on focus */
.field__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: var(--hl);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-slow) var(--ease-out);
}

.field__control:focus-within .field__bar {
  transform: scaleX(1);
}

.field.has-error .field__bar {
  background: var(--danger);
  transform: scaleX(1);
}

.field__reveal {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  min-width: 6rem;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: var(--fs-label);
  font-weight: 650;
  color: var(--fg-2);
  transition: color var(--duration-fast) var(--ease-standard);
}

.field__reveal:hover:not(:disabled) {
  color: var(--hl);
}

.field__msg {
  font-size: var(--fs-label);
  font-weight: 500;
  color: var(--fg-muted);
}

.field__msg--error {
  color: var(--danger);
  font-weight: 650;
}

.field.is-shaking .field__control {
  animation: field-shake 340ms var(--ease-out);
}

@keyframes field-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  55% {
    transform: translateX(5px);
  }
  80% {
    transform: translateX(-2px);
  }
}

.field-msg-enter-active,
.field-msg-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-out);
}

.field-msg-enter-from,
.field-msg-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

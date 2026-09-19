<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

import BaseIcon from '@/components/base/BaseIcon.vue'

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
        :aria-label="revealed ? 'Скрыть пароль' : 'Показать пароль'"
        :aria-pressed="revealed"
        @click="revealed = !revealed"
      >
        <BaseIcon :icon="revealed ? EyeOff : Eye" :size="18" />
      </button>
      <span class="field__line" aria-hidden="true" />
    </div>
    <Transition name="field-error">
      <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
      <p v-else-if="hint" class="field__hint">{{ hint }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field__label {
  font-size: var(--fs-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--muted);
  transition: color var(--duration-base) var(--ease-standard);
}

.field:focus-within .field__label {
  color: var(--accent);
}

.field.is-filled:not(:focus-within) .field__label {
  color: var(--text-secondary);
}

.field.has-error .field__label {
  color: var(--danger);
}

.field__control {
  position: relative;
  display: flex;
}

.field__input {
  width: 100%;
  min-height: 3rem;
  padding: 0;
  border: none;
  border-bottom: 1px solid var(--border-strong);
  border-radius: 0;
  background: transparent;
  color: var(--text);
  font-size: var(--fs-subhead);
  transition: border-color var(--duration-base) var(--ease-standard);
}

.field__input.has-trailing {
  padding-right: var(--tap-target-min);
}

.field__input::placeholder {
  color: var(--muted);
  opacity: 0.7;
}

.field__input:focus,
.field__input:focus-visible {
  outline: none;
}

.field__input:disabled {
  color: var(--muted);
  cursor: not-allowed;
}

.field.is-disabled .field__control {
  opacity: 0.6;
}

/* Accent underline that draws in from the left on focus */
.field__line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-slow) var(--ease-out);
}

.field__control:focus-within .field__line {
  transform: scaleX(1);
}

.field.has-error .field__line {
  background: var(--danger);
  transform: scaleX(1);
}

.field__reveal {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: var(--tap-target-min);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--muted);
  transition: color var(--duration-fast) var(--ease-standard);
}

.field__reveal:hover {
  color: var(--text);
}

.field__error {
  font-size: var(--fs-meta);
  color: var(--danger);
}

.field__hint {
  font-size: var(--fs-meta);
  color: var(--muted);
}

.field.is-shaking .field__control {
  animation: field-shake 320ms var(--ease-out);
}

@keyframes field-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  55% {
    transform: translateX(4px);
  }
  80% {
    transform: translateX(-2px);
  }
}

.field-error-enter-active,
.field-error-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-out);
}

.field-error-enter-from,
.field-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

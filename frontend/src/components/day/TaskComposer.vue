<script setup lang="ts">
import { CornerDownLeft, Plus } from 'lucide-vue-next'
import { nextTick, ref } from 'vue'

import BaseIcon from '@/components/base/BaseIcon.vue'
import { useHaptics } from '@/composables/useHaptics'
import { useCurrentDayStore } from '@/stores/currentDay'
import { useUiStore } from '@/stores/ui'
import { toUserMessage } from '@/utils/errors'

const dayStore = useCurrentDayStore()
const uiStore = useUiStore()
const haptics = useHaptics()

const title = ref('')
const submitting = ref(false)
const shaking = ref(false)
const input = ref<HTMLInputElement>()

async function submit() {
  const value = title.value.trim()
  if (!value) {
    shaking.value = false
    await nextTick()
    shaking.value = true
    return
  }

  submitting.value = true
  try {
    await dayStore.addTask(value)
    haptics.notify('success')
    title.value = ''
  } catch (e) {
    uiStore.showToast(toUserMessage(e), 'danger')
  } finally {
    submitting.value = false
    await nextTick()
    input.value?.focus()
  }
}
</script>

<template>
  <form
    class="composer"
    :class="{ 'is-shaking': shaking, 'is-busy': submitting, 'has-text': title.length > 0 }"
    @submit.prevent="submit"
    @animationend="shaking = false"
  >
    <label class="composer__icon" for="task-composer">
      <BaseIcon :icon="Plus" :size="20" />
      <span class="sr-only">Новая задача</span>
    </label>
    <input
      id="task-composer"
      ref="input"
      v-model="title"
      class="composer__input"
      type="text"
      maxlength="300"
      autocomplete="off"
      enterkeyhint="done"
      placeholder="Что нужно сделать сегодня?"
      :disabled="submitting"
    />
    <button type="submit" class="composer__submit" :disabled="submitting || !title.trim()" aria-label="Добавить задачу">
      <span class="composer__hint label">Enter</span>
      <BaseIcon :icon="CornerDownLeft" :size="18" />
    </button>
    <span class="composer__line" aria-hidden="true" />
  </form>
</template>

<style scoped>
.composer {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 3.75rem;
  border-bottom: 1px solid var(--sec-line-strong);
}

.composer__icon {
  width: var(--tap-target-min);
  height: var(--tap-target-min);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--sec-accent);
  cursor: text;
  transition: transform var(--duration-base) var(--ease-out);
}

.composer:focus-within .composer__icon {
  transform: rotate(90deg);
}

.composer__input {
  flex: 1;
  min-width: 0;
  min-height: var(--tap-target-min);
  border: none;
  background: transparent;
  font-size: var(--fs-task);
  font-weight: 500;
  color: var(--sec-text);
}

.composer__input::placeholder {
  color: var(--sec-muted);
  font-weight: 400;
}

.composer__input:focus-visible {
  outline: none;
}

.composer__submit {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-target-min);
  padding: 0 var(--space-2);
  color: var(--sec-accent);
  opacity: 0;
  transform: translateX(8px);
  pointer-events: none;
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-out);
}

.composer.has-text .composer__submit {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.composer__hint {
  display: none;
  color: var(--sec-muted);
}

@media (hover: hover) and (min-width: 900px) {
  .composer__hint {
    display: inline;
  }
}

.composer__line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--sec-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-slow) var(--ease-out);
}

.composer:focus-within .composer__line {
  transform: scaleX(1);
}

.composer.is-busy .composer__line {
  animation: composer-busy 900ms var(--ease-in-out) infinite alternate;
}

.composer.is-shaking {
  animation: composer-shake 320ms var(--ease-out);
}

@keyframes composer-busy {
  from {
    transform: scaleX(0.2);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes composer-shake {
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
</style>

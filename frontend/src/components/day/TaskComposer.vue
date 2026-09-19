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
    <span class="composer__wash" aria-hidden="true" />
    <label class="composer__icon" for="task-composer">
      <span class="composer__plus"><BaseIcon :icon="Plus" :size="18" /></span>
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
      <kbd class="composer__hint">Enter</kbd>
      <BaseIcon :icon="CornerDownLeft" :size="20" />
    </button>
    <span class="composer__line" aria-hidden="true" />
  </form>
</template>

<style scoped>
.composer {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 4.5rem;
  border-bottom: var(--stroke) solid var(--rule-strong);
}

.composer__wash {
  position: absolute;
  inset: 0;
  background: var(--tint);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-slow) var(--ease-out);
  pointer-events: none;
}

.composer:focus-within .composer__wash {
  transform: scaleX(1);
}

.composer__icon {
  position: relative;
  width: var(--tap-target-min);
  height: var(--tap-target-min);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: text;
}

.composer__plus {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--stroke) dashed var(--fg);
  color: var(--fg);
  transition:
    transform var(--duration-slow) var(--ease-out),
    background-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard);
}

.composer:hover .composer__plus {
  border-color: var(--hl);
  color: var(--hl);
}

.composer:focus-within .composer__plus {
  transform: rotate(90deg);
  border-style: solid;
  border-color: var(--fill);
  background: var(--fill);
  color: var(--on-fill);
}

.composer__input {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: var(--tap-target-min);
  border: none;
  background: transparent;
  font-size: var(--fs-task);
  font-weight: 550;
  color: var(--fg);
}

.composer__input::placeholder {
  color: var(--fg-muted);
  font-weight: 450;
}

.composer__input:focus-visible {
  outline: none;
}

.composer__submit {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-target-min);
  padding: 0 var(--space-3);
  color: var(--hl);
  opacity: 0;
  transform: translateX(10px);
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
  padding: 0.125rem 0.5rem;
  border: 1px solid currentColor;
  font-family: var(--font-ui);
  font-size: var(--fs-caption);
  font-weight: 650;
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
  bottom: calc(var(--stroke) * -1);
  height: 5px;
  background: var(--fill);
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
  animation: composer-shake 340ms var(--ease-out);
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
    transform: translateX(-6px);
  }
  55% {
    transform: translateX(5px);
  }
  80% {
    transform: translateX(-2px);
  }
}
</style>

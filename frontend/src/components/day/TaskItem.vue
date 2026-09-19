<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { onBeforeUnmount, ref, watch } from 'vue'

import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import IconButton from '@/components/base/IconButton.vue'
import { useHaptics } from '@/composables/useHaptics'
import type { Task } from '@/types/api'

const props = defineProps<{ task: Task; editable: boolean }>()
const emit = defineEmits<{ toggle: [id: number]; remove: [id: number] }>()

const haptics = useHaptics()
const armed = ref(false)
const sweeping = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

function onToggle() {
  const completing = !props.task.completed
  haptics.impact(completing ? 'medium' : 'light')
  if (completing) haptics.notify('success')
  emit('toggle', props.task.id)
}

watch(
  () => props.task.completed,
  (now, was) => {
    if (now && !was) sweeping.value = true
  },
)

function onDelete() {
  if (!armed.value) {
    armed.value = true
    resetTimer = setTimeout(() => (armed.value = false), 2600)
    return
  }
  clearTimeout(resetTimer)
  emit('remove', props.task.id)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <li class="task" :class="{ 'is-completed': task.completed, 'is-sweeping': sweeping }">
    <div class="task__clip">
      <div class="task__inner">
        <span class="task__sweep" aria-hidden="true" @animationend="sweeping = false" />
        <BaseCheckbox
          :model-value="task.completed"
          :label="`${task.completed ? 'Вернуть в работу' : 'Выполнено'}: ${task.title}`"
          :disabled="!editable"
          @update:model-value="onToggle"
        />
        <span class="task__title">
          <span class="task__text">{{ task.title }}</span>
        </span>
        <div v-if="editable" class="task__actions">
          <span class="task__confirm" :class="{ 'is-visible': armed }" aria-live="polite">
            {{ armed ? 'Удалить?' : '' }}
          </span>
          <IconButton
            :icon="Trash2"
            :label="armed ? 'Подтвердить удаление' : 'Удалить задачу'"
            tone="danger"
            :size="17"
            :class="{ 'is-armed': armed }"
            @click="onDelete"
          />
        </div>
        <span class="task__line" aria-hidden="true" />
      </div>
    </div>
  </li>
</template>

<style scoped>
.task {
  display: grid;
  grid-template-rows: 1fr;
  color: var(--sec-text);
}

.task__clip {
  min-height: 0;
}

.task__inner {
  position: relative;
  min-height: 3.75rem;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-right: var(--space-1);
  border-bottom: 1px solid var(--sec-line);
}

.task:last-child .task__inner {
  border-bottom-color: transparent;
}

/* Completion: accent tint sweeps across the row once */
.task__sweep {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--sec-accent) 14%, transparent);
  transform-origin: left;
  transform: scaleX(0);
  pointer-events: none;
}

.task.is-sweeping .task__sweep {
  animation: task-sweep 720ms var(--ease-in-out) both;
}

.task__title {
  position: relative;
  flex: 1;
  min-width: 0;
  padding-block: var(--space-3);
  font-size: var(--fs-task);
  font-weight: 500;
  line-height: var(--lh-snug);
  transition:
    color var(--duration-slow) var(--ease-standard),
    transform var(--duration-base) var(--ease-out);
}

.task__text {
  background: linear-gradient(currentColor, currentColor) 0 55% / 0 1.5px no-repeat;
  transition: background-size var(--duration-slow) var(--ease-in-out);
  overflow-wrap: anywhere;
}

.task.is-completed .task__title {
  color: var(--sec-muted);
}

.task.is-completed .task__text {
  background-size: 100% 1.5px;
}

.task__actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-right: calc(var(--space-2) * -1);
}

.task__confirm {
  font-size: var(--fs-meta);
  font-weight: 600;
  color: var(--danger);
  opacity: 0;
  transform: translateX(6px);
  transition:
    opacity var(--duration-fast) var(--ease-standard),
    transform var(--duration-base) var(--ease-out);
}

.task__confirm.is-visible {
  opacity: 1;
  transform: none;
}

/* Hover line: accent rule draws under the row */
.task__line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: var(--sec-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-slow) var(--ease-out);
  pointer-events: none;
}

@media (hover: hover) {
  .task__actions {
    opacity: 0;
    transform: translateX(10px);
    transition:
      opacity var(--duration-fast) var(--ease-standard),
      transform var(--duration-base) var(--ease-out);
  }

  .task__inner:hover .task__actions,
  .task__inner:focus-within .task__actions,
  .task__actions:has(.is-armed) {
    opacity: 1;
    transform: none;
  }

  .task__inner:hover .task__line {
    transform: scaleX(1);
  }

  .task__inner:hover .task__title {
    transform: translateX(4px);
  }
}

@keyframes task-sweep {
  0% {
    transform: scaleX(0);
    opacity: 1;
  }
  55% {
    transform: scaleX(1);
    opacity: 1;
  }
  100% {
    transform: scaleX(1);
    opacity: 0;
  }
}
</style>

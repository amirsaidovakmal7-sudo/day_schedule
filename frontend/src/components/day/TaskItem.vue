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
  <li class="task" :class="{ 'is-completed': task.completed, 'is-sweeping': sweeping, 'is-editable': editable }">
    <div class="task__clip">
      <div class="task__inner">
        <span class="task__hover" aria-hidden="true" />
        <BaseCheckbox
          class="task__check"
          :model-value="task.completed"
          :label="`${task.completed ? 'Вернуть в работу' : 'Выполнено'}: ${task.title}`"
          :disabled="!editable"
          @update:model-value="onToggle"
        />
        <span class="task__title">
          <span class="task__sweep" aria-hidden="true" @animationend="sweeping = false" />
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
            :size="19"
            :class="{ 'is-armed': armed }"
            @click="onDelete"
          />
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.task {
  display: grid;
  grid-template-rows: 1fr;
  color: var(--fg);
}

.task__clip {
  min-height: 0;
}

.task__inner {
  position: relative;
  min-height: 4.25rem;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-right: var(--space-1);
  border-bottom: 1px solid var(--rule);
}

.task__check {
  position: relative;
  z-index: 1;
}

/* Hover wash: a tint slides in from the left */
.task__hover {
  position: absolute;
  inset: 0 0 -1px 0;
  background: var(--tint);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-base) var(--ease-out);
  pointer-events: none;
}

.task__title {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  padding-block: var(--space-4);
  font-size: var(--fs-task);
  font-weight: 550;
  line-height: var(--lh-snug);
  transition:
    color var(--duration-slow) var(--ease-standard),
    transform var(--duration-base) var(--ease-out);
}

/* Completion: marker ink sweeps behind the text once, then withdraws to the right */
.task__sweep {
  position: absolute;
  inset: 0.35rem -0.5rem 0.35rem -0.5rem;
  z-index: -1;
  background: var(--fill);
  clip-path: inset(0 100% 0 0);
  pointer-events: none;
}

.task.is-sweeping .task__sweep {
  animation: task-marker 900ms var(--ease-in-out) both;
}

.task.is-sweeping .task__title {
  animation: task-ink 900ms var(--ease-standard) both;
}

.task__text {
  background: linear-gradient(currentColor, currentColor) 0 56% / 0 2.5px no-repeat;
  transition: background-size var(--duration-slow) var(--ease-in-out) 120ms;
  overflow-wrap: anywhere;
}

.task.is-completed .task__title {
  color: var(--fg-muted);
}

.task.is-completed .task__text {
  background-size: 100% 2.5px;
}

.task__actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-right: calc(var(--space-2) * -1);
}

.task__confirm {
  font-size: var(--fs-label);
  font-weight: 700;
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

@media (hover: hover) {
  .task__actions {
    opacity: 0;
    transform: translateX(12px);
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

  .task.is-editable .task__inner:hover .task__hover {
    transform: scaleX(1);
  }

  .task.is-editable .task__inner:hover .task__title {
    transform: translateX(6px);
  }
}

@keyframes task-marker {
  0% {
    clip-path: inset(0 100% 0 0);
  }
  38% {
    clip-path: inset(0 0 0 0);
  }
  58% {
    clip-path: inset(0 0 0 0);
  }
  100% {
    clip-path: inset(0 0 0 100%);
  }
}

@keyframes task-ink {
  0% {
    color: var(--fg);
  }
  20%,
  56% {
    color: var(--on-fill);
  }
  100% {
    color: var(--fg-muted);
  }
}
</style>

<script setup lang="ts">
import TaskItem from '@/components/day/TaskItem.vue'
import type { Task } from '@/types/api'

defineProps<{ tasks: Task[]; editable: boolean }>()
const emit = defineEmits<{ toggle: [id: number]; remove: [id: number] }>()
</script>

<template>
  <TransitionGroup tag="ul" name="task" class="task-list">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :editable="editable"
      @toggle="emit('toggle', $event)"
      @remove="emit('remove', $event)"
    />
  </TransitionGroup>
</template>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--sec-line);
}

/* Enter: the space opens first, then the row's content arrives */
.task-enter-active {
  transition:
    grid-template-rows var(--duration-slow) var(--ease-out),
    opacity var(--duration-base) var(--ease-standard) 90ms;
}

.task-enter-active :deep(.task__clip),
.task-leave-active :deep(.task__clip) {
  overflow: hidden;
}

.task-enter-from {
  grid-template-rows: 0fr;
  opacity: 0;
}

/* Leave: a faster collapse, sliding away to the left */
.task-leave-active {
  transition:
    grid-template-rows var(--duration-base) var(--ease-in-out),
    opacity var(--duration-fast) var(--ease-in),
    transform var(--duration-base) var(--ease-in);
}

.task-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
  transform: translateX(-18px);
}

.task-move {
  transition: transform var(--duration-slow) var(--ease-out);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'

import DaySection from '@/components/day/DaySection.vue'
import TaskComposer from '@/components/day/TaskComposer.vue'
import TaskList from '@/components/day/TaskList.vue'
import type { Task } from '@/types/api'

const props = withDefaults(
  defineProps<{
    tasks: Task[]
    editable: boolean
    accent?: 'primary' | 'secondary'
    tone?: 'paper' | 'alt'
  }>(),
  { accent: 'primary', tone: 'paper' },
)

const emit = defineEmits<{ toggle: [id: number]; remove: [id: number] }>()

const done = computed(() => props.tasks.filter((t) => t.completed).length)
const total = computed(() => props.tasks.length)
const ratio = computed(() => (total.value ? done.value / total.value : 0))
const allDone = computed(() => total.value > 0 && done.value === total.value)
</script>

<template>
  <DaySection index="01" title="Задачи" :tone="tone" :accent="accent">
    <template #meta>
      <div v-if="total > 0" class="tasks-meta">
        <p class="tasks-meta__count tnum">
          <span class="tasks-meta__done">{{ done }}</span>
          <span class="tasks-meta__total"> / {{ total }}</span>
        </p>
        <p class="tasks-meta__caption">{{ allDone ? 'Всё сделано' : 'выполнено' }}</p>
        <div class="tasks-meta__bar" aria-hidden="true">
          <span class="tasks-meta__fill" :class="{ 'is-complete': allDone }" :style="{ transform: `scaleX(${ratio})` }" />
        </div>
      </div>
    </template>

    <p v-if="total === 0" class="tasks-empty">
      {{ editable ? 'Пока ни одной задачи. С чего начнём сегодня?' : 'В этот день задач не было.' }}
    </p>

    <TaskList :tasks="tasks" :editable="editable" @toggle="emit('toggle', $event)" @remove="emit('remove', $event)" />
    <TaskComposer v-if="editable" />
  </DaySection>
</template>

<style scoped>
.tasks-meta {
  display: grid;
  gap: var(--space-1);
  max-width: 14rem;
}

.tasks-meta__count {
  font-family: var(--font-display);
  font-size: var(--fs-page-title);
  font-weight: 300;
  line-height: 1;
  color: var(--sec-text);
}

.tasks-meta__done {
  color: var(--sec-accent);
}

.tasks-meta__total {
  color: var(--sec-muted);
}

.tasks-meta__caption {
  font-size: var(--fs-meta);
}

.tasks-meta__bar {
  height: 2px;
  margin-top: var(--space-3);
  background: var(--sec-line);
  overflow: hidden;
}

.tasks-meta__fill {
  display: block;
  height: 100%;
  background: var(--sec-accent);
  transform-origin: left;
  transition: transform var(--duration-reveal) var(--ease-out);
}

.tasks-empty {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-subhead);
  line-height: var(--lh-snug);
  color: var(--sec-muted);
  padding-bottom: var(--space-4);
  max-width: 24ch;
}
</style>

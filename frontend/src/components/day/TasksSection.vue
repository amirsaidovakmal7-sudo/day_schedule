<script setup lang="ts">
import { computed } from 'vue'

import OdometerNumber from '@/components/base/OdometerNumber.vue'
import ProgressTicks from '@/components/base/ProgressTicks.vue'
import DaySection from '@/components/day/DaySection.vue'
import TaskComposer from '@/components/day/TaskComposer.vue'
import TaskList from '@/components/day/TaskList.vue'
import type { Task } from '@/types/api'

const props = withDefaults(
  defineProps<{ tasks: Task[]; editable: boolean; env?: 'plain' | 'alt' }>(),
  { env: 'plain' },
)

const emit = defineEmits<{ toggle: [id: number]; remove: [id: number] }>()

const done = computed(() => props.tasks.filter((t) => t.completed).length)
const total = computed(() => props.tasks.length)
const allDone = computed(() => total.value > 0 && done.value === total.value)
</script>

<template>
  <DaySection title="Задачи" :env="env" layout="side">
    <template #meta>
      <div v-if="total > 0" class="tm">
        <p class="tm__count tnum">
          <span class="tm__done" style="--od-cell: 0.8em"><OdometerNumber :value="done" :spin="false" /></span>
          <span class="tm__total">/{{ total }}</span>
        </p>
        <ProgressTicks :done="done" :total="total" />
        <p class="tm__caption">{{ allDone ? 'Всё сделано' : 'выполнено' }}</p>
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
.tm {
  display: grid;
  gap: var(--space-3);
  max-width: 16rem;
}

.tm__count {
  display: flex;
  align-items: baseline;
  gap: 0.15em;
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 2.5rem + 3vw, 5.5rem);
  font-weight: 800;
  line-height: 0.8;
}

.tm__done {
  color: var(--hl);
}

.tm__total {
  color: var(--fg-muted);
}

.tm__caption {
  font-size: var(--fs-meta);
  font-weight: 600;
  color: var(--fg-2);
}

.tasks-empty {
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.5rem + 2vw, 3rem);
  font-weight: 700;
  line-height: var(--lh-tight);
  color: var(--fg-muted);
  padding-bottom: var(--space-5);
  max-width: 18ch;
}
</style>

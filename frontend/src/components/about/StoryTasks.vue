<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, watch } from 'vue'

import OdometerNumber from '@/components/base/OdometerNumber.vue'
import ProgressTicks from '@/components/base/ProgressTicks.vue'
import TaskList from '@/components/day/TaskList.vue'
import type { Task } from '@/types/api'

const props = defineProps<{ active: boolean }>()

// Static illustration of the interface — not the user's data.
const tasks = reactive<Task[]>([
  { id: -1, day_id: 0, title: 'Закончить домашнее задание', completed: false },
  { id: -2, day_id: 0, title: 'Ответить клиенту', completed: false },
  { id: -3, day_id: 0, title: 'Сделать тренировку', completed: false },
  { id: -4, day_id: 0, title: 'Прочитать документацию', completed: false },
])

const done = computed(() => tasks.filter((t) => t.completed).length)

let timers: ReturnType<typeof setTimeout>[] = []

function play() {
  timers.forEach(clearTimeout)
  tasks.forEach((t) => (t.completed = false))
  timers = [
    setTimeout(() => (tasks[1].completed = true), 1100),
    setTimeout(() => (tasks[3].completed = true), 2300),
    setTimeout(() => (tasks[0].completed = true), 3500),
    setTimeout(play, 9000),
  ]
}

watch(
  () => props.active,
  (isActive) => {
    if (isActive) play()
    else timers.forEach(clearTimeout)
  },
  { immediate: true },
)

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="demo">
    <header class="demo__head">
      <p class="demo__label">Пример · Задачи</p>
      <p class="demo__count tnum" aria-hidden="true">
        <span class="demo__done"><OdometerNumber :value="done" :spin="false" /></span><span>/{{ tasks.length }}</span>
      </p>
    </header>
    <TaskList :tasks="tasks" :editable="false" />
    <ProgressTicks :done="done" :total="tasks.length" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--space-4);
}

.demo__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: var(--stroke) solid var(--rule-strong);
}

.demo__label {
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--fg-muted);
}

.demo__count {
  display: flex;
  font-family: var(--font-display);
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 0.85;
  color: var(--fg-muted);
  --od-cell: 0.8em;
}

.demo__done {
  color: var(--hl);
}
</style>

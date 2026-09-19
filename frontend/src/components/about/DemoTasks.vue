<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, watch } from 'vue'

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
    setTimeout(() => (tasks[1].completed = true), 900),
    setTimeout(() => (tasks[3].completed = true), 1900),
    setTimeout(() => (tasks[0].completed = true), 2900),
  ]
}

watch(
  () => props.active,
  (isActive) => {
    if (isActive) play()
  },
  { immediate: true },
)

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="demo">
    <header class="demo__head">
      <p class="label demo__label">Пример · Задачи</p>
      <p class="demo__count tnum">
        <span class="demo__done">{{ done }}</span> / {{ tasks.length }}
      </p>
    </header>
    <TaskList :tasks="tasks" :editable="false" />
    <div class="demo__bar" aria-hidden="true">
      <span class="demo__fill" :style="{ transform: `scaleX(${done / tasks.length})` }" />
    </div>
    <p class="demo__caption">Выполненная задача остаётся на месте — виден весь день, а не только остаток.</p>
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
}

.demo__label {
  color: var(--sec-muted);
}

.demo__count {
  font-family: var(--font-display);
  font-size: var(--fs-section-title);
  font-weight: 300;
  line-height: 1;
  color: var(--sec-muted);
}

.demo__done {
  color: var(--sec-accent);
}

.demo__bar {
  height: 2px;
  background: var(--sec-line);
  overflow: hidden;
}

.demo__fill {
  display: block;
  height: 100%;
  background: var(--sec-accent);
  transform-origin: left;
  transition: transform var(--duration-reveal) var(--ease-out);
}

.demo__caption {
  font-size: var(--fs-meta);
  color: var(--sec-muted);
  max-width: 36ch;
}
</style>

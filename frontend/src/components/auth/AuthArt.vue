<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue'

import CurrentDate from '@/components/day/CurrentDate.vue'
import DayRuler from '@/components/day/DayRuler.vue'
import ScheduleTimeline from '@/components/day/ScheduleTimeline.vue'
import TaskList from '@/components/day/TaskList.vue'
import type { ScheduleEntry, Task } from '@/types/api'

defineProps<{ mode: 'login' | 'register' }>()

function localIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const today = localIso()

// Illustration only — clearly not the user's data.
const tasks = reactive<Task[]>([
  { id: -1, day_id: 0, title: 'Ответить клиенту', completed: false },
  { id: -2, day_id: 0, title: 'Прочитать документацию', completed: false },
  { id: -3, day_id: 0, title: 'Сделать тренировку', completed: false },
])

const entries: ScheduleEntry[] = [
  { id: -1, day_id: 0, time: '08:00:00', description: 'Завтрак' },
  { id: -2, day_id: 0, time: '10:30:00', description: 'Работа над проектом' },
  { id: -3, day_id: 0, time: '18:00:00', description: 'Тренировка' },
]

const timers: ReturnType<typeof setTimeout>[] = []
onMounted(() => {
  timers.push(setTimeout(() => (tasks[0].completed = true), 1700))
  timers.push(setTimeout(() => (tasks[1].completed = true), 2900))
})
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <aside class="art env-ink" aria-hidden="true">
    <p class="art__brand">Дневник <em>дня</em></p>

    <div class="art__date">
      <CurrentDate :date="today" />
      <DayRuler />
    </div>

    <Transition name="art-swap" mode="out-in">
      <div v-if="mode === 'login'" key="login" class="art__demo">
        <p class="label art__caption">Пример дня</p>
        <div class="art__tasks"><TaskList :tasks="tasks" :editable="false" /></div>
        <ScheduleTimeline :entries="entries" :editable="false" :show-now="false" />
      </div>

      <div v-else key="register" class="art__demo art__demo--first">
        <p class="label art__caption">С чего начать</p>
        <p class="art__quote">Одна задача и одна запись в расписании — уже целый день.</p>
        <div class="art__node">
          <span class="art__node-dot" />
          <span class="art__node-text">Здесь появится ваше первое событие</span>
        </div>
      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.art {
  --fs-display: clamp(6.5rem, 3rem + 10vw, 11rem);
  --fs-section-title: clamp(1.5rem, 1rem + 1.6vw, 2.5rem);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6) var(--gutter);
  overflow: hidden;
}

.art__brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1;
}

.art__brand em {
  color: var(--ink-accent);
  font-weight: 300;
}

.art__date {
  display: grid;
  gap: var(--space-2);
}

.art__demo {
  display: grid;
  gap: var(--space-4);
  align-content: start;
  margin-top: var(--space-4);
  --time-w: 4.75rem;
}

.art__caption {
  color: var(--ink-muted);
}

.art__tasks :deep(.task-list) {
  border-top-color: var(--ink-line);
}

.art__quote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-section-title);
  font-weight: 300;
  line-height: var(--lh-tight);
  max-width: 18ch;
}

.art__node {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--ink-muted);
  font-size: var(--fs-meta);
}

.art__node-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  border: 1.5px dashed var(--ink-accent);
}

.art-swap-enter-active {
  transition:
    clip-path var(--duration-reveal) var(--ease-out),
    opacity var(--duration-base) var(--ease-standard);
}

.art-swap-leave-active {
  transition: opacity var(--duration-fast) var(--ease-in);
}

.art-swap-enter-from {
  clip-path: inset(0 0 100% 0);
  opacity: 0;
}

.art-swap-leave-to {
  opacity: 0;
}

/* Mobile: a compact band — date and ruler only, so the form is never pushed below the fold */
@media (max-width: 899px) {
  .art {
    --fs-display: clamp(4.5rem, 3rem + 8vw, 6rem);
    gap: var(--space-3);
    padding-block: var(--space-4) var(--space-4);
  }

  .art__demo {
    display: none;
  }

  .art :deep(.date__side) {
    font-size: 1.25rem;
  }

  .art :deep(.ruler) {
    padding-top: var(--space-4);
  }
}

@media (max-height: 820px) {
  .art__tasks {
    display: none;
  }
}
</style>

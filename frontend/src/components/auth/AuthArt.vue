<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue'

import DayHero from '@/components/day/DayHero.vue'
import TaskList from '@/components/day/TaskList.vue'
import type { Task } from '@/types/api'

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

const timers: ReturnType<typeof setTimeout>[] = []
onMounted(() => {
  timers.push(setTimeout(() => (tasks[0].completed = true), 1900))
  timers.push(setTimeout(() => (tasks[1].completed = true), 3300))
})
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <aside class="art env-field" aria-hidden="true">
    <p class="art__brand">Дневник <span>дня</span></p>

    <div class="art__date">
      <DayHero :date="today" live compact />
    </div>

    <Transition name="art-swap" mode="out-in">
      <div v-if="mode === 'login'" key="login" class="art__demo">
        <p class="art__caption">Пример дня</p>
        <TaskList :tasks="tasks" :editable="false" />
      </div>

      <div v-else key="register" class="art__demo art__demo--first">
        <p class="art__quote">Одна задача и одна запись в расписании — уже целый день.</p>
        <div class="art__node">
          <span class="art__node-dot" />
          <span>Здесь появится ваше первое событие</span>
        </div>
      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.art {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5) var(--gutter);
  overflow: hidden;
}

.art__brand {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.art__brand span {
  color: var(--fg-2);
}

.art__demo {
  display: grid;
  gap: var(--space-3);
  align-content: start;
}

.art__caption {
  font-size: var(--fs-label);
  font-weight: 650;
  color: var(--fg-2);
}

.art__demo :deep(.task__inner) {
  min-height: 3.75rem;
  border-bottom-color: var(--rule);
}

.art__demo :deep(.task__title) {
  font-size: 1.25rem;
}

.art__quote {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 1.75rem + 1.6vw, 3.25rem);
  font-weight: 700;
  line-height: var(--lh-tight);
  max-width: 16ch;
}

.art__node {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--fg-2);
  font-size: var(--fs-meta);
  font-weight: 550;
}

.art__node-dot {
  width: 16px;
  height: 16px;
  border: var(--stroke) dashed var(--fg);
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

/* Mobile: a compact band with the date only, so the form is never pushed below the fold */
@media (max-width: 899px) {
  .art {
    gap: var(--space-3);
    padding-block: var(--space-4);
  }

  .art__demo {
    display: none;
  }

  .art :deep(.hd__ruler) {
    display: none;
  }

  .art :deep(.hd) {
    gap: var(--space-3);
  }
}

@media (max-width: 899px) and (max-height: 700px) {
  .art :deep(.hd__top),
  .art :deep(.hd__meta) {
    display: none;
  }
}

@media (min-width: 900px) {
  .art {
    min-height: 100vh;
    justify-content: space-between;
    padding: var(--space-6) var(--space-7);
  }

  .art :deep(.hd.is-compact .hd__numeral) {
    font-size: clamp(11rem, 5rem + 12vw, 17rem);
  }
}

@media (min-width: 900px) and (max-height: 820px) {
  .art__demo {
    display: none;
  }
}
</style>

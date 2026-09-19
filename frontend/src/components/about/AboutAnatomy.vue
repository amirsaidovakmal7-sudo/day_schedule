<script setup lang="ts">
import { vInview } from '@/composables/useInView'

/*
  A miniature of the Today page, top to bottom: date field, tasks, schedule.
  Static illustration of the interface with sample text, not the user's data.
*/
defineProps<{ day: number }>()

const tasks = [
  { title: 'Ответить клиенту', done: true },
  { title: 'Прочитать документацию', done: false },
  { title: 'Сделать тренировку', done: false },
]
const rows = [
  { time: '08:30', text: 'Завтрак' },
  { time: '11:00', text: 'Встреча' },
  { time: '19:00', text: 'Тренировка' },
]
</script>

<template>
  <figure v-inview="{ threshold: 0.25 }" class="anat">
    <div class="anat__frame">
      <div class="anat__band anat__band--date env-field" style="--i: 0">
        <span class="anat__name">Дата</span>
        <span class="anat__num tnum">{{ day }}</span>
      </div>

      <div class="anat__band anat__band--tasks env-plain" style="--i: 1">
        <span class="anat__name">Задачи</span>
        <ul class="anat__list">
          <li v-for="task in tasks" :key="task.title" class="anat__task" :class="{ 'is-done': task.done }">
            <i class="anat__box" />
            <span>{{ task.title }}</span>
          </li>
        </ul>
      </div>

      <div class="anat__band anat__band--board env-board" style="--i: 2">
        <span class="anat__name">Расписание</span>
        <ul class="anat__list">
          <li v-for="row in rows" :key="row.time" class="anat__row">
            <b class="tnum">{{ row.time }}</b>
            <span>{{ row.text }}</span>
          </li>
        </ul>
      </div>
    </div>
    <figcaption class="anat__caption">Так устроена страница «Сегодня»: сверху вниз, пример.</figcaption>
  </figure>
</template>

<style scoped>
.anat {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

.anat__frame {
  width: min(100%, 27rem);
  border: var(--stroke) solid var(--fg);
  display: grid;
  grid-template-rows: 1.35fr 1fr 1fr;
  min-height: 30rem;
}

.anat__band {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  clip-path: inset(0 0 0 0);
  transition: clip-path var(--duration-reveal) var(--ease-out);
  transition-delay: calc(var(--i) * 160ms);
}

.anat[data-inview='false'] .anat__band {
  clip-path: inset(0 100% 0 0);
}

.anat__band + .anat__band {
  border-top: var(--stroke) solid var(--fg);
}

.anat__band--tasks {
  --bg: var(--surface);
  background: var(--bg);
}

.anat__name {
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--fg-2);
}

.anat__num {
  margin-top: auto;
  font-family: var(--font-display);
  font-size: 9rem;
  font-weight: 900;
  line-height: 0.74;
  letter-spacing: -0.02em;
}

.anat__list {
  display: grid;
  gap: var(--space-2);
  margin-top: auto;
}

.anat__task {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 1rem;
  font-weight: 550;
}

.anat__box {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: var(--stroke) solid var(--fg);
}

.anat__task.is-done {
  color: var(--fg-muted);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.anat__task.is-done .anat__box {
  background: var(--fill);
  border-color: var(--fill);
}

.anat__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  font-size: 1rem;
  font-weight: 550;
}

.anat__row b {
  min-width: 3.6rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--time);
}

.anat__caption {
  font-size: var(--fs-label);
  color: var(--fg-muted);
}

@media (max-width: 560px) {
  .anat__frame {
    min-height: 26rem;
  }

  .anat__num {
    font-size: 7rem;
  }
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ active: boolean }>()

// Static illustration of the interface — not the user's data.
const days = [
  { day: '18', weekday: 'Пятница', counts: '4 задачи · 3 записи' },
  { day: '17', weekday: 'Четверг', counts: '5 задач · 2 записи' },
  { day: '16', weekday: 'Среда', counts: '3 задачи · 4 записи' },
  { day: '15', weekday: 'Вторник', counts: '6 задач · 1 запись' },
]

const replay = ref(0)
watch(
  () => props.active,
  (isActive) => {
    if (isActive) replay.value += 1
  },
)
</script>

<template>
  <div class="demo">
    <header class="demo__head">
      <p class="label demo__label">Пример · Дни</p>
      <p class="label demo__badge">Только просмотр</p>
    </header>
    <ul :key="replay" class="demo__list">
      <li v-for="(d, i) in days" :key="d.day" class="row" :style="{ '--i': i }">
        <span class="row__day tnum">{{ d.day }}</span>
        <span class="row__info">
          <span class="row__weekday">{{ d.weekday }}</span>
          <span class="row__counts tnum">{{ d.counts }}</span>
        </span>
      </li>
    </ul>
    <p class="demo__caption">Прошлые дни сохраняются целиком: задачи с отметками и расписание.</p>
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

.demo__badge {
  color: var(--sec-accent);
}

.demo__list {
  border-top: 1px solid var(--sec-line-strong);
}

.row {
  display: grid;
  grid-template-columns: clamp(3.5rem, 3rem + 3vw, 5rem) 1fr;
  align-items: center;
  gap: var(--space-4);
  min-height: 4.75rem;
  border-bottom: 1px solid var(--sec-line);
  animation: history-wipe var(--duration-reveal) var(--ease-out) both;
  animation-delay: calc(var(--i) * 110ms);
}

.row__day {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 1.8rem + 2vw, 3.5rem);
  font-weight: 300;
  line-height: 1;
  color: var(--sec-accent);
}

.row__info {
  display: grid;
  gap: 2px;
}

.row__weekday {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-subhead);
}

.row__counts {
  font-size: var(--fs-meta);
  color: var(--sec-muted);
}

.demo__caption {
  font-size: var(--fs-meta);
  color: var(--sec-muted);
  max-width: 36ch;
}

@keyframes history-wipe {
  from {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-6px);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}
</style>

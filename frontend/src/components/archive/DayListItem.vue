<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'

import BaseIcon from '@/components/base/BaseIcon.vue'
import type { DaySummary } from '@/types/api'
import { dayParts, pluralize } from '@/utils/date'

const props = defineProps<{ day: DaySummary }>()

const parts = computed(() => dayParts(props.day.date))
</script>

<template>
  <RouterLink :to="`/archive/${day.id}`" class="day-row">
    <span class="day-row__day tnum">{{ String(parts.day).padStart(2, '0') }}</span>
    <span class="day-row__info">
      <span class="day-row__weekday">{{ parts.weekday }}</span>
      <span class="day-row__counts tnum">
        {{ day.tasks_count }} {{ pluralize(day.tasks_count, ['задача', 'задачи', 'задач']) }} ·
        {{ day.notes_count }} {{ pluralize(day.notes_count, ['запись', 'записи', 'записей']) }}
      </span>
    </span>
    <span class="day-row__arrow" aria-hidden="true"><BaseIcon :icon="ArrowRight" :size="20" /></span>
    <span class="day-row__line" aria-hidden="true" />
  </RouterLink>
</template>

<style scoped>
.day-row {
  position: relative;
  display: grid;
  grid-template-columns: clamp(4rem, 3rem + 5vw, 6.5rem) minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-4);
  min-height: 5.25rem;
  border-bottom: 1px solid var(--border);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.day-row__day {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 2rem + 2.4vw, 4rem);
  font-weight: 300;
  line-height: 1;
  color: var(--text);
  transition:
    color var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-out);
}

.day-row__info {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.day-row__weekday {
  font-size: var(--fs-subhead);
  font-family: var(--font-display);
  font-style: italic;
  text-transform: capitalize;
  color: var(--text);
}

.day-row__counts {
  font-size: var(--fs-meta);
  color: var(--muted);
}

.day-row__arrow {
  color: var(--muted);
  transition:
    transform var(--duration-base) var(--ease-out),
    color var(--duration-base) var(--ease-standard);
}

.day-row__line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: var(--accent-secondary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-slow) var(--ease-out);
}

.day-row:hover .day-row__day,
.day-row:focus-visible .day-row__day {
  color: var(--accent-secondary);
  transform: translateX(4px);
}

.day-row:hover .day-row__arrow,
.day-row:focus-visible .day-row__arrow {
  color: var(--accent-secondary);
  transform: translateX(6px);
}

.day-row:hover .day-row__line,
.day-row:focus-visible .day-row__line {
  transform: scaleX(1);
}
</style>

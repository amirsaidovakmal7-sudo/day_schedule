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
    <span class="day-row__wash" aria-hidden="true" />
    <span class="day-row__day tnum">{{ String(parts.day).padStart(2, '0') }}</span>
    <span class="day-row__info">
      <span class="day-row__weekday">{{ parts.weekday }}</span>
      <span class="day-row__counts tnum">
        {{ day.tasks_count }} {{ pluralize(day.tasks_count, ['задача', 'задачи', 'задач']) }} ·
        {{ day.notes_count }} {{ pluralize(day.notes_count, ['запись', 'записи', 'записей']) }}
      </span>
    </span>
    <span class="day-row__arrow" aria-hidden="true"><BaseIcon :icon="ArrowRight" :size="24" /></span>
  </RouterLink>
</template>

<style scoped>
/* A torn leaf: the row ends in a perforated edge */
.day-row {
  position: relative;
  display: grid;
  grid-template-columns: clamp(5rem, 3.5rem + 6vw, 8rem) minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-4);
  min-height: 6rem;
  padding-right: var(--space-4);
  border-bottom: 3px dotted color-mix(in srgb, var(--fg) 38%, transparent);
}

.day-row__wash {
  position: absolute;
  inset: 0;
  background: var(--tint);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-slow) var(--ease-out);
}

.day-row__day,
.day-row__info,
.day-row__arrow {
  position: relative;
}

.day-row__day {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 2.5rem + 3.6vw, 5.5rem);
  font-weight: 800;
  line-height: 0.85;
  color: var(--fg);
  padding-left: var(--space-2);
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
  font-size: 1.25rem;
  font-weight: 650;
  text-transform: capitalize;
}

.day-row__counts {
  font-size: var(--fs-meta);
  color: var(--fg-muted);
}

.day-row__arrow {
  color: var(--fg-muted);
  transition:
    transform var(--duration-base) var(--ease-out),
    color var(--duration-base) var(--ease-standard);
}

.day-row:hover .day-row__wash,
.day-row:focus-visible .day-row__wash {
  transform: scaleX(1);
}

.day-row:hover .day-row__day,
.day-row:focus-visible .day-row__day {
  color: var(--hl);
  transform: translateX(6px);
}

.day-row:hover .day-row__arrow,
.day-row:focus-visible .day-row__arrow {
  color: var(--hl);
  transform: translateX(8px);
}
</style>

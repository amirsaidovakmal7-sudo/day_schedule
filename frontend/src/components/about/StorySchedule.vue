<script setup lang="ts">
import ScheduleTimeline from '@/components/day/ScheduleTimeline.vue'
import type { ScheduleEntry } from '@/types/api'

/*
  Sample day for the scroll scene: the entries fill in as the clock (owned by the
  page) passes them. Sample content, not the user's data.
*/
defineProps<{ minutes: number }>()

const entries: ScheduleEntry[] = [
  { id: -1, day_id: 0, time: '08:00:00', description: 'Завтрак' },
  { id: -2, day_id: 0, time: '09:30:00', description: 'Учёба' },
  { id: -3, day_id: 0, time: '12:00:00', description: 'Встреча' },
  { id: -4, day_id: 0, time: '15:30:00', description: 'Работа над проектом' },
  { id: -5, day_id: 0, time: '18:00:00', description: 'Тренировка' },
]
</script>

<template>
  <div class="demo">
    <p class="demo__label">Пример · Расписание</p>
    <ScheduleTimeline :entries="entries" :editable="false" show-now :clock="minutes" />
  </div>
</template>

<style scoped>
/* Row spacing follows the screen height, so the whole day always fits the pinned scene */
.demo {
  --pad-max: clamp(0.5rem, 3.6vh, 2.75rem);
  display: grid;
  gap: var(--space-3);
}

.demo__label {
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--fg-muted);
  padding-bottom: var(--space-2);
  border-bottom: var(--stroke) solid var(--rule-strong);
}
</style>

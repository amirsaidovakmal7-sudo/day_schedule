<script setup lang="ts">
import { ref, watch } from 'vue'

import ScheduleTimeline from '@/components/day/ScheduleTimeline.vue'
import type { ScheduleEntry } from '@/types/api'

const props = defineProps<{ active: boolean }>()

// Static illustration of the interface — not the user's data.
const entries: ScheduleEntry[] = [
  { id: -1, day_id: 0, time: '08:00:00', description: 'Завтрак' },
  { id: -2, day_id: 0, time: '09:00:00', description: 'Учёба' },
  { id: -3, day_id: 0, time: '12:00:00', description: 'Встреча' },
  { id: -4, day_id: 0, time: '15:30:00', description: 'Работа над проектом' },
  { id: -5, day_id: 0, time: '18:00:00', description: 'Тренировка' },
]

/** remounting the timeline replays its drawing each time the step becomes active */
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
      <p class="label demo__label">Пример · Расписание</p>
      <p class="demo__count tnum">{{ entries.length }}</p>
    </header>
    <ScheduleTimeline :key="replay" :entries="entries" :editable="false" :show-now="false" />
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
  color: var(--sec-accent);
}
</style>

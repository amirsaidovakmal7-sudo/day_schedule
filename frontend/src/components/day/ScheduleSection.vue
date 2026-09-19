<script setup lang="ts">
import { computed } from 'vue'

import DaySection from '@/components/day/DaySection.vue'
import ScheduleTimeline from '@/components/day/ScheduleTimeline.vue'
import type { ScheduleEntry } from '@/types/api'
import { formatTime, pluralize } from '@/utils/date'

const props = withDefaults(
  defineProps<{ entries: ScheduleEntry[]; editable: boolean; live?: boolean }>(),
  { live: false },
)

const emit = defineEmits<{ add: []; edit: [entry: ScheduleEntry]; remove: [id: number] }>()

const caption = computed(() => {
  const n = props.entries.length
  return `${n} ${pluralize(n, ['событие', 'события', 'событий'])}`
})

// First and last moments of the day, e.g. "08:30 – 19:00"
const span = computed(() => {
  if (props.entries.length < 2) return ''
  const times = props.entries.map((e) => e.time).sort()
  return `${formatTime(times[0])} – ${formatTime(times[times.length - 1])}`
})
</script>

<template>
  <DaySection title="Расписание" env="board" layout="stack" curtain>
    <template #meta>
      <p v-if="entries.length" class="schedule-meta tnum">
        <strong>{{ caption }}</strong>
        <span v-if="span"> · {{ span }}</span>
      </p>
    </template>

    <ScheduleTimeline
      :entries="entries"
      :editable="editable"
      :show-now="live"
      @add="emit('add')"
      @edit="emit('edit', $event)"
      @remove="emit('remove', $event)"
    />
  </DaySection>
</template>

<style scoped>
.schedule-meta {
  font-size: var(--fs-meta);
  color: var(--fg-muted);
}

.schedule-meta strong {
  color: var(--fg);
  font-weight: 700;
}
</style>

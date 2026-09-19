<script setup lang="ts">
import { computed } from 'vue'

import DaySection from '@/components/day/DaySection.vue'
import ScheduleTimeline from '@/components/day/ScheduleTimeline.vue'
import type { ScheduleEntry } from '@/types/api'
import { pluralize } from '@/utils/date'

const props = withDefaults(
  defineProps<{
    entries: ScheduleEntry[]
    editable: boolean
    live?: boolean
    tone?: 'ink' | 'alt'
    accent?: 'primary' | 'secondary'
  }>(),
  { live: false, tone: 'ink', accent: 'primary' },
)

const emit = defineEmits<{ add: []; edit: [entry: ScheduleEntry]; remove: [id: number] }>()

const caption = computed(() => {
  const n = props.entries.length
  return n === 0 ? '' : `${n} ${pluralize(n, ['событие', 'события', 'событий'])}`
})
</script>

<template>
  <DaySection index="02" title="Расписание" :tone="tone" :accent="accent">
    <template #meta>
      <p v-if="caption" class="schedule-meta tnum">{{ caption }}</p>
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
}
</style>

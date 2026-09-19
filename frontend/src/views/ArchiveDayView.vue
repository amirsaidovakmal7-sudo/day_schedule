<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseErrorState from '@/components/base/BaseErrorState.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import CurrentDate from '@/components/day/CurrentDate.vue'
import ScheduleSection from '@/components/day/ScheduleSection.vue'
import TasksSection from '@/components/day/TasksSection.vue'
import { useBackButton } from '@/composables/useTelegram'
import { useArchiveStore } from '@/stores/archive'
import type { DayDetail } from '@/types/api'
import { statusOf } from '@/utils/errors'

const props = defineProps<{ dayId: number }>()

const archiveStore = useArchiveStore()
const router = useRouter()

const day = ref<DayDetail | null>(null)
const status = ref<'loading' | 'idle' | 'error' | 'missing'>('loading')

useBackButton(() => router.push({ name: 'archive' }))

async function load() {
  status.value = 'loading'
  try {
    day.value = await archiveStore.loadDay(props.dayId)
    status.value = 'idle'
  } catch (e) {
    status.value = statusOf(e) === 404 ? 'missing' : 'error'
  }
}

onMounted(load)

const noop = () => {}
</script>

<template>
  <div class="history">
    <div class="history__band">
      <div class="history__band-inner">
        <RouterLink to="/archive" class="history__back">
          <BaseIcon :icon="ArrowLeft" :size="16" />
          <span>Все дни</span>
        </RouterLink>
        <p class="label history__badge">Архив · только просмотр</p>
      </div>
    </div>

    <div v-if="status === 'loading'" class="history__state" aria-busy="true">
      <BaseSkeleton height="1rem" width="9rem" />
      <BaseSkeleton height="clamp(6rem, 20vw, 12rem)" width="min(60%, 26rem)" />
      <BaseSkeleton height="3.75rem" />
      <BaseSkeleton height="3.75rem" />
    </div>

    <div v-else-if="status === 'missing'" class="history__state">
      <BaseErrorState message="Такого дня нет в вашем архиве." @retry="router.push({ name: 'archive' })" />
    </div>

    <div v-else-if="status === 'error'" class="history__state">
      <BaseErrorState message="Не удалось открыть этот день." @retry="load" />
    </div>

    <template v-else-if="day">
      <header class="history__hero">
        <div class="history__hero-inner">
          <CurrentDate :date="day.date" tone="archive" />
        </div>
      </header>

      <TasksSection :tasks="day.tasks" :editable="false" accent="secondary" @toggle="noop" @remove="noop" />
      <ScheduleSection
        :entries="day.notes"
        :editable="false"
        tone="alt"
        accent="secondary"
        @add="noop"
        @edit="noop"
        @remove="noop"
      />
    </template>
  </div>
</template>

<style scoped>
.history {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background);
}

.history__band {
  background: var(--accent-secondary);
  color: var(--on-secondary);
}

.history__band-inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: 0 var(--gutter);
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.history__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-target-min);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.history__back :deep(svg) {
  transition: transform var(--duration-base) var(--ease-out);
}

.history__back:hover :deep(svg) {
  transform: translateX(-4px);
}

.history__badge {
  opacity: 0.85;
}

.history__hero-inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--space-8) var(--gutter) var(--space-6);
}

.history__state {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--space-7) var(--gutter);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>

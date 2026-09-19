<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseErrorState from '@/components/base/BaseErrorState.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import DayHero from '@/components/day/DayHero.vue'
import ScheduleSection from '@/components/day/ScheduleSection.vue'
import TasksSection from '@/components/day/TasksSection.vue'
import { useScenePhase } from '@/composables/useScenePhase'
import { useBackButton } from '@/composables/useTelegram'
import { useArchiveStore } from '@/stores/archive'
import type { DayDetail } from '@/types/api'
import { statusOf } from '@/utils/errors'

const props = defineProps<{ dayId: number }>()

const archiveStore = useArchiveStore()
const router = useRouter()
const { track } = useScenePhase('board')

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
    <div v-if="status === 'loading'" class="history__state env-board" aria-busy="true">
      <div class="history__state-inner">
        <BaseSkeleton height="2rem" width="11rem" />
        <BaseSkeleton height="clamp(9rem, 26vw, 18rem)" width="min(60%, 26rem)" />
      </div>
    </div>

    <div v-else-if="status === 'missing'" class="history__state history__state--plain">
      <div class="history__state-inner">
        <BaseErrorState message="Такого дня нет в вашем архиве." @retry="router.push({ name: 'archive' })" />
      </div>
    </div>

    <div v-else-if="status === 'error'" class="history__state history__state--plain">
      <div class="history__state-inner">
        <BaseErrorState message="Не удалось открыть этот день." @retry="load" />
      </div>
    </div>

    <template v-else-if="day">
      <header :ref="(el) => track(el, 'board')" class="history__hero env-board">
        <div class="history__hero-inner">
          <DayHero :date="day.date" :live="false">
            <template #top>
              <RouterLink to="/archive" class="history__back">
                <BaseIcon :icon="ArrowLeft" :size="20" />
                <span>Все дни</span>
              </RouterLink>
            </template>
            <p class="history__badge">Этот день в архиве: его можно перечитать, но не изменить.</p>
          </DayHero>
        </div>
      </header>

      <TasksSection
        :ref="(el) => track(el, 'plain')"
        :tasks="day.tasks"
        :editable="false"
        @toggle="noop"
        @remove="noop"
      />
      <ScheduleSection
        :ref="(el) => track(el, 'board')"
        :entries="day.notes"
        :editable="false"
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
}

.history__hero-inner,
.history__state-inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--space-7) var(--gutter) var(--space-6);
}

.history__hero-inner {
  min-height: clamp(26rem, 70vh, 44rem);
  display: flex;
}

/* A past day is a dark hero with the numeral in orange */
.history__hero {
  --numeral: var(--time);
}

.history__hero-inner :deep(.hd) {
  flex: 1;
  align-content: space-between;
}

.history__state {
  min-height: 60vh;
}

.history__state--plain {
  background: var(--background);
}

.history__state-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.history__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-target-min);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.history__back :deep(svg) {
  transition: transform var(--duration-base) var(--ease-out);
}

.history__back:hover :deep(svg) {
  transform: translateX(-5px);
}

.history__badge {
  max-width: 30rem;
  font-size: var(--fs-body);
  font-weight: 600;
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import BaseErrorState from '@/components/base/BaseErrorState.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import AddNoteSheet from '@/components/day/AddNoteSheet.vue'
import CurrentDate from '@/components/day/CurrentDate.vue'
import DayRuler from '@/components/day/DayRuler.vue'
import ScheduleSection from '@/components/day/ScheduleSection.vue'
import TasksSection from '@/components/day/TasksSection.vue'
import { useHaptics } from '@/composables/useHaptics'
import { observeInView } from '@/composables/useInView'
import { useCurrentDayStore } from '@/stores/currentDay'
import { useUiStore } from '@/stores/ui'
import type { ScheduleEntry } from '@/types/api'
import { toUserMessage } from '@/utils/errors'

const dayStore = useCurrentDayStore()
const uiStore = useUiStore()
const haptics = useHaptics()

const isNoteSheetOpen = ref(false)
const editingEntry = ref<ScheduleEntry | null>(null)
const scheduleAnchor = ref<HTMLElement>()
let stopPhase: (() => void) | undefined

onMounted(() => {
  dayStore.load().catch(() => {})
})

// While the schedule occupies the middle of the screen the shell switches to the ink environment.
function trackPhase(el: HTMLElement | undefined) {
  stopPhase?.()
  stopPhase = undefined
  if (!el) return
  stopPhase = observeInView(
    el,
    (visible) => uiStore.setScenePhase(visible ? 'ink' : 'paper'),
    { threshold: 0, rootMargin: '-45% 0px -45% 0px' },
  )
}

function bindSchedule(el: unknown) {
  const node = (el as { $el?: HTMLElement } | null)?.$el ?? undefined
  if (node !== scheduleAnchor.value) {
    scheduleAnchor.value = node
    trackPhase(node)
  }
}

onBeforeUnmount(() => {
  stopPhase?.()
  uiStore.setScenePhase('paper')
})

function openNoteSheet(entry: ScheduleEntry | null = null) {
  editingEntry.value = entry
  isNoteSheetOpen.value = true
}

function closeNoteSheet() {
  isNoteSheetOpen.value = false
  editingEntry.value = null
}

async function handleToggleTask(id: number) {
  try {
    await dayStore.toggleTask(id)
  } catch (e) {
    uiStore.showToast(toUserMessage(e), 'danger')
  }
}

async function handleRemoveTask(id: number) {
  haptics.impact('light')
  try {
    await dayStore.removeTask(id)
  } catch (e) {
    uiStore.showToast(toUserMessage(e), 'danger')
  }
}

async function handleRemoveNote(id: number) {
  haptics.impact('light')
  try {
    await dayStore.removeNote(id)
  } catch (e) {
    uiStore.showToast(toUserMessage(e), 'danger')
  }
}
</script>

<template>
  <div class="today">
    <div v-if="dayStore.status === 'loading' && !dayStore.day" class="today__loading" aria-busy="true">
      <BaseSkeleton height="1rem" width="9rem" />
      <BaseSkeleton height="clamp(6rem, 20vw, 12rem)" width="min(70%, 30rem)" />
      <BaseSkeleton height="3.75rem" />
      <BaseSkeleton height="3.75rem" />
      <BaseSkeleton height="3.75rem" />
    </div>

    <div v-else-if="dayStore.status === 'error' && !dayStore.day" class="today__error">
      <BaseErrorState message="Не удалось загрузить сегодняшний день." @retry="dayStore.load()" />
    </div>

    <template v-else-if="dayStore.day">
      <header class="today__hero">
        <div class="today__hero-inner">
          <CurrentDate :date="dayStore.day.date" />
          <DayRuler />
        </div>
      </header>

      <TasksSection
        :tasks="dayStore.day.tasks"
        :editable="dayStore.day.is_editable"
        @toggle="handleToggleTask"
        @remove="handleRemoveTask"
      />

      <ScheduleSection
        :ref="bindSchedule"
        :entries="dayStore.day.notes"
        :editable="dayStore.day.is_editable"
        live
        @add="openNoteSheet()"
        @edit="openNoteSheet"
        @remove="handleRemoveNote"
      />
    </template>

    <AddNoteSheet :open="isNoteSheetOpen" :edit-entry="editingEntry" @close="closeNoteSheet" />
  </div>
</template>

<style scoped>
.today {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.today__loading,
.today__error {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--space-7) var(--gutter);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.today__hero {
  background: var(--background);
}

.today__hero-inner {
  width: 100%;
  max-width: var(--wide-max);
  min-height: clamp(16rem, 44vh, 36rem);
  margin: 0 auto;
  padding: var(--space-7) var(--gutter) var(--space-6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-7);
}
</style>

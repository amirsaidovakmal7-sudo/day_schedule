<script setup lang="ts">
import { onMounted, ref } from 'vue'

import BaseErrorState from '@/components/base/BaseErrorState.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import AddNoteSheet from '@/components/day/AddNoteSheet.vue'
import DayHero from '@/components/day/DayHero.vue'
import ScheduleSection from '@/components/day/ScheduleSection.vue'
import TasksSection from '@/components/day/TasksSection.vue'
import { useHaptics } from '@/composables/useHaptics'
import { useScenePhase } from '@/composables/useScenePhase'
import { useCurrentDayStore } from '@/stores/currentDay'
import { useUiStore } from '@/stores/ui'
import type { ScheduleEntry } from '@/types/api'
import { toUserMessage } from '@/utils/errors'

const dayStore = useCurrentDayStore()
const uiStore = useUiStore()
const haptics = useHaptics()
// Navigation follows the colour environment centred on screen: field → plain → board
const { track } = useScenePhase('field')

const isNoteSheetOpen = ref(false)
const editingEntry = ref<ScheduleEntry | null>(null)

onMounted(() => {
  dayStore.load().catch(() => {})
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
    <div v-if="dayStore.status === 'loading' && !dayStore.day" class="today__loading env-field" aria-busy="true">
      <div class="today__loading-inner">
        <BaseSkeleton height="2rem" width="11rem" />
        <BaseSkeleton height="clamp(9rem, 26vw, 20rem)" width="min(60%, 30rem)" />
        <BaseSkeleton height="3.5rem" />
      </div>
    </div>

    <div v-else-if="dayStore.status === 'error' && !dayStore.day" class="today__error">
      <BaseErrorState message="Не удалось загрузить сегодняшний день." @retry="dayStore.load()" />
    </div>

    <template v-else-if="dayStore.day">
      <header :ref="(el) => track(el, 'field')" class="today__hero env-field">
        <div class="today__hero-inner">
          <DayHero :date="dayStore.day.date" live />
        </div>
      </header>

      <TasksSection
        :ref="(el) => track(el, 'plain')"
        :tasks="dayStore.day.tasks"
        :editable="dayStore.day.is_editable"
        @toggle="handleToggleTask"
        @remove="handleRemoveTask"
      />

      <ScheduleSection
        :ref="(el) => track(el, 'board')"
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

.today__loading {
  min-height: 70vh;
}

.today__loading-inner,
.today__error {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--space-7) var(--gutter);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.today__hero-inner {
  width: 100%;
  max-width: var(--wide-max);
  min-height: clamp(30rem, 84vh, 54rem);
  margin: 0 auto;
  padding: var(--space-7) var(--gutter) var(--space-6);
  display: flex;
}

.today__hero-inner :deep(.hd) {
  flex: 1;
  align-content: space-between;
}

@media (max-width: 720px) {
  .today__hero-inner {
    min-height: min(34rem, 88svh);
  }
}
</style>

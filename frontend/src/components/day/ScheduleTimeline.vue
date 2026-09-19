<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import BaseIcon from '@/components/base/BaseIcon.vue'
import OdometerNumber from '@/components/base/OdometerNumber.vue'
import ScheduleEntry from '@/components/day/ScheduleEntry.vue'
import { observeInView } from '@/composables/useInView'
import type { ScheduleEntry as Entry } from '@/types/api'
import { timeToMinutes } from '@/utils/date'

const props = defineProps<{
  entries: Entry[]
  editable: boolean
  showNow: boolean
  /** minutes since midnight that replace the real clock (used by the About demo) */
  clock?: number
}>()
const emit = defineEmits<{ add: []; edit: [entry: Entry]; remove: [id: number] }>()

type Item =
  | { kind: 'entry'; key: string; entry: Entry; minutes: number }
  | { kind: 'now'; key: string; minutes: number }

const now = ref(new Date())
let clockTimer: ReturnType<typeof setTimeout> | undefined

function schedule() {
  clockTimer = setTimeout(
    () => {
      now.value = new Date()
      schedule()
    },
    60_000 - (Date.now() % 60_000) + 50,
  )
}

const root = ref<HTMLElement>()
const inView = ref(false)
/** only the very first batch cascades; later entries animate immediately */
const cascade = ref(true)
let stopObserving: (() => void) | undefined

onMounted(() => {
  if (props.clock === undefined) schedule()
  if (root.value) {
    stopObserving = observeInView(
      root.value,
      (visible) => {
        if (!visible || inView.value) return
        inView.value = true
        setTimeout(() => (cascade.value = false), 2400)
        stopObserving?.()
      },
      { threshold: 0.1 },
    )
  }
})

onBeforeUnmount(() => {
  clearTimeout(clockTimer)
  stopObserving?.()
})

const nowMinutes = computed(() => props.clock ?? now.value.getHours() * 60 + now.value.getMinutes())
const nowLabel = computed(() => {
  const m = Math.floor(nowMinutes.value)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
})

const items = computed<Item[]>(() => {
  const list: Item[] = [...props.entries]
    .sort((a, b) => a.time.localeCompare(b.time) || a.id - b.id)
    .map((entry) => ({ kind: 'entry', key: `e-${entry.id}`, entry, minutes: timeToMinutes(entry.time) }))

  if (props.showNow && list.length > 0) {
    const at = list.findIndex((item) => item.minutes > nowMinutes.value)
    const marker: Item = { kind: 'now', key: 'now', minutes: nowMinutes.value }
    if (at === -1) list.push(marker)
    else list.splice(at, 0, marker)
  }
  return list
})

function gapBefore(index: number): number {
  if (index === 0) return 0
  return Math.max(0, items.value[index].minutes - items.value[index - 1].minutes)
}

const count = computed(() => props.entries.length)
</script>

<template>
  <div ref="root" class="timeline" :data-inview="inView ? 'true' : 'false'">
    <p v-if="count === 0" class="timeline__empty">
      {{ editable ? 'Расписание пока пустое. Когда начинается ваш день?' : 'В этот день записей не было.' }}
    </p>

    <TransitionGroup tag="ul" name="entry" class="timeline__list">
      <template v-for="(item, index) in items" :key="item.key">
        <li v-if="item.kind === 'now'" :key="item.key" class="tl-now" :style="{ '--gap': gapBefore(index) }">
          <div class="tl-now__bar">
            <span class="tl-now__time tnum"><OdometerNumber :value="nowLabel" :spin="false" /></span>
            <span class="tl-now__label">сейчас</span>
          </div>
        </li>
        <ScheduleEntry
          v-else
          :key="item.key"
          :entry="item.entry"
          :editable="editable"
          :gap="gapBefore(index)"
          :index="cascade ? index : 0"
          :is-first="index === 0"
          :is-last="index === items.length - 1 && !editable"
          :live="showNow"
          :reached="!showNow || item.minutes <= nowMinutes"
          @edit="emit('edit', $event)"
          @remove="emit('remove', $event)"
        />
      </template>

      <li v-if="editable" key="add" class="tl-add" :class="{ 'is-alone': count === 0 }">
        <span class="tl-add__spacer" aria-hidden="true" />
        <span class="tl-rail" aria-hidden="true"><span class="tl-add__dot" /></span>
        <button type="button" class="tl-add__button" @click="emit('add')">
          <BaseIcon :icon="Plus" :size="18" />
          <span class="tl-add__label">{{ count === 0 ? 'Добавить первую запись' : 'Добавить запись' }}</span>
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.timeline {
  --time-w: 7rem;
  --rail-w: 3rem;
}

.timeline__empty {
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.5rem + 2vw, 3rem);
  font-weight: 700;
  line-height: var(--lh-tight);
  color: var(--fg-muted);
  max-width: 18ch;
  margin-bottom: var(--space-5);
}

.timeline__list {
  display: flex;
  flex-direction: column;
}

/* Nothing plays until the timeline scrolls into view */
.timeline[data-inview='false'] :deep(*) {
  animation-play-state: paused !important;
}

.tl-rail {
  position: relative;
  align-self: stretch;
  justify-self: center;
  width: 2px;
}

/* --- "now": a solid band across the whole row --- */
.tl-now {
  --pad: clamp(1.25rem, calc(var(--gap) * 0.07rem), var(--pad-max, 6rem));
  position: relative;
  padding-top: var(--pad);
}

.tl-now__bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: 2.25rem;
  padding: 0 var(--space-4);
  background: var(--fill);
  color: var(--on-fill);
  transform-origin: left;
  animation: now-bar 700ms var(--ease-out) 300ms both;
}

.tl-now__time {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.5rem;
  --od-cell: 1.5rem;
}

.tl-now__label {
  font-size: var(--fs-label);
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* --- the add node at the end of the route --- */
.tl-add {
  display: grid;
  grid-template-columns: var(--time-w) var(--rail-w) minmax(0, 1fr);
  align-items: start;
  position: relative;
  min-height: 4rem;
}

.tl-add.is-alone {
  grid-template-columns: var(--rail-w) minmax(0, 1fr);
}

.tl-add.is-alone .tl-add__spacer {
  display: none;
}

.tl-add.is-alone .tl-add__button {
  grid-column: 2;
}

.tl-add .tl-rail::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 2px;
  height: 2rem;
  background: repeating-linear-gradient(
    to bottom,
    color-mix(in srgb, var(--fg) 50%, transparent) 0 6px,
    transparent 6px 12px
  );
}

.tl-add.is-alone .tl-rail::before {
  display: none;
}

.tl-add__dot {
  position: absolute;
  left: 50%;
  top: calc(2rem - 8px);
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border: var(--stroke) dashed var(--hl);
  transition:
    transform var(--duration-base) var(--ease-out),
    background-color var(--duration-base) var(--ease-standard);
}

.tl-add:hover .tl-add__dot {
  transform: scale(1.35) rotate(45deg);
  border-style: solid;
  background: var(--fill);
}

.tl-add__button {
  grid-column: 3;
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 4rem;
  padding: 0 var(--space-1);
  color: var(--hl);
  font-size: var(--fs-meta);
  font-weight: 650;
}

.tl-add__label {
  background: linear-gradient(currentColor, currentColor) left bottom / 100% 2px no-repeat;
  padding-bottom: 3px;
  transition: background-size var(--duration-slow) var(--ease-out);
}

.tl-add__button:hover .tl-add__label {
  background-position: right bottom;
  background-size: 0 2px;
}

/* --- list transitions --- */
.entry-enter-active {
  transition:
    grid-template-rows var(--duration-slow) var(--ease-out),
    opacity var(--duration-base) var(--ease-standard);
}

.entry-enter-active :deep(.entry__clip),
.entry-leave-active :deep(.entry__clip) {
  overflow: hidden;
}

.entry-enter-from {
  grid-template-rows: 0fr;
  opacity: 0;
}

.entry-leave-active {
  transition:
    grid-template-rows var(--duration-base) var(--ease-in-out),
    opacity var(--duration-fast) var(--ease-in);
}

.entry-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.entry-move {
  transition: transform var(--duration-slow) var(--ease-out);
}

@keyframes now-bar {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@media (max-width: 560px) {
  .timeline {
    --time-w: 5.25rem;
    --rail-w: 2.25rem;
  }
}
</style>

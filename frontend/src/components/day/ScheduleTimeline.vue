<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import BaseIcon from '@/components/base/BaseIcon.vue'
import ScheduleEntry from '@/components/day/ScheduleEntry.vue'
import { observeInView } from '@/composables/useInView'
import type { ScheduleEntry as Entry } from '@/types/api'
import { timeToMinutes } from '@/utils/date'

const props = defineProps<{ entries: Entry[]; editable: boolean; showNow: boolean }>()
const emit = defineEmits<{ add: []; edit: [entry: Entry]; remove: [id: number] }>()

type Item =
  | { kind: 'entry'; key: string; entry: Entry; minutes: number }
  | { kind: 'now'; key: string; minutes: number }

const now = ref(new Date())
let clock: ReturnType<typeof setInterval> | undefined

const root = ref<HTMLElement>()
const inView = ref(false)
/** only the very first batch cascades; later entries animate immediately */
const cascade = ref(true)
let stopObserving: (() => void) | undefined

onMounted(() => {
  clock = setInterval(() => (now.value = new Date()), 60_000)
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
  clearInterval(clock)
  stopObserving?.()
})

const nowMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
const nowLabel = computed(
  () => `${String(now.value.getHours()).padStart(2, '0')}:${String(now.value.getMinutes()).padStart(2, '0')}`,
)

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
          <span class="tl-now__time label tnum">{{ nowLabel }}</span>
          <span class="tl-rail" aria-hidden="true"><span class="tl-now__dot" /></span>
          <span class="tl-now__line"><span class="label">Сейчас</span></span>
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
          @edit="emit('edit', $event)"
          @remove="emit('remove', $event)"
        />
      </template>

      <li v-if="editable" key="add" class="tl-add" :class="{ 'is-alone': count === 0 }">
        <span class="tl-add__spacer" aria-hidden="true" />
        <span class="tl-rail" aria-hidden="true"><span class="tl-add__dot" /></span>
        <button type="button" class="tl-add__button" @click="emit('add')">
          <BaseIcon :icon="Plus" :size="16" />
          <span class="tl-add__label">{{ count === 0 ? 'Добавить первую запись' : 'Добавить запись' }}</span>
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.timeline {
  --time-w: 5.5rem;
}

.timeline__empty {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-subhead);
  line-height: var(--lh-snug);
  color: var(--sec-muted);
  max-width: 26ch;
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

/* --- shared rail geometry for the "now" and "add" rows --- */
.tl-now,
.tl-add {
  display: grid;
  grid-template-columns: var(--time-w) 1.75rem minmax(0, 1fr);
  align-items: start;
  position: relative;
}

.tl-rail {
  position: relative;
  align-self: stretch;
  justify-self: center;
  width: 1px;
}

.tl-now {
  --pad: clamp(1.25rem, calc(var(--gap) * 0.07rem), 5.5rem);
  padding-top: var(--pad);
  min-height: calc(var(--pad) + 1.25rem);
}

.tl-now .tl-rail {
  margin-top: calc(-1 * var(--pad));
}

.tl-now .tl-rail::before,
.tl-add .tl-rail::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 1px;
  background: var(--sec-line-strong);
}

.tl-now__time {
  color: var(--sec-accent);
  line-height: 1.25rem;
  font-weight: 700;
}

.tl-now__dot {
  position: absolute;
  left: 50%;
  top: calc(var(--pad) + 0.625rem - 5px);
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: var(--radius-full);
  background: var(--sec-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--sec-accent) 22%, transparent);
}

.tl-now__line {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 1.25rem;
  color: var(--sec-accent);
}

.tl-now__line::after {
  content: '';
  flex: 1;
  height: 1px;
  background: currentColor;
  opacity: 0.55;
  transform-origin: left;
  animation: now-line 900ms var(--ease-out) 300ms both;
}

/* --- the add node at the end of the rail --- */
.tl-add {
  min-height: var(--tap-target-min);
}

.tl-add.is-alone {
  grid-template-columns: 1.75rem minmax(0, 1fr);
}

.tl-add.is-alone .tl-add__spacer {
  display: none;
}

.tl-add.is-alone .tl-add__button {
  grid-column: 2;
}

.tl-add .tl-rail::before {
  inset: 0 auto auto 0;
  height: calc(var(--tap-target-min) / 2);
}

.tl-add.is-alone .tl-rail::before {
  display: none;
}

.tl-add__dot {
  position: absolute;
  left: 50%;
  top: calc(var(--tap-target-min) / 2 - 5px);
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: var(--radius-full);
  border: 1.5px dashed var(--sec-accent);
  transition: transform var(--duration-base) var(--ease-out);
}

.tl-add:hover .tl-add__dot {
  transform: scale(1.5);
  border-style: solid;
}

.tl-add__button {
  grid-column: 3;
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-target-min);
  padding: 0 var(--space-1);
  color: var(--sec-accent);
  font-size: var(--fs-meta);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.tl-add__label {
  background: linear-gradient(currentColor, currentColor) left bottom / 0 1px no-repeat;
  padding-bottom: 2px;
  transition: background-size var(--duration-slow) var(--ease-out);
}

.tl-add__button:hover .tl-add__label {
  background-size: 100% 1px;
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

@keyframes now-line {
  from {
    transform: scaleX(0);
  }
}

@media (max-width: 480px) {
  .timeline {
    --time-w: 4.5rem;
  }
}
</style>

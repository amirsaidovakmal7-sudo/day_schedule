<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'

import IconButton from '@/components/base/IconButton.vue'
import type { ScheduleEntry } from '@/types/api'
import { formatTime } from '@/utils/date'

const props = defineProps<{
  entry: ScheduleEntry
  editable: boolean
  /** minutes since the previous item; drives the vertical breathing room */
  gap: number
  index: number
  isFirst: boolean
  isLast: boolean
  /** the moment has already happened (or the day is not live) */
  reached: boolean
  /** live day: entries still ahead are dimmed */
  live: boolean
}>()
const emit = defineEmits<{ edit: [entry: ScheduleEntry]; remove: [id: number] }>()

const armed = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

function onDelete() {
  if (!armed.value) {
    armed.value = true
    resetTimer = setTimeout(() => (armed.value = false), 2600)
    return
  }
  clearTimeout(resetTimer)
  emit('remove', props.entry.id)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <li
    class="entry"
    :class="{
      'is-first': isFirst,
      'is-last': isLast,
      'is-editable': editable,
      'is-reached': reached,
      'is-ahead': live && !reached,
    }"
    :style="{ '--gap': gap, '--i': index }"
  >
    <div class="entry__clip">
      <div class="entry__row">
        <span class="entry__time tnum">{{ formatTime(entry.time) }}</span>
        <span class="entry__rail" aria-hidden="true"><span class="entry__dot" /></span>
        <div class="entry__body">
          <component
            :is="editable ? 'button' : 'p'"
            class="entry__text"
            :type="editable ? 'button' : undefined"
            :aria-label="editable ? `Изменить запись: ${entry.description}` : undefined"
            @click="editable && emit('edit', entry)"
          >
            <span class="entry__text-inner">{{ entry.description }}</span>
          </component>
          <div v-if="editable" class="entry__actions">
            <span class="entry__confirm" :class="{ 'is-visible': armed }" aria-live="polite">
              {{ armed ? 'Удалить?' : '' }}
            </span>
            <IconButton
              :icon="Trash2"
              :label="armed ? 'Подтвердить удаление' : 'Удалить запись'"
              tone="danger"
              :size="19"
              :class="{ 'is-armed': armed }"
              @click="onDelete"
            />
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.entry {
  --time-h: 3rem;
  display: grid;
  grid-template-rows: 1fr;
  color: var(--fg);
  /* the first batch cascades; later entries start at once */
  --base: calc(var(--i, 0) * 120ms);
  --pad: clamp(1.5rem, calc(var(--gap) * 0.07rem), var(--pad-max, 6rem));
}

.entry.is-first {
  --pad: 0px;
}

.entry__clip {
  min-height: 0;
}

.entry__row {
  position: relative;
  display: grid;
  grid-template-columns: var(--time-w, 7rem) var(--rail-w, 3rem) minmax(0, 1fr);
  align-items: start;
  padding-top: var(--pad);
  min-height: calc(var(--time-h) + var(--pad) + 1.25rem);
}

/* Time wipes in from the left; the description rises out of a mask — two motion families */
.entry__time {
  font-family: var(--font-display);
  font-size: var(--fs-time);
  font-weight: 800;
  line-height: var(--time-h);
  letter-spacing: -0.005em;
  color: var(--time);
  animation: time-wipe 620ms var(--ease-out) both;
  animation-delay: calc(var(--base) + 240ms);
  transition:
    color var(--duration-fast) var(--ease-standard),
    opacity var(--duration-slow) var(--ease-standard);
}

.entry.is-ahead .entry__time {
  color: var(--fg);
  opacity: 0.62;
}

.entry__rail {
  position: relative;
  align-self: stretch;
  justify-self: center;
  width: 2px;
  margin-top: calc(-1 * var(--pad));
}

/* The route: a solid line where the day has been, dashes where it is still to come */
.entry__rail::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--time);
  transform-origin: top;
  animation: rail-draw 700ms var(--ease-out) both;
  animation-delay: var(--base);
}

.entry.is-ahead .entry__rail::before {
  background: repeating-linear-gradient(
    to bottom,
    color-mix(in srgb, var(--fg) 50%, transparent) 0 6px,
    transparent 6px 12px
  );
}

.entry.is-first .entry__rail::before {
  top: calc(var(--time-h) / 2);
}

.entry.is-last .entry__rail::before {
  bottom: auto;
  height: calc(var(--pad) + var(--time-h) / 2 + var(--space-5));
  mask-image: linear-gradient(#000 65%, transparent);
}

.entry.is-first.is-last .entry__rail::before {
  top: calc(var(--time-h) / 2);
  height: var(--space-6);
}

/* Stops are squares: filled once reached, hollow while ahead */
.entry__dot {
  position: absolute;
  left: 50%;
  top: calc(var(--pad) + var(--time-h) / 2 - 8px);
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border: var(--stroke) solid var(--time);
  background: var(--time);
  animation: dot-turn 560ms var(--ease-out) both;
  animation-delay: calc(var(--base) + 160ms);
  transition:
    transform var(--duration-base) var(--ease-out),
    background-color var(--duration-fast) var(--ease-standard);
}

.entry.is-ahead .entry__dot {
  border-color: var(--fg);
  background: var(--bg);
}

.entry__body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  min-width: 0;
  padding-top: calc((var(--time-h) - 1.75rem) / 2);
}

.entry__text {
  flex: 1;
  min-width: 0;
  min-height: 1.75rem;
  padding: 0;
  overflow: hidden;
  text-align: left;
  font-size: var(--fs-task);
  line-height: 1.75rem;
  font-weight: 550;
  color: var(--fg);
  overflow-wrap: anywhere;
  transition: color var(--duration-slow) var(--ease-standard);
}

.entry.is-ahead .entry__text {
  color: var(--fg-2);
  font-weight: 500;
}

.entry__text-inner {
  display: inline-block;
  transition: transform var(--duration-base) var(--ease-out);
  animation: text-rise 700ms var(--ease-out) both;
  animation-delay: calc(var(--base) + 380ms);
}

.entry__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin: calc((var(--time-h) - var(--tap-target-min)) / 2 - 0.875rem) calc(var(--space-2) * -1) 0 0;
}

.entry__confirm {
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--danger);
  opacity: 0;
  transform: translateX(6px);
  transition:
    opacity var(--duration-fast) var(--ease-standard),
    transform var(--duration-base) var(--ease-out);
}

.entry__confirm.is-visible {
  opacity: 1;
  transform: none;
}

@media (hover: hover) {
  .entry__actions {
    opacity: 0;
    transform: translateX(12px);
    transition:
      opacity var(--duration-fast) var(--ease-standard),
      transform var(--duration-base) var(--ease-out);
  }

  .entry__row:hover .entry__actions,
  .entry__row:focus-within .entry__actions,
  .entry__actions:has(.is-armed) {
    opacity: 1;
    transform: none;
  }
}

.entry.is-editable .entry__row:hover .entry__time {
  color: var(--fg);
  opacity: 1;
}

.entry.is-editable .entry__row:hover .entry__dot {
  transform: scale(1.35) rotate(45deg);
}

.entry.is-editable .entry__row:hover .entry__text-inner {
  transform: translateX(6px);
}

@keyframes rail-draw {
  from {
    transform: scaleY(0);
  }
}

@keyframes dot-turn {
  from {
    transform: scale(0) rotate(90deg);
  }
}

@keyframes time-wipe {
  from {
    clip-path: inset(0 100% 0 0);
    transform: translateX(-0.3em);
  }
  to {
    clip-path: inset(0 -0.2em 0 0);
  }
}

@keyframes text-rise {
  from {
    transform: translateY(110%);
  }
}
</style>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'

import IconButton from '@/components/base/IconButton.vue'
import type { ScheduleEntry } from '@/types/api'
import { formatTime } from '@/utils/date'

const props = defineProps<{
  entry: ScheduleEntry
  editable: boolean
  /** minutes since the previous item — drives the vertical breathing room */
  gap: number
  index: number
  isFirst: boolean
  isLast: boolean
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
    :class="{ 'is-first': isFirst, 'is-last': isLast, 'is-editable': editable }"
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
              :size="17"
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
  --time-h: 2.5rem;
  display: grid;
  grid-template-rows: 1fr;
  color: var(--sec-text);
  /* base delay: the initial batch cascades, later entries start immediately */
  --base: calc(var(--i, 0) * 110ms);
}

.entry__clip {
  min-height: 0;
}

.entry {
  --pad: clamp(1.25rem, calc(var(--gap) * 0.07rem), 5.5rem);
}

.entry.is-first {
  --pad: 0px;
}

.entry__row {
  position: relative;
  display: grid;
  grid-template-columns: var(--time-w, 5.5rem) 1.75rem minmax(0, 1fr);
  align-items: start;
  padding-top: var(--pad);
  min-height: calc(var(--time-h) + var(--pad) + 1.5rem);
}

/* Time: large serif numerals, wiped in from the left */
.entry__time {
  font-family: var(--font-display);
  font-size: clamp(1.625rem, 1.3rem + 1.2vw, 2.25rem);
  font-weight: 300;
  line-height: var(--time-h);
  color: var(--sec-accent);
  animation: time-wipe 620ms var(--ease-out) both;
  animation-delay: calc(var(--base) + 240ms);
  transition: color var(--duration-fast) var(--ease-standard);
}

.entry__rail {
  position: relative;
  align-self: stretch;
  justify-self: center;
  width: 1px;
  margin-top: calc(-1 * var(--pad));
}

/* The rail segment: draws downward from the previous dot */
.entry__rail::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--sec-line-strong);
  transform-origin: top;
  animation: rail-draw 700ms var(--ease-out) both;
  animation-delay: var(--base);
}

.entry.is-first .entry__rail::before {
  top: calc(var(--time-h) / 2);
}

.entry.is-last .entry__rail::before {
  bottom: auto;
  height: calc(var(--pad) + var(--time-h) / 2 + var(--space-5));
  background: linear-gradient(var(--sec-line-strong) 70%, transparent);
}

.entry.is-first.is-last .entry__rail::before {
  top: calc(var(--time-h) / 2);
  height: var(--space-6);
  background: linear-gradient(var(--sec-line-strong) 30%, transparent);
}

.entry__dot {
  position: absolute;
  left: 50%;
  top: calc(var(--pad) + var(--time-h) / 2 - 5px);
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: var(--radius-full);
  background: var(--sec-bg, var(--ink));
  border: 2px solid var(--sec-accent);
  animation: dot-pop 520ms var(--ease-pop) both;
  animation-delay: calc(var(--base) + 160ms);
  transition:
    transform var(--duration-base) var(--ease-out),
    background-color var(--duration-fast) var(--ease-standard);
}

.entry__body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  min-width: 0;
  padding-top: calc((var(--time-h) - 1.5rem) / 2);
}

.entry__text {
  flex: 1;
  min-width: 0;
  min-height: 1.5rem;
  padding: 0;
  text-align: left;
  font-size: var(--fs-task);
  line-height: 1.5rem;
  font-weight: 400;
  color: var(--sec-text);
  overflow-wrap: anywhere;
  animation: text-reveal 700ms var(--ease-out) both;
  animation-delay: calc(var(--base) + 380ms);
}

.entry__text-inner {
  display: inline-block;
  transition: transform var(--duration-base) var(--ease-out);
}

.entry__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin: calc((var(--time-h) - var(--tap-target-min)) / 2 - 0.75rem) calc(var(--space-2) * -1) 0 0;
}

.entry__confirm {
  font-size: var(--fs-meta);
  font-weight: 600;
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
    transform: translateX(10px);
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
  color: var(--sec-text);
}

.entry.is-editable .entry__row:hover .entry__dot {
  transform: scale(1.5);
  background: var(--sec-accent);
}

.entry.is-editable .entry__row:hover .entry__text-inner {
  transform: translateX(4px);
}

@keyframes rail-draw {
  from {
    transform: scaleY(0);
  }
}

@keyframes dot-pop {
  from {
    transform: scale(0);
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

@keyframes text-reveal {
  from {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
  to {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}
</style>

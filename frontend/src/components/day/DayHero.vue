<script setup lang="ts">
import { computed } from 'vue'

import OdometerNumber from '@/components/base/OdometerNumber.vue'
import DayRuler from '@/components/day/DayRuler.vue'
import { dayParts, dayOfYear, isoWeek } from '@/utils/date'

/*
  The date as a poster: a monumental rolling numeral, the month beside it,
  a live ruler of the day underneath. Colours come from the surrounding
  environment (field for today, warm for the past).
*/
const props = withDefaults(defineProps<{ date: string; live?: boolean; compact?: boolean }>(), {
  live: true,
  compact: false,
})

const parts = computed(() => dayParts(props.date))
const yearDay = computed(() => dayOfYear(props.date))
const week = computed(() => isoWeek(props.date))
</script>

<template>
  <div class="hd" :class="{ 'is-compact': compact }">
    <div class="hd__top">
      <div v-if="$slots.top" class="hd__pre"><slot name="top" /></div>
      <p class="hd__weekday"><span class="hd__rise">{{ parts.weekday }}</span></p>
      <span class="hd__rule" aria-hidden="true" />
      <p class="hd__year tnum">{{ parts.year }}</p>
    </div>

    <div class="hd__main">
      <h1 class="hd__numeral" :aria-label="`${parts.day} ${parts.month} ${parts.year}`">
        <OdometerNumber :value="parts.day" :stagger="120" :delay="80" />
      </h1>
      <p class="hd__month" aria-hidden="true"><span class="hd__month-text">{{ parts.month }}</span></p>
      <p class="hd__meta tnum" aria-hidden="true">{{ yearDay }}-й день года · {{ week }}-я неделя</p>
    </div>

    <DayRuler v-if="live" class="hd__ruler" />
    <div v-else-if="$slots.default" class="hd__note"><slot /></div>
  </div>
</template>

<style scoped>
.hd {
  --od-cell: 0.8em;
  display: grid;
  gap: var(--space-6);
}

.hd__top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.hd__pre {
  flex-basis: 100%;
  margin-bottom: var(--space-3);
}

.hd__weekday {
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.4rem + 1.8vw, 3rem);
  font-weight: 700;
  line-height: 1;
  overflow: hidden;
  padding-bottom: 0.12em;
}

.hd__rise {
  display: block;
  animation: hd-rise var(--duration-reveal) var(--ease-out) 60ms both;
}

.hd__rule {
  flex: 1;
  min-width: 2rem;
  height: var(--stroke);
  background: var(--fg);
  transform-origin: left;
  animation: hd-draw var(--duration-draw) var(--ease-out) 200ms both;
}

.hd__year {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.2rem + 0.9vw, 2.125rem);
  font-weight: 700;
  line-height: 1;
  animation: hd-fade var(--duration-slow) var(--ease-standard) 700ms both;
}

.hd__main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    'numeral month'
    'numeral meta';
  grid-template-rows: 1fr auto;
  align-items: end;
  column-gap: clamp(1rem, 0.25rem + 3vw, 3.5rem);
  row-gap: var(--space-3);
}

.hd__numeral {
  grid-area: numeral;
  font-family: var(--font-display);
  font-size: var(--fs-numeral);
  font-weight: 900;
  line-height: var(--lh-numeral);
  letter-spacing: -0.02em;
  color: var(--numeral, var(--fg));
  margin-top: 0.02em;
}

.hd__month {
  grid-area: month;
  align-self: end;
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 1.5rem + 7.5vw, 9.5rem);
  font-weight: 800;
  line-height: 0.82;
  letter-spacing: -0.01em;
  padding-top: 0.06em;
}

.hd__month-text {
  display: block;
  animation: hd-wipe 900ms var(--ease-out) 420ms both;
}

.hd__meta {
  grid-area: meta;
  font-size: var(--fs-label);
  font-weight: 600;
  color: var(--fg-2);
  padding-bottom: 0.35em;
  animation: hd-fade var(--duration-slow) var(--ease-standard) 900ms both;
}

/* Small screens: the month stands upright beside the numeral, like a spine */
@media (max-width: 720px) {
  .hd__main {
    grid-template-columns: auto auto;
    grid-template-areas:
      'numeral month'
      'meta meta';
    grid-template-rows: auto auto;
    justify-content: start;
    align-items: stretch;
    column-gap: var(--space-4);
    row-gap: var(--space-4);
  }

  .hd__month {
    align-self: stretch;
    justify-self: start;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: clamp(3rem, 2rem + 6vw, 4.25rem);
    line-height: 0.95;
    padding: 0;
  }

  .hd__month-text {
    animation-name: hd-wipe-up;
  }

  .hd__meta {
    padding-bottom: 0;
  }
}

.hd__note {
  color: var(--fg-2);
  font-size: var(--fs-meta);
}

.hd.is-compact {
  gap: var(--space-4);
}

.hd.is-compact .hd__numeral {
  font-size: clamp(9rem, 4rem + 14vw, 16rem);
}

.hd.is-compact .hd__month {
  font-size: clamp(2.5rem, 1rem + 4.5vw, 5.5rem);
}

@keyframes hd-rise {
  from {
    transform: translateY(105%);
  }
}

@keyframes hd-draw {
  from {
    transform: scaleX(0);
  }
}

@keyframes hd-fade {
  from {
    opacity: 0;
  }
}

@keyframes hd-wipe {
  from {
    clip-path: inset(0 100% 0 0);
    transform: translateX(-0.3em);
  }
  to {
    clip-path: inset(0 -0.2em 0 0);
  }
}

@keyframes hd-wipe-up {
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

/* Scroll-driven: the numeral drifts and fades as the page moves up (compositor-only) */
@supports (animation-timeline: scroll()) {
  .hd:not(.is-compact) .hd__numeral {
    animation: hd-drift linear both;
    animation-timeline: scroll(root);
    animation-range: 0 60vh;
  }

  @keyframes hd-drift {
    to {
      transform: translateY(7vh);
      opacity: 0.25;
    }
  }
}
</style>

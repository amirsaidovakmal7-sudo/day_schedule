<script setup lang="ts">
import { computed } from 'vue'

import { dayParts } from '@/utils/date'

const props = withDefaults(
  defineProps<{ date: string; variant?: 'hero' | 'compact'; tone?: 'today' | 'archive' }>(),
  { variant: 'hero', tone: 'today' },
)

const parts = computed(() => dayParts(props.date))
const digits = computed(() => String(parts.value.day).split(''))
</script>

<template>
  <div class="date" :class="[`date--${variant}`, `date--${tone}`]">
    <p class="label date__weekday">
      <span class="date__weekday-rule" aria-hidden="true" />
      <span class="date__weekday-text">{{ parts.weekday }}</span>
    </p>

    <div class="date__row">
      <p class="date__numeral" :aria-label="`${parts.day} ${parts.month} ${parts.year}`">
        <span class="date__parallax" aria-hidden="true">
          <span v-for="(digit, i) in digits" :key="i" class="date__mask">
            <span class="date__digit" :style="{ '--d': i }">{{ digit }}</span>
          </span>
        </span>
      </p>

      <div class="date__side" aria-hidden="true">
        <p class="date__month">{{ parts.month }}</p>
        <p class="label date__year tnum">
          <span class="date__year-rule" />
          {{ parts.year }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date {
  --date-accent: var(--accent);
  --date-numeral: var(--text);
}

.date--archive {
  --date-accent: var(--accent-secondary);
  --date-numeral: var(--accent-secondary);
}

.date__weekday {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--date-accent);
}

.date__weekday-rule {
  height: 1px;
  width: 3rem;
  background: currentColor;
  transform-origin: left;
  animation: draw-x var(--duration-draw) var(--ease-out) 100ms both;
}

.date__weekday-text {
  animation: fade-in var(--duration-slow) var(--ease-standard) 350ms both;
}

.date__row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-4) var(--space-5);
  flex-wrap: wrap;
}

.date__numeral {
  display: flex;
  font-family: var(--font-display);
  font-weight: 300;
  color: var(--date-numeral);
  font-feature-settings: 'lnum';
}

.date__parallax {
  display: flex;
}

.date__mask {
  display: block;
  overflow: hidden;
  padding: 0.04em 0.02em 0;
}

.date__digit {
  display: block;
  animation: digit-rise var(--duration-reveal) var(--ease-out) both;
  animation-delay: calc(120ms + var(--d) * 90ms);
}

.date__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: 0.9em;
  font-size: var(--fs-section-title);
}

.date__month {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 1em;
  line-height: 1;
  color: var(--date-accent);
  animation: wipe-x 900ms var(--ease-out) 450ms both;
}

.date__year {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--muted);
  animation: fade-in var(--duration-slow) var(--ease-standard) 800ms both;
}

.date__year-rule {
  height: 1px;
  width: 2rem;
  background: currentColor;
}

/* Hero: a giant numeral is the page's anchor */
.date--hero .date__numeral {
  font-size: var(--fs-display);
  line-height: var(--lh-none);
  letter-spacing: -0.04em;
}

.date--hero .date__side {
  font-size: clamp(1.5rem, 1rem + 2.6vw, 3.25rem);
}

.date--hero .date__weekday {
  margin-bottom: var(--space-3);
}

/* Compact: used for historical days */
.date--compact .date__numeral {
  font-size: clamp(3.5rem, 2.5rem + 5vw, 6.5rem);
  line-height: var(--lh-none);
  letter-spacing: -0.03em;
}

.date--compact .date__side {
  font-size: var(--fs-subhead);
  padding-bottom: 0.4em;
}

.date--compact .date__weekday {
  margin-bottom: var(--space-2);
}

@keyframes digit-rise {
  from {
    transform: translateY(105%);
  }
}

@keyframes draw-x {
  from {
    transform: scaleX(0);
  }
}

@keyframes wipe-x {
  from {
    clip-path: inset(0 100% 0 0);
    transform: translateX(-0.4em);
  }
  to {
    clip-path: inset(0 -0.2em 0 0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

/* Scroll-driven parallax where the platform supports it (compositor-only) */
@supports (animation-timeline: scroll()) {
  .date--hero .date__parallax {
    animation: numeral-parallax linear both;
    animation-timeline: scroll(root);
    animation-range: 0 70vh;
  }

  @keyframes numeral-parallax {
    to {
      transform: translateY(10vh);
      opacity: 0.18;
    }
  }
}
</style>

<script setup lang="ts">
import { vInview } from '@/composables/useInView'

/*
  Chassis for a part of the day. `layout="side"` puts the title in a sticky
  column beside the body (tasks); `layout="stack"` sets the title across the
  top with the meta at its right (schedule). The environment decides colour.
*/
withDefaults(
  defineProps<{
    title: string
    env?: 'plain' | 'alt' | 'board'
    layout?: 'side' | 'stack'
    curtain?: boolean
  }>(),
  { env: 'plain', layout: 'side', curtain: false },
)
</script>

<template>
  <section
    v-inview="{ threshold: 0.08 }"
    class="day-section"
    :class="[`env-${env}`, `day-section--${layout}`, { 'has-curtain': curtain }]"
  >
    <div class="day-section__inner">
      <span class="day-section__rule" aria-hidden="true" />
      <header class="day-section__head">
        <h2 class="day-section__title">
          <span class="day-section__mask"><span class="day-section__title-text">{{ title }}</span></span>
        </h2>
        <div v-if="$slots.meta" class="day-section__meta"><slot name="meta" /></div>
      </header>
      <div class="day-section__body"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.day-section {
  position: relative;
  isolation: isolate;
  transition:
    background-color var(--duration-slow) var(--ease-standard),
    color var(--duration-slow) var(--ease-standard);
}

.day-section__inner {
  position: relative;
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--section-y) var(--gutter);
  display: grid;
  gap: var(--space-6) var(--space-7);
}

/* The heavy rule that opens the section, drawn once when it scrolls into view */
.day-section__rule {
  position: absolute;
  left: var(--gutter);
  right: var(--gutter);
  top: calc(var(--section-y) * 0.5);
  height: var(--stroke);
  background: var(--rule-strong);
  transform-origin: left;
  transition: transform var(--duration-draw) var(--ease-out);
}

.day-section__head {
  display: grid;
  gap: var(--space-4);
  align-content: start;
  padding-top: var(--space-4);
}

.day-section__mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;
}

.day-section__title {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 800;
  line-height: var(--lh-display);
  letter-spacing: -0.005em;
}

.day-section__title-text {
  display: block;
  transition: transform var(--duration-reveal) var(--ease-out) 120ms;
}

.day-section[data-inview='false'] .day-section__rule {
  transform: scaleX(0);
}

.day-section[data-inview='false'] .day-section__title-text {
  transform: translateY(108%);
}

.day-section__body {
  min-width: 0;
}

/* Side layout: title column sticks while the list scrolls */
@media (min-width: 900px) {
  .day-section--side .day-section__inner {
    grid-template-columns: minmax(15rem, 1fr) minmax(0, 2.4fr);
    align-items: start;
  }

  .day-section--side .day-section__head {
    position: sticky;
    top: var(--space-7);
  }
}

/* Stack layout: title across the top, meta at the right */
.day-section--stack .day-section__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3) var(--space-6);
}

/* The board arrives like a curtain: its colour wipes across as it scrolls into view */
.has-curtain {
  background: transparent;
}

.has-curtain::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--bg);
}

@supports (animation-timeline: view()) {
  .has-curtain::before {
    animation: curtain linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }

  @keyframes curtain {
    from {
      clip-path: inset(0 100% 0 0);
    }
    to {
      clip-path: inset(0 0 0 0);
    }
  }
}
</style>

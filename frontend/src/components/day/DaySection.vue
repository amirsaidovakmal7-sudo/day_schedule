<script setup lang="ts">
import { vInview } from '@/composables/useInView'

withDefaults(
  defineProps<{
    index: string
    title: string
    tone?: 'paper' | 'alt' | 'ink'
    accent?: 'primary' | 'secondary'
  }>(),
  { tone: 'paper', accent: 'primary' },
)
</script>

<template>
  <section
    v-inview="{ threshold: 0.12 }"
    class="day-section"
    :class="[`day-section--${tone}`, { 'is-secondary': accent === 'secondary' }]"
  >
    <div class="day-section__inner">
      <header class="day-section__head">
        <p class="label day-section__index">
          <span class="day-section__rule" aria-hidden="true" />
          {{ index }}
        </p>
        <h2 class="day-section__title">
          <span class="day-section__mask"><span class="day-section__title-text">{{ title }}</span></span>
        </h2>
        <div v-if="$slots.meta" class="day-section__meta"><slot name="meta" /></div>
        <div v-if="$slots.actions" class="day-section__actions"><slot name="actions" /></div>
      </header>
      <div class="day-section__body"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.day-section {
  --sec-bg: var(--background);
  --sec-text: var(--text);
  --sec-text-2: var(--text-secondary);
  --sec-muted: var(--muted);
  --sec-line: var(--border);
  --sec-line-strong: var(--border-strong);
  --sec-accent: var(--accent);
  --sec-on-accent: var(--on-accent);
  --sec-hover: var(--background-alt);

  background: var(--sec-bg);
  color: var(--sec-text);
  transition:
    background-color var(--duration-slow) var(--ease-standard),
    color var(--duration-slow) var(--ease-standard);
}

.day-section--alt {
  --sec-bg: var(--background-alt);
  --sec-hover: var(--background);
}

.day-section--ink {
  --sec-bg: var(--ink);
  --sec-text: var(--ink-text);
  --sec-text-2: var(--ink-text);
  --sec-muted: var(--ink-muted);
  --sec-line: var(--ink-line);
  --sec-line-strong: var(--ink-muted);
  --sec-accent: var(--ink-accent);
  --sec-on-accent: var(--ink);
  --sec-hover: var(--ink-raised);
}

.day-section.is-secondary {
  --sec-accent: var(--accent-secondary);
  --sec-on-accent: var(--on-secondary);
}

.day-section--ink.is-secondary {
  --sec-accent: var(--ink-accent);
  --sec-on-accent: var(--ink);
}

.day-section__inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--section-y) var(--gutter);
  display: grid;
  gap: var(--space-6) var(--space-7);
}

.day-section__head {
  display: grid;
  gap: var(--space-2);
  align-content: start;
}

.day-section__index {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--sec-accent);
}

.day-section__rule {
  height: 1px;
  width: 2.5rem;
  background: currentColor;
  transform-origin: left;
  transition: transform var(--duration-draw) var(--ease-out);
}

.day-section__mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.12em;
  margin-bottom: -0.12em;
}

.day-section__title {
  font-family: var(--font-display);
  font-size: var(--fs-section-title);
  font-weight: 400;
  line-height: var(--lh-tight);
  letter-spacing: -0.01em;
}

.day-section__title-text {
  display: block;
  transition: transform var(--duration-reveal) var(--ease-out);
}

.day-section__meta {
  color: var(--sec-muted);
  font-size: var(--fs-meta);
}

.day-section__actions {
  margin-top: var(--space-3);
}

.day-section__body {
  min-width: 0;
}

/* Entrance: rule draws, title rises out of its mask */
.day-section[data-inview='false'] .day-section__rule {
  transform: scaleX(0);
}

.day-section[data-inview='false'] .day-section__title-text {
  transform: translateY(105%);
}

@media (min-width: 900px) {
  .day-section__inner {
    grid-template-columns: minmax(13rem, 1fr) minmax(0, 2.6fr);
    align-items: start;
  }

  .day-section__head {
    position: sticky;
    top: var(--space-7);
  }
}
</style>

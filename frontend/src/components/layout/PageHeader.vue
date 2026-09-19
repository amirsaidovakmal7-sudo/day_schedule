<script setup lang="ts">
withDefaults(defineProps<{ eyebrow: string; title: string; tone?: 'primary' | 'secondary' }>(), {
  tone: 'primary',
})
</script>

<template>
  <header class="page-head" :class="{ 'is-secondary': tone === 'secondary' }">
    <p class="label page-head__eyebrow">
      <span class="page-head__rule" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <h1 class="page-head__title">
      <span class="page-head__mask"><span class="page-head__text">{{ title }}</span></span>
    </h1>
    <p v-if="$slots.default" class="page-head__lead"><slot /></p>
  </header>
</template>

<style scoped>
.page-head {
  --head-accent: var(--accent);
  display: grid;
  gap: var(--space-3);
}

.page-head.is-secondary {
  --head-accent: var(--accent-secondary);
}

.page-head__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--head-accent);
}

.page-head__rule {
  width: 2.5rem;
  height: 1px;
  background: currentColor;
  transform-origin: left;
  animation: head-rule var(--duration-draw) var(--ease-out) 80ms both;
}

.page-head__mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.14em;
  margin-bottom: -0.14em;
}

.page-head__title {
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 300;
  line-height: var(--lh-tight);
  letter-spacing: -0.03em;
}

.page-head__text {
  display: block;
  animation: head-rise var(--duration-reveal) var(--ease-out) 120ms both;
}

.page-head__lead {
  max-width: var(--measure);
  font-size: var(--fs-subhead);
  line-height: var(--lh-snug);
  color: var(--text-secondary);
  animation: head-fade var(--duration-slow) var(--ease-standard) 450ms both;
}

@keyframes head-rule {
  from {
    transform: scaleX(0);
  }
}

@keyframes head-rise {
  from {
    transform: translateY(105%);
  }
}

@keyframes head-fade {
  from {
    opacity: 0;
  }
}
</style>

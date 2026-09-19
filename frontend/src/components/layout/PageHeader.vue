<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <header class="page-head">
    <span class="page-head__rule" aria-hidden="true" />
    <div class="page-head__row">
      <div class="page-head__copy">
        <h1 class="page-head__title">
          <span class="page-head__mask"><span class="page-head__text">{{ title }}</span></span>
        </h1>
        <p v-if="$slots.default" class="page-head__lead"><slot /></p>
      </div>
      <div v-if="$slots.extra" class="page-head__extra"><slot name="extra" /></div>
    </div>
  </header>
</template>

<style scoped>
.page-head {
  display: grid;
  gap: var(--space-5);
}

.page-head__rule {
  display: block;
  height: var(--stroke);
  background: var(--rule-strong);
  transform-origin: left;
  animation: head-rule var(--duration-draw) var(--ease-out) 60ms both;
}

.page-head__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5) var(--space-7);
}

.page-head__copy {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}

.page-head__mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;
}

.page-head__title {
  font-family: var(--font-display);
  font-size: var(--fs-page);
  font-weight: 800;
  line-height: var(--lh-display);
  letter-spacing: -0.005em;
}

.page-head__text {
  display: block;
  animation: head-rise var(--duration-reveal) var(--ease-out) 140ms both;
}

.page-head__lead {
  max-width: var(--measure);
  font-size: var(--fs-sub);
  line-height: var(--lh-snug);
  color: var(--fg-2);
  animation: head-fade var(--duration-slow) var(--ease-standard) 480ms both;
}

.page-head__extra {
  animation: head-fade var(--duration-slow) var(--ease-standard) 600ms both;
}

@keyframes head-rule {
  from {
    transform: scaleX(0);
  }
}

@keyframes head-rise {
  from {
    transform: translateY(108%);
  }
}

@keyframes head-fade {
  from {
    opacity: 0;
  }
}
</style>

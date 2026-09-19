<script setup lang="ts">
/*
  A stack of calendar leaves. Scrolling tears the top leaf off and the day
  before it comes forward. Sample content, not the user's data.
*/
const props = defineProps<{ progress: number }>()

const days = [
  { day: '18', weekday: 'пятница', counts: '4 задачи · 3 записи' },
  { day: '17', weekday: 'четверг', counts: '5 задач · 2 записи' },
  { day: '16', weekday: 'среда', counts: '3 задачи · 4 записи' },
  { day: '15', weekday: 'вторник', counts: '6 задач · 1 запись' },
]

const steps = days.length - 1
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n))

// how far leaf i is torn away (0..1) and how deep it still sits in the stack
const torn = (i: number) => clamp(props.progress * steps - i)
const depth = (i: number) => clamp(i - props.progress * steps, 0, days.length)
</script>

<template>
  <div class="hist">
    <div class="hist__viewport">
      <div class="hist__stack" aria-hidden="true">
        <article
          v-for="(d, i) in days"
          :key="d.day"
          class="leaf"
          :style="{ '--t': torn(i), '--depth': depth(i), '--z': days.length - i }"
        >
          <span class="leaf__bind" />
          <p class="leaf__weekday">{{ d.weekday }}</p>
          <p class="leaf__num tnum">{{ d.day }}</p>
          <p class="leaf__counts tnum">{{ d.counts }}</p>
        </article>
      </div>
    </div>
    <p class="hist__label">Пример · Дни</p>
  </div>
</template>

<style scoped>
.hist {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

/* Small screens: room above the stack for the leaf to lift off, and a shorter flight */
.hist__viewport {
  width: 100%;
  padding: 4.5rem 0 var(--space-5);
}

.hist__stack {
  --tear-x: -16%;
  --tear-y: -18%;
  --tear-turn: -12deg;
  position: relative;
  width: min(100%, 23rem);
  aspect-ratio: 4 / 5;
  max-height: 48vh;
}

@media (min-width: 900px) {
  .hist__viewport {
    padding: 0 0 var(--space-5);
  }

  .hist__stack {
    --tear-x: -34%;
    --tear-y: -46%;
    --tear-turn: -16deg;
    max-height: 60vh;
  }
}

.leaf {
  position: absolute;
  inset: 0;
  z-index: var(--z);
  display: flex;
  flex-direction: column;
  padding: 3.25rem var(--space-5) var(--space-5);
  background: var(--paper);
  color: var(--ink);
  border: var(--stroke) solid var(--ink);
  transform-origin: 20% 0;
  transform: translate(
      calc(var(--depth) * 7px + var(--t) * var(--tear-x)),
      calc(var(--depth) * 9px + var(--t) * var(--tear-y))
    )
    rotate(calc(var(--t) * var(--tear-turn)));
  opacity: clamp(0, calc((1 - var(--t)) * 2.4), 1);
  will-change: transform, opacity;
}

/* Binding strip and the perforation under it */
.leaf__bind {
  position: absolute;
  inset: 0 0 auto 0;
  height: 1.5rem;
  background: var(--ink);
}

.leaf__bind::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 2.25rem;
  border-top: 3px dotted var(--ink);
  opacity: 0.4;
}

.leaf__weekday {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1;
  text-transform: capitalize;
}

.leaf__num {
  margin-top: auto;
  font-family: var(--font-display);
  font-size: clamp(9rem, 6rem + 8vw, 13rem);
  font-weight: 900;
  line-height: 0.74;
  letter-spacing: -0.02em;
  color: #c23a0c;
}

.leaf__counts {
  margin-top: var(--space-4);
  font-size: var(--fs-meta);
  font-weight: 650;
  color: rgba(13, 14, 18, 0.72);
}

.hist__label {
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--fg-muted);
}
</style>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import FlipClock from '@/components/base/FlipClock.vue'

const HOURS = Array.from({ length: 25 }, (_, i) => i)
const MAJOR = new Set([0, 6, 12, 18, 24])

const now = ref(new Date())
let timer: ReturnType<typeof setTimeout> | undefined

// Tick on the minute boundary so the clock never lags a stale minute
function schedule() {
  const wait = 60_000 - (Date.now() % 60_000) + 50
  timer = setTimeout(() => {
    now.value = new Date()
    schedule()
  }, wait)
}

onMounted(schedule)
onBeforeUnmount(() => clearTimeout(timer))

const minutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
const position = computed(() => `${(minutes.value / 1440) * 100}%`)
const clock = computed(
  () => `${String(now.value.getHours()).padStart(2, '0')}:${String(now.value.getMinutes()).padStart(2, '0')}`,
)
const left = computed(() => {
  const rest = 1440 - minutes.value
  const h = Math.floor(rest / 60)
  const m = rest % 60
  return h > 0 ? `${h} ч ${m} мин` : `${m} мин`
})
</script>

<template>
  <div class="ruler" role="img" :aria-label="`Сейчас ${clock}, до конца дня ${left}`">
    <div class="ruler__stage">
      <div class="ruler__now" :style="{ left: position }">
        <span class="ruler__badge"><FlipClock :value="clock" /></span>
        <span class="ruler__pin" />
      </div>

      <div class="ruler__track">
        <span
          v-for="hour in HOURS"
          :key="hour"
          class="ruler__tick"
          :class="{ 'is-major': MAJOR.has(hour), 'is-past': hour * 60 <= minutes }"
          :style="{ '--i': hour }"
        >
          <span v-if="MAJOR.has(hour)" class="ruler__label tnum">{{ String(hour % 24).padStart(2, '0') }}</span>
        </span>
      </div>
    </div>

    <p class="ruler__left">До конца дня <strong class="tnum">{{ left }}</strong></p>
  </div>
</template>

<style scoped>
.ruler {
  width: 100%;
  display: grid;
  gap: var(--space-6);
}

.ruler__stage {
  position: relative;
  padding-top: 4rem;
}

.ruler__track {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 2rem;
  border-bottom: var(--stroke) solid var(--fg);
}

.ruler__tick {
  position: relative;
  width: 2px;
  height: 0.75rem;
  background: var(--fg);
  opacity: 0.42;
  transform-origin: bottom;
  animation: tick-rise var(--duration-slow) var(--ease-out) both;
  animation-delay: calc(500ms + var(--i) * 16ms);
}

.ruler__tick.is-past {
  opacity: 1;
}

.ruler__tick.is-major {
  height: 1.5rem;
  opacity: 1;
}

.ruler__label {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--fs-label);
  font-weight: 650;
  letter-spacing: 0.04em;
  color: var(--fg-2);
}

.ruler__tick:first-child .ruler__label {
  left: 0;
  transform: none;
}

.ruler__tick:last-child .ruler__label {
  left: auto;
  right: 0;
  transform: none;
}

.ruler__now {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  animation: now-in var(--duration-slow) var(--ease-out) 1000ms both;
}

.ruler__badge {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(-50%);
  font-size: 2.5rem;
  line-height: 1;
  white-space: nowrap;
  --card-bg: var(--fill);
  --card-fg: var(--on-fill);
  --card-hinge: var(--bg);
}

.ruler__pin {
  position: absolute;
  top: 2.5rem;
  bottom: 0;
  left: -2px;
  width: 4px;
  background: var(--fill);
}

.ruler__left {
  font-size: var(--fs-meta);
  color: var(--fg-2);
}

.ruler__left strong {
  font-weight: 700;
  color: var(--fg);
}

@keyframes tick-rise {
  from {
    transform: scaleY(0);
  }
}

@keyframes now-in {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
}

@media (max-width: 480px) {
  .ruler__badge {
    font-size: 2.125rem;
  }
}
</style>

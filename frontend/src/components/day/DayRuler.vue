<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ live?: boolean }>(), { live: true })

const HOURS = Array.from({ length: 25 }, (_, i) => i)
const LABELS = new Set([0, 6, 12, 18, 24])

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (props.live) timer = setInterval(() => (now.value = new Date()), 60_000)
})
onBeforeUnmount(() => clearInterval(timer))

const minutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
const position = computed(() => `${(minutes.value / 1440) * 100}%`)
const nowLabel = computed(
  () => `${String(now.value.getHours()).padStart(2, '0')}:${String(now.value.getMinutes()).padStart(2, '0')}`,
)
</script>

<template>
  <div class="ruler" role="img" :aria-label="live ? `Сейчас ${nowLabel}` : 'Шкала суток'">
    <div class="ruler__track">
      <span
        v-for="hour in HOURS"
        :key="hour"
        class="ruler__tick"
        :class="{ 'is-major': LABELS.has(hour), 'is-past': live && hour * 60 <= minutes }"
        :style="{ '--i': hour }"
      >
        <span v-if="LABELS.has(hour)" class="ruler__label tnum">{{ String(hour % 24).padStart(2, '0') }}</span>
      </span>
      <span v-if="live" class="ruler__now" :style="{ left: position }">
        <span class="ruler__now-label tnum">{{ nowLabel }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.ruler {
  width: 100%;
  padding-top: var(--space-5);
}

.ruler__track {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 2.25rem;
  border-bottom: 1px solid var(--border-strong);
}

.ruler__tick {
  position: relative;
  width: 1px;
  height: 0.5rem;
  background: var(--border-strong);
  transform-origin: bottom;
  animation: tick-rise var(--duration-slow) var(--ease-out) both;
  animation-delay: calc(500ms + var(--i) * 14ms);
}

.ruler__tick.is-major {
  height: 1rem;
}

.ruler__tick.is-past {
  background: var(--accent);
}

.ruler__label {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.ruler__tick:first-child .ruler__label {
  transform: none;
  left: 0;
}

.ruler__tick:last-child .ruler__label {
  transform: none;
  left: auto;
  right: 0;
}

.ruler__now {
  position: absolute;
  bottom: 0;
  width: 2px;
  height: 1.75rem;
  margin-left: -1px;
  background: var(--accent);
  animation: now-in var(--duration-slow) var(--ease-out) 1000ms both;
  transform-origin: bottom;
}

.ruler__now::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  width: 7px;
  height: 7px;
  margin-left: -3.5px;
  border-radius: var(--radius-full);
  background: var(--accent);
}

.ruler__now-label {
  position: absolute;
  bottom: calc(100% + 0.6rem);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--fs-label);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent);
  white-space: nowrap;
}

@keyframes tick-rise {
  from {
    transform: scaleY(0);
  }
}

@keyframes now-in {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
}
</style>

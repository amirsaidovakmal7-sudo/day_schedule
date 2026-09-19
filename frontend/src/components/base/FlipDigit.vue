<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/*
  One flip card. The top half of the old digit folds down, the bottom half of
  the new digit folds into place. Size it with font-size (card = 0.68em × 1em).
*/
const props = defineProps<{ value: string; from?: string; delay?: number }>()

const current = ref(props.from ?? props.value)
const previous = ref(current.value)
const flipping = ref(false)
const run = ref(0)
let startTimer: ReturnType<typeof setTimeout> | undefined

function flipTo(next: string) {
  if (next === current.value) return
  previous.value = current.value
  current.value = next
  run.value += 1
  flipping.value = true
}

onMounted(() => {
  if (props.from !== undefined && props.from !== props.value) {
    startTimer = setTimeout(() => flipTo(props.value), props.delay ?? 0)
  }
})

watch(
  () => props.value,
  (next) => flipTo(next),
)

onBeforeUnmount(() => clearTimeout(startTimer))
</script>

<template>
  <span class="fd" aria-hidden="true">
    <span class="fd__half fd__top"><i>{{ current }}</i></span>
    <span class="fd__half fd__bottom"><i>{{ flipping ? previous : current }}</i></span>
    <template v-if="flipping">
      <span :key="`f${run}`" class="fd__flap fd__front"><i>{{ previous }}</i></span>
      <span :key="`b${run}`" class="fd__flap fd__back" @animationend="flipping = false"><i>{{ current }}</i></span>
    </template>
  </span>
</template>

<style scoped>
.fd {
  position: relative;
  display: block;
  width: 0.68em;
  height: 1em;
  perspective: 6em;
  font-family: var(--font-display);
  font-weight: 900;
  font-variant-numeric: tabular-nums lining-nums;
  line-height: 1;
}

.fd__half,
.fd__flap {
  position: absolute;
  left: 0;
  right: 0;
  height: 50%;
  overflow: hidden;
  background: var(--card-bg, var(--fg));
  color: var(--card-fg, var(--bg));
  backface-visibility: hidden;
}

.fd__top,
.fd__front {
  top: 0;
}

.fd__bottom,
.fd__back {
  bottom: 0;
}

.fd i {
  position: absolute;
  left: 0;
  right: 0;
  display: block;
  height: 1em;
  font-style: normal;
  line-height: 1em;
  text-align: center;
}

.fd__top i,
.fd__front i {
  top: 0;
}

.fd__bottom i,
.fd__back i {
  bottom: 0;
}

/* Hinge */
.fd::after {
  content: '';
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  top: 50%;
  height: max(2px, 0.03em);
  transform: translateY(-50%);
  background: var(--card-hinge, var(--bg));
}

.fd__flap {
  z-index: 2;
}

.fd__flap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
}

.fd__front {
  transform-origin: 50% 100%;
  animation: fd-front 170ms var(--ease-in) forwards;
}

.fd__front::after {
  animation: fd-shade-in 170ms linear forwards;
}

.fd__back {
  transform-origin: 50% 0;
  transform: rotateX(90deg);
  animation: fd-back 200ms var(--ease-out) 170ms forwards;
}

.fd__back::after {
  opacity: 0.4;
  animation: fd-shade-out 200ms linear 170ms forwards;
}

@keyframes fd-front {
  to {
    transform: rotateX(-90deg);
  }
}

@keyframes fd-back {
  to {
    transform: rotateX(0deg);
  }
}

@keyframes fd-shade-in {
  to {
    opacity: 0.4;
  }
}

@keyframes fd-shade-out {
  to {
    opacity: 0;
  }
}
</style>

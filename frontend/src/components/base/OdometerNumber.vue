<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

/*
  Rolling numerals. Every digit is a column that scrolls a strip of digits
  behind a mask, so a digit that changes rolls the short way round instead of
  swapping. Size it with font-size; --od-cell is the cell height (default 1em).
*/
const props = withDefaults(
  defineProps<{
    value: string | number
    /** roll a full turn on first appearance */
    spin?: boolean
    /** ms between columns */
    stagger?: number
    /** start delay in ms */
    delay?: number
  }>(),
  { spin: true, stagger: 90, delay: 0 },
)

const chars = computed(() => String(props.value).split(''))
const isDigit = (c: string) => c >= '0' && c <= '9'

const initial = (spin: boolean) => chars.value.map((c) => (isDigit(c) ? (spin ? 0 : Number(c)) : 0))
const positions = ref<number[]>(initial(props.spin))
/** cells only ever grow, so a strip never loses the cell that is still on screen */
const cells = ref<number[]>(positions.value.map((p) => p + 1))
const armed = ref(false)

function set(next: number[]) {
  positions.value = next
  cells.value = next.map((p, i) => Math.max(p + 1, cells.value[i] ?? 0))
}

onMounted(() => {
  if (!props.spin) {
    armed.value = true
    return
  }
  requestAnimationFrame(() => {
    set(chars.value.map((c) => (isDigit(c) ? 10 + Number(c) : 0)))
    armed.value = true
  })
})

watch(
  () => String(props.value),
  (next, prev) => {
    const to = next.split('')
    const from = prev.split('')
    if (to.length !== from.length) {
      positions.value = to.map((c) => (isDigit(c) ? Number(c) : 0))
      cells.value = positions.value.map((p) => p + 1)
      return
    }
    set(
      to.map((c, i) => {
        if (!isDigit(c)) return 0
        const now = positions.value[i] ?? Number(from[i])
        const forward = (Number(c) - Number(from[i]) + 10) % 10
        const back = 10 - forward
        return forward <= 5 || now < back ? now + forward : now - back
      }),
    )
  },
)
</script>

<template>
  <span class="od" :aria-label="String(value)" role="img">
    <template v-for="(char, i) in chars" :key="i">
      <span v-if="isDigit(char)" class="od__col" aria-hidden="true">
        <span
          class="od__strip"
          :class="{ 'is-armed': armed }"
          :style="{ '--pos': positions[i], '--od-delay': `${delay + i * stagger}ms` }"
        >
          <span v-for="k in cells[i] ?? 1" :key="k" class="od__cell">{{ (k - 1) % 10 }}</span>
        </span>
      </span>
      <span v-else class="od__static" aria-hidden="true">{{ char }}</span>
    </template>
  </span>
</template>

<style scoped>
.od {
  display: inline-flex;
  font-variant-numeric: tabular-nums lining-nums;
  line-height: var(--od-cell, 1em);
}

.od__col {
  display: block;
  height: var(--od-cell, 1em);
  overflow: hidden;
  padding-block: 0.06em;
  margin-block: -0.06em;
}

.od__strip {
  display: block;
  transform: translateY(calc(var(--pos) * var(--od-cell, 1em) * -1));
}

.od__strip.is-armed {
  transition: transform var(--od-duration, 1100ms) var(--ease-roll);
  transition-delay: var(--od-delay, 0ms);
}

.od__cell {
  display: block;
  height: var(--od-cell, 1em);
  line-height: var(--od-cell, 1em);
  text-align: center;
}

.od__static {
  display: block;
  height: var(--od-cell, 1em);
  line-height: var(--od-cell, 1em);
}
</style>

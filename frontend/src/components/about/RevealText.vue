<script setup lang="ts">
import { computed } from 'vue'

import { vInview } from '@/composables/useInView'

/**
 * Typographic reveal. `text` uses "\n" for line breaks.
 * mode="lines" rises whole lines out of a mask, mode="words" staggers word by word.
 */
const props = withDefaults(
  defineProps<{ text: string; mode?: 'lines' | 'words'; tag?: string; delay?: number }>(),
  { mode: 'lines', tag: 'p', delay: 0 },
)

interface Word {
  text: string
  index: number
}

const lines = computed(() => {
  let counter = 0
  return props.text.split('\n').map((line) =>
    line
      .trim()
      .split(/\s+/)
      .map<Word>((raw) => ({ text: raw, index: counter++ })),
  )
})
</script>

<template>
  <component
    :is="tag"
    v-inview="{ threshold: 0.35 }"
    class="reveal"
    :class="`reveal--${mode}`"
    :style="{ '--delay': `${delay}ms` }"
    :aria-label="text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()"
  >
    <span v-for="(line, li) in lines" :key="li" class="reveal__line" aria-hidden="true">
      <span
        v-for="(word, wi) in line"
        :key="wi"
        class="reveal__mask"
        :style="{ '--i': mode === 'lines' ? li : word.index }"
      >
        <span class="reveal__word">{{ word.text }}</span>
      </span>
    </span>
  </component>
</template>

<style scoped>
.reveal {
  display: block;
}

.reveal__line {
  display: block;
}

.reveal__mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding: 0.04em 0.06em 0.12em;
  margin: -0.04em 0.16em -0.12em -0.06em;
}

.reveal__word {
  display: inline-block;
  transition: transform var(--duration-reveal) var(--ease-out);
  transition-delay: calc(var(--delay) + var(--i) * 70ms);
}

.reveal--lines .reveal__word {
  transition-delay: calc(var(--delay) + var(--i) * 140ms);
}

.reveal[data-inview='false'] .reveal__word {
  transform: translateY(112%);
}
</style>

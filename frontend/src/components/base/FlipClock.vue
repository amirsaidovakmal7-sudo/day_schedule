<script setup lang="ts">
import { computed } from 'vue'

import FlipDigit from '@/components/base/FlipDigit.vue'

/*
  A flip clock: "HH:MM" as four flip cards. On first appearance every card
  flips into place from zero. Size it with font-size.
  Cards take the inverse of their surroundings, so they read on every environment.
*/
const props = withDefaults(defineProps<{ value: string; spin?: boolean }>(), { spin: true })

const parts = computed(() => props.value.split(''))
</script>

<template>
  <span class="fc" role="img" :aria-label="value">
    <template v-for="(char, i) in parts" :key="i">
      <span v-if="char === ':'" class="fc__sep" aria-hidden="true"><i /><i /></span>
      <FlipDigit v-else :value="char" :from="spin ? '0' : undefined" :delay="220 + i * 130" />
    </template>
  </span>
</template>

<style scoped>
.fc {
  display: inline-flex;
  align-items: center;
  gap: 0.07em;
}

.fc__sep {
  display: flex;
  flex-direction: column;
  gap: 0.2em;
  padding-inline: 0.05em;
}

.fc__sep i {
  display: block;
  width: 0.12em;
  height: 0.12em;
  background: var(--time);
}
</style>

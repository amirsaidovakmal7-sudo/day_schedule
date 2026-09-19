<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'

withDefaults(defineProps<{ message?: string }>(), {
  message: 'Не удалось загрузить данные.',
})

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="error-state" role="alert">
    <p class="error-state__message">{{ message }}</p>
    <BaseButton variant="secondary" @click="emit('retry')">
      Повторить
      <template #icon><BaseIcon :icon="ArrowRight" :size="18" /></template>
    </BaseButton>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
  padding-block: var(--space-6);
}

.error-state__message {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 1.75rem + 3vw, 4.5rem);
  font-weight: 800;
  line-height: var(--lh-display);
  max-width: 14ch;
  text-wrap: balance;
}
</style>

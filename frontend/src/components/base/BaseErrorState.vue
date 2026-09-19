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
    <p class="label error-state__eyebrow">Что-то пошло не так</p>
    <p class="error-state__message">{{ message }}</p>
    <BaseButton variant="secondary" @click="emit('retry')">
      Повторить
      <template #icon><BaseIcon :icon="ArrowRight" :size="16" /></template>
    </BaseButton>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding-block: var(--space-6);
}

.error-state__eyebrow {
  color: var(--danger);
}

.error-state__message {
  font-family: var(--font-display);
  font-size: var(--fs-section-title);
  line-height: var(--lh-tight);
  max-width: 20ch;
  margin-bottom: var(--space-3);
}
</style>

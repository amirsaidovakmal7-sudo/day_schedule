<script setup lang="ts">
import { ArrowRight, Check } from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSheet from '@/components/base/BaseSheet.vue'
import { useHaptics } from '@/composables/useHaptics'
import { useCurrentDayStore } from '@/stores/currentDay'
import { useUiStore } from '@/stores/ui'
import type { ScheduleEntry } from '@/types/api'
import { formatTime } from '@/utils/date'
import { toFieldErrors, toUserMessage } from '@/utils/errors'

const props = defineProps<{ open: boolean; editEntry: ScheduleEntry | null }>()
const emit = defineEmits<{ close: [] }>()

const dayStore = useCurrentDayStore()
const uiStore = useUiStore()
const haptics = useHaptics()

const time = ref('12:00')
const description = ref('')
const submitting = ref(false)
const errors = reactive({ time: '', description: '' })

const isEdit = computed(() => props.editEntry !== null)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    time.value = props.editEntry ? formatTime(props.editEntry.time) : '12:00'
    description.value = props.editEntry?.description ?? ''
    errors.time = ''
    errors.description = ''
  },
)

function close() {
  submitting.value = false
  emit('close')
}

async function submit() {
  errors.time = time.value ? '' : 'Укажите время'
  errors.description = description.value.trim() ? '' : 'Опишите, что запланировано'
  if (errors.time || errors.description) return

  submitting.value = true
  try {
    const payload = { time: `${time.value}:00`, description: description.value.trim() }
    if (props.editEntry) await dayStore.editNote(props.editEntry.id, payload)
    else await dayStore.addNote(payload.time, payload.description)
    haptics.notify('success')
    close()
  } catch (e) {
    const fields = toFieldErrors(e)
    errors.time = fields.time ?? ''
    errors.description = fields.description ?? ''
    if (!fields.time && !fields.description) uiStore.showToast(toUserMessage(e), 'danger')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseSheet
    :open="open"
    :eyebrow="isEdit ? 'Расписание' : '02 · Расписание'"
    :title="isEdit ? 'Изменить запись' : 'Новая запись'"
    @close="close"
  >
    <form class="note-form" novalidate @submit.prevent="submit">
      <BaseInput v-model="time" type="time" label="Время" :error="errors.time" />
      <BaseInput
        v-model="description"
        label="Что запланировано"
        placeholder="Например: встреча с командой"
        autocomplete="off"
        autofocus
        :error="errors.description"
      />
      <BaseButton type="submit" block :loading="submitting">
        {{ isEdit ? 'Сохранить' : 'Добавить в день' }}
        <template #icon><BaseIcon :icon="isEdit ? Check : ArrowRight" :size="16" /></template>
      </BaseButton>
    </form>
  </BaseSheet>
</template>

<style scoped>
.note-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
</style>

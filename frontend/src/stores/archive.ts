import { defineStore } from 'pinia'
import { ref } from 'vue'

import * as daysApi from '@/api/days'
import type { DayDetail, DaySummary } from '@/types/api'

type Status = 'idle' | 'loading' | 'error'

export const useArchiveStore = defineStore('archive', () => {
  const days = ref<DaySummary[]>([])
  const status = ref<Status>('idle')
  const dayDetails = ref<Map<number, DayDetail>>(new Map())

  async function load() {
    status.value = 'loading'
    try {
      days.value = await daysApi.fetchArchive()
      status.value = 'idle'
    } catch (error) {
      status.value = 'error'
      throw error
    }
  }

  async function loadDay(dayId: number) {
    const cached = dayDetails.value.get(dayId)
    if (cached) return cached

    const detail = await daysApi.fetchDayById(dayId)
    dayDetails.value.set(dayId, detail)
    return detail
  }

  return { days, status, load, loadDay }
})

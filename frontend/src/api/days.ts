import { http } from '@/api/http'
import type { DayDetail, DaySummary } from '@/types/api'

export function fetchCurrentDay() {
  return http.get<DayDetail>('/days/current').then((r) => r.data)
}

export function fetchArchive() {
  return http.get<DaySummary[]>('/days').then((r) => r.data)
}

export function fetchDayById(dayId: number) {
  return http.get<DayDetail>(`/days/${dayId}`).then((r) => r.data)
}

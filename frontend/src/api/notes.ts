import { http } from '@/api/http'
import type { ScheduleEntry } from '@/types/api'

export function createNote(time: string, description: string) {
  return http.post<ScheduleEntry>('/notes', { time, description }).then((r) => r.data)
}

export function updateNote(noteId: number, patch: { time?: string; description?: string }) {
  return http.put<ScheduleEntry>(`/notes/${noteId}`, patch).then((r) => r.data)
}

export function deleteNote(noteId: number) {
  return http.delete<void>(`/notes/${noteId}`).then((r) => r.data)
}

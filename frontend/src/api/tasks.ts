import { http } from '@/api/http'
import type { Task } from '@/types/api'

export function createTask(title: string) {
  return http.post<Task>('/tasks', { title }).then((r) => r.data)
}

export function updateTask(taskId: number, patch: { title?: string; completed?: boolean }) {
  return http.patch<Task>(`/tasks/${taskId}`, patch).then((r) => r.data)
}

export function deleteTask(taskId: number) {
  return http.delete<void>(`/tasks/${taskId}`).then((r) => r.data)
}

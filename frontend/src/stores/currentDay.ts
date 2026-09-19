import { defineStore } from 'pinia'
import { ref } from 'vue'

import * as daysApi from '@/api/days'
import * as notesApi from '@/api/notes'
import * as tasksApi from '@/api/tasks'
import type { DayDetail, ScheduleEntry, Task } from '@/types/api'

type Status = 'idle' | 'loading' | 'error'

function sortByTime(notes: ScheduleEntry[]) {
  return [...notes].sort((a, b) => a.time.localeCompare(b.time))
}

export const useCurrentDayStore = defineStore('currentDay', () => {
  const day = ref<DayDetail | null>(null)
  const status = ref<Status>('idle')

  async function load() {
    status.value = 'loading'
    try {
      day.value = await daysApi.fetchCurrentDay()
      status.value = 'idle'
    } catch (error) {
      status.value = 'error'
      throw error
    }
  }

  async function addTask(title: string) {
    const task = await tasksApi.createTask(title)
    day.value?.tasks.push(task)
    return task
  }

  async function toggleTask(taskId: number) {
    if (!day.value) return
    const task = day.value.tasks.find((t) => t.id === taskId)
    if (!task) return

    const previous = task.completed
    task.completed = !previous
    try {
      await tasksApi.updateTask(taskId, { completed: task.completed })
    } catch (error) {
      task.completed = previous
      throw error
    }
  }

  async function removeTask(taskId: number) {
    if (!day.value) return
    const index = day.value.tasks.findIndex((t) => t.id === taskId)
    if (index === -1) return

    const [removed] = day.value.tasks.splice(index, 1)
    try {
      await tasksApi.deleteTask(taskId)
    } catch (error) {
      day.value.tasks.splice(index, 0, removed as Task)
      throw error
    }
  }

  async function addNote(time: string, description: string) {
    const note = await notesApi.createNote(time, description)
    if (day.value) {
      day.value.notes = sortByTime([...day.value.notes, note])
    }
    return note
  }

  async function editNote(noteId: number, patch: { time?: string; description?: string }) {
    const updated = await notesApi.updateNote(noteId, patch)
    if (day.value) {
      const index = day.value.notes.findIndex((n) => n.id === noteId)
      if (index !== -1) day.value.notes.splice(index, 1, updated)
      day.value.notes = sortByTime(day.value.notes)
    }
    return updated
  }

  async function removeNote(noteId: number) {
    if (!day.value) return
    const index = day.value.notes.findIndex((n) => n.id === noteId)
    if (index === -1) return

    const [removed] = day.value.notes.splice(index, 1)
    try {
      await notesApi.deleteNote(noteId)
    } catch (error) {
      day.value.notes = sortByTime([...day.value.notes, removed as ScheduleEntry])
      throw error
    }
  }

  return { day, status, load, addTask, toggleTask, removeTask, addNote, editNote, removeNote }
})

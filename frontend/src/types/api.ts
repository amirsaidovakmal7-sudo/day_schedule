export interface User {
  id: number
  username: string
  created_at: string
}

export interface AuthTokenResponse {
  access_token: string
  token_type: string
}

export interface Task {
  id: number
  day_id: number
  title: string
  completed: boolean
}

export interface ScheduleEntry {
  id: number
  day_id: number
  /** "HH:MM:SS" as returned by the API */
  time: string
  description: string
}

export interface DayDetail {
  id: number
  /** "YYYY-MM-DD" */
  date: string
  is_editable: boolean
  tasks: Task[]
  notes: ScheduleEntry[]
}

export interface DaySummary {
  id: number
  date: string
  tasks_count: number
  notes_count: number
}

export interface ApiErrorPayload {
  detail?: string
}

const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' })
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long' })

/** Parses the API's "YYYY-MM-DD" as a local date, avoiding UTC off-by-one shifts. */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export interface DayParts {
  weekday: string
  day: number
  month: string
  year: number
}

export function dayParts(isoDate: string): DayParts {
  const date = parseIsoDate(isoDate)
  return {
    weekday: weekdayFormatter.format(date),
    day: date.getDate(),
    month: monthFormatter.format(date),
    year: date.getFullYear(),
  }
}

/** "2026-09" — stable key for grouping days by month. */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

/** "сентябрь 2026" */
export function formatMonthYear(isoDate: string): string {
  const { month, year } = dayParts(isoDate)
  return `${month} ${year}`
}

/** "12:00:00" -> "12:00" */
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

/** "12:30:00" -> 750 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Russian plural: pluralize(3, ['задача', 'задачи', 'задач']) */
export function pluralize(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100
  const last = n % 10
  if (n > 10 && n < 20) return forms[2]
  if (last > 1 && last < 5) return forms[1]
  if (last === 1) return forms[0]
  return forms[2]
}

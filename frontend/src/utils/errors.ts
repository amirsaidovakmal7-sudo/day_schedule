import { ApiError, type FieldErrors } from '@/api/http'

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Что-то пошло не так. Попробуйте ещё раз.'
}

export function toFieldErrors(error: unknown): FieldErrors {
  return error instanceof ApiError ? error.fieldErrors : {}
}

/** HTTP status of an API error, or 0 when it isn't one. */
export function statusOf(error: unknown): number {
  return error instanceof ApiError ? error.status : 0
}

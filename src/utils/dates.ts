/** Get the next Sunday on or after a given date */
export function getNextSunday(from: Date = new Date()): Date {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  if (day !== 0) {
    d.setDate(d.getDate() + (7 - day))
  }
  return d
}

/** Get the Sunday after the next one */
export function getFollowingSunday(from: Date = new Date()): Date {
  const next = getNextSunday(from)
  next.setDate(next.getDate() + 7)
  return next
}

/** Format a date as YYYY-MM-DD */
export function toDateString(d: Date): string {
  return d.toISOString().split('T')[0]
}

/** Format a Sunday date for display, e.g. "This Sunday (Mar 15)" */
export function formatSundayLabel(dateStr: string, reference: Date = new Date()): string {
  const date = new Date(dateStr + 'T00:00:00')
  const thisSunday = getNextSunday(reference)
  const nextSunday = getFollowingSunday(reference)

  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()

  if (toDateString(date) === toDateString(thisSunday)) {
    return `This Sunday (${month} ${day})`
  }
  if (toDateString(date) === toDateString(nextSunday)) {
    return `Next Sunday (${month} ${day})`
  }
  return `Sunday, ${month} ${day}`
}

/** Short date for nav: "Mar 22" */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  return `${month} ${date.getDate()}`
}

/** Relative label: "This Sun", "Next Sun", or null for other weeks */
export function getRelativeLabel(dateStr: string, reference: Date = new Date()): string | null {
  const thisSunday = getNextSunday(reference)
  const nextSunday = getFollowingSunday(reference)
  if (toDateString(new Date(dateStr + 'T00:00:00')) === toDateString(thisSunday)) return 'This Sun'
  if (toDateString(new Date(dateStr + 'T00:00:00')) === toDateString(nextSunday)) return 'Next Sun'
  return null
}

/** Check if a date string is in the past */
export function isPastSunday(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + 'T00:00:00')
  return date < today
}

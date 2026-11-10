/** Ignore malformed or out-of-range saved ratings from older browser data. */
export function sanitizeStars(value: unknown, lessonCount: number): number[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, lessonCount).map(stars => Number.isInteger(stars) && stars >= 0 && stars <= 3 ? stars : 0)
}

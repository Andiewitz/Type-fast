/** Active time required before an exercise can award progress. */
export const MIN_LESSON_MS = 10_000

export function remainingLessonMs(elapsedMs: number): number {
  return Math.max(0, MIN_LESSON_MS - elapsedMs)
}

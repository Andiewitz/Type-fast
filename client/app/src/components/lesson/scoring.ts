export const MIN_SPEED_SECONDS = 5

/** Short exercises use a minimum window to avoid inflated speed records. */
export function calculateWpm(correctCharacters: number, elapsedMs: number): number {
  if (correctCharacters <= 0 || elapsedMs <= 0) return 0
  return Math.round((correctCharacters / 5) / (Math.max(elapsedMs / 1000, MIN_SPEED_SECONDS) / 60))
}

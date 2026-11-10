/** Calculate words per minute from the actual active typing time. */
export function calculateWpm(correctCharacters: number, elapsedMs: number): number {
  if (correctCharacters <= 0 || elapsedMs <= 0) return 0
  return Math.round((correctCharacters / 5) / (elapsedMs / 60000))
}

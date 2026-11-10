export type LessonOutcome = 'in-progress' | 'passed' | 'speed' | 'mistakes'

/** The limit is the number of mistakes allowed; the next mistake ends the attempt. */
export function lessonOutcome(done: boolean, mistakes: number, maxMistakes: number, wpm: number, minWpm: number): LessonOutcome {
  if (mistakes > maxMistakes) return 'mistakes'
  if (!done) return 'in-progress'
  return wpm >= minWpm ? 'passed' : 'speed'
}

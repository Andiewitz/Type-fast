import type { LessonResultData, SpeedSample } from './useTypingLesson'

/** Summarize completed rounds using their actual attempts and active time. */
export function aggregateRounds(rounds: LessonResultData[]): LessonResultData {
  let seconds = 0, correctChars = 0, attempts = 0, correctAttempts = 0, mistakeCount = 0
  const samples: SpeedSample[] = []
  const mistakes: Record<string, number> = {}
  for (const round of rounds) {
    for (const sample of round.samples) samples.push({ seconds: seconds + sample.seconds, wpm: sample.wpm })
    seconds += round.seconds
    correctChars += round.correctChars
    attempts += round.attempts
    correctAttempts += round.correctAttempts
    mistakeCount += round.mistakeCount
    for (const [key, count] of Object.entries(round.mistakes)) mistakes[key] = (mistakes[key] || 0) + count
  }
  return { seconds, correctChars, attempts, correctAttempts, wpm: seconds > 0 ? Math.round((correctChars / 5) / (seconds / 60)) : 0, accuracy: attempts ? Math.floor(correctAttempts / attempts * 100) : 100, passed: true, reason: null, mistakeCount, samples, mistakes }
}

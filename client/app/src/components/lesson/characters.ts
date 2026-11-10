export function normalizeLessonInput(value: string, caseSensitive: boolean): string {
  return caseSensitive ? value : value.toLowerCase()
}

export function displayLessonCharacter(char: string): string {
  if (char === '\n') return '↵\n'
  if (char === '\t') return '⇥'
  return char
}

export function describeLessonCharacter(char: string): string {
  if (char === '\n') return 'Enter'
  if (char === '\t') return 'Tab'
  if (char === ' ') return 'Space'
  return char
}

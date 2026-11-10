/** Keep the cursor at a mistake until the learner edits or removes it. */
export function canApplyEdit(previous: string, next: string, target: string): boolean {
  const hasMistake = [...previous].some((character, index) => character !== target[index])
  return !hasMistake || !next.startsWith(previous) || next.length <= previous.length
}

export function starsFor(passed: boolean, accuracy: number): number {
  if (!passed) return 0
  return accuracy >= 98 ? 3 : accuracy >= 90 ? 2 : 1
}

export function recordBestStars(previous: number[], index: number, stars: number): number[] {
  const next = [...previous]
  next[index] = Math.max(next[index] || 0, stars)
  return next
}

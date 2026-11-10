export type MistakeCounts = Record<string, number>

export function mostMissedKey(counts: MistakeCounts): string | undefined {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
}

export function describeKey(key: string): string {
  return key === ' ' ? 'space' : key.toUpperCase()
}

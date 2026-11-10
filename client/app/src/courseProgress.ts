export const COURSE_VERSION = 4

type SavedCourse = { completed: number; stars?: number[]; courseVersion?: number; previousCourse?: { completed: number; stars: number[] }; unearnedLevels?: number[] }

/** Retain old unlocks and ratings while marking newly added levels as unearned. */
export function migrateCourseProgress<T extends SavedCourse>(value: T) {
  if (value.courseVersion === COURSE_VERSION) return value
  const stars = Array.isArray(value.stars) ? value.stars : []
  if (value.courseVersion === 2 || (value.courseVersion === 3 && value.previousCourse)) {
    const previous = value.courseVersion === 2 ? { completed: value.completed, stars } : value.previousCourse!
    const oldCount = Math.max(0, Math.min(39, previous.completed))
    const mapped = Math.floor(oldCount / 3) * 5 + oldCount % 3
    const currentCount = value.courseVersion === 3 ? value.completed : 0
    const completed = Math.min(65, Math.max(mapped, currentCount))
    const earned = new Set<number>()
    const mappedStars: number[] = []
    for (let i = 0; i < oldCount; i++) {
      const index = Math.floor(i / 3) * 5 + i % 3
      earned.add(index)
      mappedStars[index] = previous.stars[i] || 0
    }
    if (value.courseVersion === 3) for (let i = 0; i < currentCount; i++) {
      if (!value.unearnedLevels?.includes(i)) earned.add(i)
      mappedStars[i] = Math.max(mappedStars[i] || 0, stars[i] || 0)
    }
    return { ...value, courseVersion: COURSE_VERSION, previousCourse: previous, completed, stars: mappedStars, unearnedLevels: Array.from({ length: completed }, (_, i) => i).filter(i => !earned.has(i)) }
  }
  if (value.courseVersion === 3) return { ...value, courseVersion: COURSE_VERSION, unearnedLevels: value.unearnedLevels || [] }
  return { ...value, courseVersion: COURSE_VERSION, legacyCourse: { completed: value.completed, stars }, completed: 0, stars: [], unearnedLevels: [] }
}

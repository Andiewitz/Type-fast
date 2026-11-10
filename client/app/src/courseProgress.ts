export const COURSE_VERSION = 2

/** Preserve prior course achievements while starting the new curriculum at its first lesson. */
export function migrateCourseProgress<T extends { completed: number; stars?: number[]; courseVersion?: number }>(value: T) {
  if (value.courseVersion === COURSE_VERSION) return value
  return { ...value, courseVersion: COURSE_VERSION, legacyCourse: { completed: value.completed, stars: Array.isArray(value.stars) ? value.stars : [] }, completed: 0, stars: [] }
}

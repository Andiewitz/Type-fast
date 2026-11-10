import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { COURSE_VERSION, migrateCourseProgress } from '../client/app/src/courseProgress.ts'

test('moves old lesson achievements aside without losing lifetime stats', () => {
  const saved = { completed: 6, stars: [3, 2], xp: 120, bestWpm: 48 }
  const next = migrateCourseProgress(saved)
  assert.deepEqual(next.legacyCourse, { completed: 6, stars: [3, 2] })
  assert.equal(next.completed, 0)
  assert.deepEqual(next.stars, [])
  assert.equal(next.xp, 120)
  assert.equal(next.bestWpm, 48)
})
test('the new course does not get reset again', () => {
  const saved = { completed: 8, stars: [3], courseVersion: COURSE_VERSION }
  assert.equal(migrateCourseProgress(saved), saved)
})

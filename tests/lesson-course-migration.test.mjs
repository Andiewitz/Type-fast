import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { COURSE_VERSION, migrateCourseProgress } from '../client/app/src/courseProgress.ts'

test('archives the original six-level course without losing stats', () => {
  const next = migrateCourseProgress({ completed: 6, stars: [3, 2], xp: 120, bestWpm: 48 })
  assert.deepEqual(next.legacyCourse, { completed: 6, stars: [3, 2] })
  assert.equal(next.completed, 0)
  assert.equal(next.xp, 120)
  assert.equal(next.bestWpm, 48)
})
test('maps previous unlocks and ratings without marking new levels complete', () => {
  const next = migrateCourseProgress({ completed: 8, stars: [3, 2, 1, 3, 2, 1, 3, 2], xp: 160, courseVersion: 2 })
  assert.equal(next.completed, 12)
  assert.deepEqual(next.unearnedLevels, [3, 4, 8, 9])
  assert.equal(next.stars[5], 3)
  assert.equal(next.stars[10], 3)
  assert.equal(next.xp, 160)
})
test('restores archived unlocks after the transitional course version', () => {
  const next = migrateCourseProgress({ completed: 3, stars: [3, 2, 1], courseVersion: 3, previousCourse: { completed: 8, stars: [3, 2, 1, 3, 2, 1, 3, 2] } })
  assert.equal(next.completed, 12)
  assert.deepEqual(next.unearnedLevels, [3, 4, 8, 9])
})
test('the current course does not get reset again', () => {
  const saved = { completed: 8, stars: [3], courseVersion: COURSE_VERSION }
  assert.equal(migrateCourseProgress(saved), saved)
})

test('a completed previous course keeps all chapters open and the new levels unearned', () => {
  const next = migrateCourseProgress({ completed: 39, stars: Array(39).fill(2), xp: 780, courseVersion: 2 })
  assert.equal(next.completed, 65)
  assert.equal(next.unearnedLevels.length, 26)
  assert.equal(next.stars[60], 2)
  assert.equal(next.stars[64], undefined)
})
test('a fresh version-three course keeps its new progress', () => {
  const next = migrateCourseProgress({ completed: 4, stars: [3, 2, 1, 3], courseVersion: 3 })
  assert.equal(next.completed, 4)
  assert.deepEqual(next.stars, [3, 2, 1, 3])
  assert.deepEqual(next.unearnedLevels, [])
})

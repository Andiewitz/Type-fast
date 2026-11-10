import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { lessonOutcome } from '../client/app/src/components/lesson/outcome.ts'

test('the allowed mistakes do not end an unfinished lesson', () => {
  assert.equal(lessonOutcome(false, 5, 5, 0, 15), 'in-progress')
  assert.equal(lessonOutcome(false, 6, 5, 0, 15), 'mistakes')
})
test('a completed lesson must meet its speed goal', () => {
  assert.equal(lessonOutcome(true, 5, 5, 14, 15), 'speed')
  assert.equal(lessonOutcome(true, 5, 5, 15, 15), 'passed')
})
test('the mistake limit still applies on the final input', () => {
  assert.equal(lessonOutcome(true, 6, 5, 40, 15), 'mistakes')
})

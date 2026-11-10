import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { sanitizeStars } from '../client/app/src/components/lesson/savedStars.ts'

test('sanitizes saved ratings without inventing stars', () => {
  assert.deepEqual(sanitizeStars(null, 6), [])
  assert.deepEqual(sanitizeStars([3, -1, 5, '2', 2], 4), [3, 0, 0, 0])
})

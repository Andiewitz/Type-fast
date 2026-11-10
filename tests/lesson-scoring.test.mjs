import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { calculateWpm } from '../client/app/src/components/lesson/scoring.ts'

test('speed is zero before time or correct characters exist', () => {
  assert.equal(calculateWpm(0, 5000), 0)
  assert.equal(calculateWpm(25, 0), 0)
})
test('short attempts use a five second minimum', () => {
  assert.equal(calculateWpm(25, 1000), 60)
  assert.equal(calculateWpm(25, 5000), 60)
})
test('longer attempts use their actual elapsed time', () => {
  assert.equal(calculateWpm(50, 30000), 20)
})

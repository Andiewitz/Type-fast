import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { aggregateRounds } from '../client/app/src/components/lesson/aggregateRounds.ts'

test('aggregates time, characters, accuracy and mistakes across rounds', () => {
  const a = { seconds: 10, correctChars: 20, attempts: 22, correctAttempts: 20, mistakeCount: 2, mistakes: { a: 2 }, samples: [{seconds: 10, wpm: 24}] }
  const b = { seconds: 5, correctChars: 15, attempts: 15, correctAttempts: 15, mistakeCount: 0, mistakes: {}, samples: [{seconds: 5, wpm: 36}] }
  const result = aggregateRounds([a, b])
  assert.equal(result.wpm, 28)
  assert.equal(result.accuracy, 94)
  assert.equal(result.mistakeCount, 2)
  assert.deepEqual(result.samples.map(sample => sample.seconds), [10, 15])
  assert.equal(result.passed, true)
})

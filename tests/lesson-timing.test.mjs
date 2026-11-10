import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { MIN_LESSON_MS, remainingLessonMs } from '../client/app/src/components/lesson/lessonTiming.ts'

test('requires ten seconds of active lesson time', () => {
  assert.equal(MIN_LESSON_MS, 10000)
  assert.equal(remainingLessonMs(0), 10000)
  assert.equal(remainingLessonMs(9500), 500)
  assert.equal(remainingLessonMs(10000), 0)
  assert.equal(remainingLessonMs(15000), 0)
})

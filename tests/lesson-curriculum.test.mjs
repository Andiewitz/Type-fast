import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { lessons } from '../client/app/src/curriculum.ts'

test('the path increases speed targets and tightens mistake allowances', () => {
  assert.equal(lessons[0].maxMistakes, 5)
  assert.equal(lessons.at(-1).minWpm, 30)
  lessons.slice(1).forEach((lesson, index) => {
    assert.ok(lesson.minWpm >= lessons[index].minWpm)
    assert.ok(lesson.maxMistakes <= lessons[index].maxMistakes)
  })
})
test('each exercise uses only keys introduced so far', () => {
  const introduced = ['fj', 'dk', 'sl', 'a;', 'gh', '']
  let keys = ' '
  lessons.forEach((lesson, index) => {
    keys += introduced[index]
    for (const char of lesson.text) assert.ok(keys.includes(char), `${lesson.name} uses ${char} before it is introduced`)
  })
})

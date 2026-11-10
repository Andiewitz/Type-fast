import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { lessons } from '../client/app/src/curriculum.ts'
import { createRounds, ROUNDS_PER_LEVEL } from '../client/app/src/components/lesson/rounds.ts'

function randomWithSeed(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32 } }

test('every level generates ten varied nonempty rounds', () => {
  for (const lesson of lessons) {
    const rounds = createRounds(lesson, randomWithSeed(42))
    assert.equal(rounds.length, ROUNDS_PER_LEVEL)
    assert.ok(rounds.every(Boolean))
    assert.equal(new Set(rounds).size, ROUNDS_PER_LEVEL, lesson.name)
  }
})
test('separate attempts use different round sequences', () => {
  assert.notDeepEqual(createRounds(lessons[0], randomWithSeed(1)), createRounds(lessons[0], randomWithSeed(2)))
})
test('whitespace and Java structure survive randomization', () => {
  const indented = lessons.find(lesson => lesson.name === 'Indented lines')
  assert.ok(createRounds(indented, randomWithSeed(42)).every(text => text.includes('\n\t')))
  const java = lessons.find(lesson => lesson.name === 'A class')
  assert.ok(createRounds(java, randomWithSeed(42)).every(text => /^class Rugo\d \{\n\tint score = 0;\n\}$/.test(text)))
})

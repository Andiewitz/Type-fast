import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { lessons } from '../client/app/src/curriculum.ts'
import { createRounds, roundBanks, ROUNDS_PER_LEVEL } from '../client/app/src/components/lesson/rounds.ts'

function randomWithSeed(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32 } }

test('every level has ten distinct authored examples and generates ten unique rounds', () => {
  assert.equal(roundBanks.length, 13)
  for (const lesson of lessons) {
    const bank = roundBanks[lesson.chapterIndex][lesson.levelIndex]
    assert.ok(new Set(bank).size >= 10, lesson.name)
    const rounds = createRounds(lesson, randomWithSeed(42))
    assert.equal(rounds.length, ROUNDS_PER_LEVEL)
    assert.equal(new Set(rounds).size, ROUNDS_PER_LEVEL, lesson.name)
    assert.ok(rounds.every(text => text.length >= 28 && text.length <= 85), lesson.name)
  }
})
test('rounds vary their actual content rather than rearranging the same words', () => {
  for (const lesson of lessons) {
    const rounds = createRounds(lesson, randomWithSeed(42))
    const signatures = rounds.map(text => (text.toLowerCase().match(/[a-z0-9]+|[@#$%]/g) || []).sort().join(' '))
    assert.ok(new Set(signatures).size >= 5, lesson.name)
  }
})
test('separate attempts use different round sequences', () => {
  assert.notDeepEqual(createRounds(lessons[0], randomWithSeed(1)), createRounds(lessons[0], randomWithSeed(2)))
})
test('hand-specific chapters stay on their assigned keys', () => {
  for (const lesson of lessons.filter(lesson => lesson.chapterIndex < 2)) {
    const allowed = lesson.chapterIndex === 0 ? /^[qwertasdfgzxcvb ]+$/ : /^[yuiophjklnm ]+$/
    for (const text of createRounds(lesson, randomWithSeed(42))) assert.match(text, allowed, lesson.name)
  }
})
test('paragraph and Java examples retain indentation and line breaks', () => {
  const indented = lessons.find(lesson => lesson.name === 'Indented lines')
  assert.ok(createRounds(indented, randomWithSeed(42)).every(text => text.includes('\n\t')))
  const java = lessons.find(lesson => lesson.name === 'A class')
  assert.ok(createRounds(java, randomWithSeed(42)).every(text => /^class [A-Z]/.test(text) && text.includes('\n\t') && text.includes('\n}')))
})

test('every authored example respects chapter input boundaries', () => {
  for (const lesson of lessons) {
    const bank = roundBanks[lesson.chapterIndex][lesson.levelIndex]
    for (const text of bank) {
      assert.match(text, /^[\x09\x0A\x20-\x7E]+$/, `${lesson.name} contains an unsupported character`)
      if (lesson.chapterIndex < 3) assert.match(text, /^[a-z ]+$/, lesson.name)
      if (lesson.chapterIndex < 7) assert.ok(!/[\n\t]/.test(text), lesson.name)
      if (lesson.chapterIndex === 0) assert.match(text, /^[qwertasdfgzxcvb ]+$/, lesson.name)
      if (lesson.chapterIndex === 1) assert.match(text, /^[yuiophjklnm ]+$/, lesson.name)
    }
  }
})

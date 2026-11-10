import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { chapters, lessons } from '../client/app/src/curriculum.ts'

test('all thirteen chapters contain three playable exercises', () => {
  assert.equal(chapters.length, 13)
  assert.equal(lessons.length, 39)
  assert.ok(chapters.every(chapter => chapter.drills.length === 3))
  assert.ok(lessons.every(lesson => lesson.text.length > 0 && lesson.minWpm > 0 && lesson.maxMistakes >= 0))
})
test('capitalization begins at chapter four', () => {
  assert.ok(chapters.slice(0, 3).every(chapter => !chapter.caseSensitive))
  assert.ok(chapters.slice(3).every(chapter => chapter.caseSensitive))
})
test('chapter content includes whitespace, symbols and Java', () => {
  assert.ok(chapters[7].drills.some(drill => drill.text.includes('\n') && drill.text.includes('\t')))
  assert.match(chapters[8].drills.map(drill => drill.text).join(' '), /[@#$%]/)
  assert.match(chapters[11].drills.map(drill => drill.text).join(' '), /class/)
})

test('hand-specific chapters use only their designated letters', () => {
  assert.match(chapters[0].drills.map(drill => drill.text).join(' '), /^[qwertasdfgzxcvb ]+$/)
  assert.match(chapters[1].drills.map(drill => drill.text).join(' '), /^[yuiophjklnm ]+$/)
})

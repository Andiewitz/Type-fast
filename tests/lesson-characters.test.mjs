import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { normalizeLessonInput, displayLessonCharacter, describeLessonCharacter } from '../client/app/src/components/lesson/characters.ts'

test('beginner chapters ignore case but advanced chapters preserve it', () => {
  assert.equal(normalizeLessonInput('RUGO', false), 'rugo')
  assert.equal(normalizeLessonInput('RUGO', true), 'RUGO')
})
test('whitespace has visible and accessible labels', () => {
  assert.equal(displayLessonCharacter('\n'), '↵\n')
  assert.equal(displayLessonCharacter('\t'), '⇥')
  assert.equal(describeLessonCharacter('\n'), 'Enter')
  assert.equal(describeLessonCharacter('\t'), 'Tab')
})

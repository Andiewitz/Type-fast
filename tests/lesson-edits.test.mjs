import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { canApplyEdit } from '../client/app/src/components/lesson/edits.ts'

test('correct typing can advance', () => assert.equal(canApplyEdit('f', 'ff', 'fff'), true))
test('a mistake must be corrected before appending', () => assert.equal(canApplyEdit('fx', 'fxf', 'fff'), false))
test('backspace and replacement can correct a mistake', () => {
  assert.equal(canApplyEdit('fx', 'f', 'fff'), true)
  assert.equal(canApplyEdit('fx', 'ff', 'fff'), true)
})

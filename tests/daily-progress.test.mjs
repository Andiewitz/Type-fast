import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { resetDailyTotals } from '../client/app/src/dailyProgress.ts'

test('rollover resets daily totals without touching lifetime progress', () => {
  const old = { today: '2026-11-09', todayLessons: 2, todaySeconds: 30, todayBest: 45, xp: 100 }
  assert.deepEqual(resetDailyTotals(old, '2026-11-10'), { today: '2026-11-10', todayLessons: 0, todaySeconds: 0, todayBest: 0, xp: 100 })
  assert.equal(resetDailyTotals(old, old.today), old)
})

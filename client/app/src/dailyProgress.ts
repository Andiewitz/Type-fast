export type DailyTotals = { today: string; todayLessons: number; todaySeconds: number; todayBest: number }

export function resetDailyTotals<T extends DailyTotals>(progress: T, today: string): T {
  return progress.today === today ? progress : { ...progress, today, todayLessons: 0, todaySeconds: 0, todayBest: 0 }
}

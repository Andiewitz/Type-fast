import { useEffect } from 'react'
export type ComboMilestone = { count: number; id: number }
export function ComboFeedback({ milestone, onDismiss }: { milestone: ComboMilestone | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!milestone) return
    const timer = window.setTimeout(onDismiss, 1800)
    return () => window.clearTimeout(timer)
  }, [milestone, onDismiss])
  const label = milestone ? milestone.count >= 30 ? 'Unstoppable!' : milestone.count >= 20 ? 'Amazing rhythm!' : milestone.count >= 10 ? 'On a roll!' : 'Nice start!' : ''
  return <span aria-live="polite" aria-atomic="true">{milestone && <span key={milestone.id} className="combo-feedback"><span aria-hidden="true">✦</span> <strong>{milestone.count} combo!</strong> {label}</span>}</span>
}


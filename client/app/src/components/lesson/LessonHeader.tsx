import { Mascot } from '../Mascot'
import { SoundToggle } from '../SoundToggle'
import { ComboFeedback } from './ComboFeedback'
import type { ComboMilestone } from './ComboFeedback'
function formatTime(ms: number) { const seconds = Math.floor(ms / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
export function LessonHeader({ progress, combo, wpm, accuracy, hasTyped, hasError, elapsedMs, bestWpm, milestone, onDismissMilestone, onClose }: { progress: number; combo: number; wpm: number; accuracy: number; hasTyped: boolean; hasError: boolean; elapsedMs: number; bestWpm: number; milestone: ComboMilestone | null; onDismissMilestone: () => void; onClose: () => void }) {
  const message = hasError ? 'No worries! Backspace to fix it.' : combo >= 20 ? 'Incredible rhythm! Keep it going!' : combo >= 10 ? `${combo} clean keys in a row. Keep it up!` : combo > 2 ? 'Nice rhythm! Keep your eyes on the screen.' : 'Find your home row and take your time.'
  return <>
    <div className="lesson-topbar"><button type="button" className="lesson-close" onClick={onClose} aria-label="Close lesson">×</button><div className="lesson-progress" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{width: `${progress}%`}} /></div><SoundToggle compact/><div className={`lesson-combo ${combo >= 20 ? 'combo-hot' : combo >= 10 ? 'combo-warm' : ''}`}><span aria-hidden="true">🔥</span> {combo} combo</div></div>
    <div className="lesson-dashboard"><div className="lesson-coach"><Mascot mood={hasError ? 'encourage' : combo >= 20 ? 'celebrate' : combo >= 10 ? 'happy' : 'idle'}/><p><ComboFeedback milestone={milestone} onDismiss={onDismissMilestone}/>{!milestone && message}</p></div><div className="lesson-stats"><div className="lesson-stat"><span>WPM</span><strong>{wpm}</strong><small>Best: {bestWpm}</small></div><div className="lesson-stat"><span>Accuracy</span><strong>{hasTyped ? `${accuracy}%` : '—'}</strong><small>{hasTyped ? (accuracy >= 95 ? 'On target' : 'Keep going') : 'Start typing'}</small></div><div className="lesson-stat"><span>Time</span><strong>{formatTime(elapsedMs)}</strong><small>Elapsed</small></div></div></div>
  </>
}





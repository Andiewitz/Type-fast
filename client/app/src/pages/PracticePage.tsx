import { lessons, type Progress } from '../progress'
import './PracticePage.css'

export function PracticePage({ progress, start }: { progress: Progress; start: (index: number) => void }) {
  const available = Math.min(progress.completed + 1, lessons.length)
  return <main className="activity"><section className="activity-card practice-card"><h1>Practice</h1>
    <p>Choose an unlocked lesson to build confidence. Replays count towards your daily practice.</p>
    <div className="practice-list">{lessons.slice(0, available).map((lesson, index) => <button type="button" key={lesson.name} onClick={() => start(index)}>
      <span><strong>{lesson.name}</strong><small>{index < progress.completed ? 'Practice again' : 'Continue learning'}</small></span>
      <span aria-hidden="true">→</span>
    </button>)}</div>
  </section></main>
}

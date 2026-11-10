import { useEffect, useState } from 'react'
import { Mascot } from './Mascot'
import './LessonLoading.css'

const duration = 2400
const messages = [
  'Preparing your lesson…',
  'Warming up those typing fingers…',
  'Almost ready. Let’s do this!',
]

export function LessonLoading({ index, onReady }: { index: number; onReady: (index: number) => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      setProgress(Math.min(100, Math.round((Date.now() - startedAt) / duration * 100)))
    }, 80)
    const timeout = window.setTimeout(() => onReady(index), duration)
    return () => { window.clearInterval(interval); window.clearTimeout(timeout) }
  }, [index, onReady])

  return <main className="lesson-loading">
    <section className="lesson-loading-card" aria-labelledby="loading-title">
      <div className="lesson-loading-art" aria-hidden="true"><div className="walking-rugo"><Mascot motion="walk" mood="curious" /></div><div className="walking-ground" /></div>
      <h1 id="loading-title">Rugo is getting things ready</h1>
      <p aria-live="polite">{messages[Math.min(messages.length - 1, Math.floor(progress / 34))]}</p>
      <div className="lesson-loading-track" role="progressbar" aria-label="Preparing lesson" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className="lesson-loading-fill" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <span className="lesson-loading-caption">Getting your next lesson ready</span>
      <button type="button" className="lesson-loading-skip" onClick={() => onReady(index)}>Start now</button>
    </section>
  </main>
}

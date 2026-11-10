import { useEffect, useRef, useState } from 'react'

export type SpeedSample = { seconds: number; wpm: number }
export type LessonResultData = { seconds: number; wpm: number; accuracy: number; passed: boolean; samples: SpeedSample[] }
export function useTypingLesson(text: string, minWpm: number, onComplete: (seconds: number, wpm: number) => void) {
  const [input, setInput] = useState('')
  const [paused, setPaused] = useState(false)
  const [started, setStarted] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [attempts, setAttempts] = useState({ total: 0, correct: 0, combo: 0 })
  const [result, setResult] = useState<LessonResultData | null>(null)
  const runningSince = useRef<number | null>(null)
  const bankedMs = useRef(0)
  const samples = useRef<SpeedSample[]>([])
  const done = input === text
  const currentTime = () => bankedMs.current + (runningSince.current === null ? 0 : Date.now() - runningSince.current)

  useEffect(() => {
    if (!started || paused || done || result) return
    const timer = window.setInterval(() => setElapsedMs(currentTime()), 100)
    return () => window.clearInterval(timer)
  }, [started, paused, done, result])

  function change(value: string) {
    if (paused || done || result) return
    if (!started && value.length > 0) { runningSince.current = Date.now(); setStarted(true) }
    const next = value.slice(0, text.length)
    if (next.length > input.length && next.startsWith(input)) {
      const added = next.slice(input.length)
      setAttempts(prev => {
        let { total, correct, combo } = prev
        for (let i = 0; i < added.length; i++) { const hit = added[i] === text[input.length + i]; total++; if (hit) { correct++; combo++ } else combo = 0 }
        return { total, correct, combo }
      })
    }
    if (next.length > input.length && next.startsWith(input)) {
      const seconds = currentTime() / 1000
      const correct = [...next].reduce((count, char, i) => count + Number(char === text[i]), 0)
      if (seconds >= 1 && (samples.current.length === 0 || seconds - samples.current[samples.current.length - 1].seconds >= 1)) {
        samples.current.push({ seconds, wpm: Math.round((correct / 5) / (seconds / 60)) })
      }
    }
    setInput(next)
    if (next === text) { bankedMs.current = currentTime(); runningSince.current = null; setElapsedMs(bankedMs.current) }
  }
  function togglePause() {
    if (done || result) return
    if (paused) { if (started) runningSince.current = Date.now(); setPaused(false) }
    else { bankedMs.current = currentTime(); runningSince.current = null; setElapsedMs(bankedMs.current); setPaused(true) }
  }
  const correctChars = [...input].reduce((n, char, i) => n + Number(char === text[i]), 0)
  const accuracy = attempts.total ? Math.round(attempts.correct / attempts.total * 100) : 100
  const wpm = elapsedMs > 0 ? Math.round((correctChars / 5) / (Math.max(elapsedMs, 1000) / 60000)) : 0
  function finish() {
    if (!done || result) return
    const seconds = Math.max(1, elapsedMs / 1000)
    const passed = wpm >= minWpm
    const history = [...samples.current]
    if (history.length === 0 || seconds - history[history.length - 1].seconds > 0.1) history.push({ seconds, wpm })
    else history[history.length - 1] = { seconds, wpm }
    setResult({ seconds, wpm, accuracy, passed, samples: history })
    if (passed) onComplete(seconds, wpm)
  }
  return { input, change, paused, togglePause, elapsedMs, wpm, accuracy, hasTyped: attempts.total > 0, combo: attempts.combo, done, finish, result }
}

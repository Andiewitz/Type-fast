import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComboMilestone } from './ComboFeedback'
import { useSound } from '../../sound/SoundProvider'
import { calculateWpm } from './scoring'
import { canApplyEdit } from './edits'

export type SpeedSample = { seconds: number; wpm: number }
export type LessonResultData = { seconds: number; wpm: number; accuracy: number; passed: boolean; samples: SpeedSample[] }
export function useTypingLesson(text: string, minWpm: number, onComplete: (seconds: number, wpm: number, accuracy: number) => void) {
  const { play } = useSound()
  const [input, setInput] = useState('')
  const [paused, setPaused] = useState(false)
  const [started, setStarted] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [attempts, setAttempts] = useState({ total: 0, correct: 0, combo: 0 })
  const [result, setResult] = useState<LessonResultData | null>(null)
  const [milestone, setMilestone] = useState<ComboMilestone | null>(null)
  const milestoneId = useRef(0)
  const dismissMilestone = useCallback(() => setMilestone(null), [])
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
    if (paused || done || result || !canApplyEdit(input, value, text)) return
    if (!started && value.length > 0) { runningSince.current = Date.now(); setStarted(true) }
    const next = value.slice(0, text.length)
    let prefix = 0
    while (prefix < input.length && prefix < next.length && input[prefix] === next[prefix]) prefix++
    let suffix = 0
    while (suffix < input.length - prefix && suffix < next.length - prefix && input[input.length - 1 - suffix] === next[next.length - 1 - suffix]) suffix++
    const added = next.slice(prefix, next.length - suffix)
    if (added.length > 0) {
      const allCorrect = [...added].every((char, i) => char === text[prefix + i])
      const nextCombo = attempts.combo + added.length
      const reached = [5, 10, 20, 30, 50, 75, 100].filter(n => attempts.combo < n && nextCombo >= n).pop()
      if (!allCorrect) { play('mistake'); setMilestone(null) }
      else if (reached) { play(reached >= 20 ? 'bigCombo' : 'combo'); setMilestone({ count: reached, id: ++milestoneId.current }) }
      else play('tap')
      setAttempts(prev => {
        let { total, correct, combo } = prev
        for (let i = 0; i < added.length; i++) { const hit = added[i] === text[prefix + i]; total++; if (hit) { correct++; combo++ } else combo = 0 }
        return { total, correct, combo }
      })
    }
    if (added.length > 0) {
      const seconds = currentTime() / 1000
      const correct = [...next].reduce((count, char, i) => count + Number(char === text[i]), 0)
      if (seconds >= 1 && (samples.current.length === 0 || seconds - samples.current[samples.current.length - 1].seconds >= 1)) {
        samples.current.push({ seconds, wpm: calculateWpm(correct, seconds * 1000) })
      }
    }
    if (next.length < input.length) setMilestone(null)
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
  const wpm = calculateWpm(correctChars, elapsedMs)
  function finish() {
    if (!done || result) return
    const seconds = Math.max(1, elapsedMs / 1000)
    const passed = wpm >= minWpm
    const history = [...samples.current]
    if (history.length === 0 || seconds - history[history.length - 1].seconds > 0.1) history.push({ seconds, wpm })
    else history[history.length - 1] = { seconds, wpm }
    play(passed ? 'success' : 'mistake')
    setResult({ seconds, wpm, accuracy, passed, samples: history })
    if (passed) onComplete(seconds, wpm, accuracy)
  }
  return { input, change, paused, togglePause, elapsedMs, wpm, accuracy, hasTyped: attempts.total > 0, combo: attempts.combo, milestone, dismissMilestone, done, finish, result }
}





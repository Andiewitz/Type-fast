import { useEffect, useRef, useState } from 'react'
import { lessons } from '../progress'
import { LessonResult } from './lesson/LessonResult'
import { LessonHeader } from './lesson/LessonHeader'
import { HomeRowIntro } from './lesson/HomeRowIntro'
import { ChapterIntro } from './lesson/ChapterIntro'
import { displayLessonCharacter } from './lesson/characters'
import { TypingKeyboard } from './lesson/TypingKeyboard'
import { useTypingLesson, type LessonResultData } from './lesson/useTypingLesson'
import { createRounds, ROUNDS_PER_LEVEL } from './lesson/rounds'
import { aggregateRounds } from './lesson/aggregateRounds'
import './lesson/Lesson.css'

type LessonProps = { index: number; bestWpm: number; isFirstClear: boolean; showIntro?: boolean; onNext?: () => void; onClose: () => void; onFinish: (index: number, seconds: number, wpm: number, accuracy: number) => void }

function RoundAttempt({ index, text, round, bestWpm, onClose, onRoundComplete, onRetry }: { index: number; text: string; round: number; bestWpm: number; onClose: () => void; onRoundComplete: (result: LessonResultData) => void; onRetry: () => void }) {
  const lesson = lessons[index]
  const state = useTypingLesson(text, lesson.minWpm, lesson.maxMistakes, lesson.caseSensitive, round === ROUNDS_PER_LEVEL - 1, onRoundComplete)
  const hasError = [...state.input].some((char, i) => char !== text[i])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [inputNotice, setInputNotice] = useState('')
  useEffect(() => { inputRef.current?.focus() }, [])
  function pause() { const wasPaused = state.paused; state.togglePause(); if (wasPaused) requestAnimationFrame(() => inputRef.current?.focus()) }
  if (state.result && !state.result.passed) return <LessonResult maxMistakes={lesson.maxMistakes} goalWpm={lesson.minWpm} index={index} xpReward={0} bestBefore={bestWpm} result={state.result} onRetry={onRetry} onContinue={onClose} retryRound/>
  return <main className="lesson-screen"><div className="lesson-content">
    <LessonHeader progress={(round + state.input.length / text.length) / ROUNDS_PER_LEVEL * 100} combo={state.combo} wpm={state.wpm} accuracy={state.accuracy} hasTyped={state.hasTyped} hasError={hasError} mistakeCount={state.mistakeCount} maxMistakes={lesson.maxMistakes} elapsedMs={state.elapsedMs} bestWpm={bestWpm} milestone={state.milestone} onDismissMilestone={state.dismissMilestone} onClose={onClose}/>
    <section className={`lesson-exercise ${state.paused ? 'is-paused' : ''}`} aria-labelledby="exercise-title">
      <div className="lesson-exercise-heading"><h1 id="exercise-title">{`Chapter ${lesson.chapterIndex + 1} · Level ${lesson.levelIndex + 1} · ${lesson.name}`}</h1><div className="lesson-goals"><span aria-live="polite">Round {round + 1} / {ROUNDS_PER_LEVEL}</span><span>Goal: {lesson.minWpm} WPM</span><span className={state.mistakeCount >= lesson.maxMistakes - 1 ? 'mistakes-warning' : ''} role="status">Mistakes this round: {state.mistakeCount} / {lesson.maxMistakes}</span></div></div>
      <label className="lesson-input-label" htmlFor="lesson-typing">Type the exercise below</label>
      <div className="lesson-text" aria-hidden="true">{[...text].map((char, i) => <span key={i} className={i < state.input.length ? char === state.input[i] ? 'typed-correct' : 'typed-error' : i === state.input.length ? 'typing-cursor' : ''}>{displayLessonCharacter(char)}</span>)}</div>
      <textarea ref={inputRef} id="lesson-typing" className="lesson-typing-input" value={state.input} onChange={e => { setInputNotice(''); state.change(e.target.value) }} onKeyDown={e => { if (!hasError && e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && e.currentTarget.selectionStart === state.input.length && text[state.input.length] === '\t') { e.preventDefault(); state.change(state.input + '\t') } }} onPaste={e => { e.preventDefault(); setInputNotice('Please type the exercise instead of pasting it.') }} onDrop={e => { e.preventDefault(); setInputNotice('Please type the exercise instead of dropping text.') }} disabled={state.paused || state.done} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-describedby="lesson-instructions" />
      <p id="lesson-instructions" className="screen-reader-only">Round {round + 1} of {ROUNDS_PER_LEVEL}. Type: {text.replaceAll('\n', ' [Enter] ').replaceAll('\t', ' [Tab] ')}. Correct mistakes to finish. You may make up to {lesson.maxMistakes} mistakes in this round. {state.paused ? 'Lesson paused.' : ''}</p>
      {inputNotice && <p className="lesson-input-notice" role="status">{inputNotice}</p>}{state.paused && <div className="lesson-paused"><strong>Lesson paused</strong><button type="button" onClick={pause}>Resume lesson</button></div>}
    </section>
    {text[state.input.length] === '\t' && !hasError && !state.paused && <button type="button" className="lesson-insert-tab" onClick={() => { state.change(state.input + '\t'); requestAnimationFrame(() => inputRef.current?.focus()) }}>Insert Tab</button>}
    <TypingKeyboard hasError={hasError} nextKey={state.done ? undefined : text[state.input.length]}/>
  </div><footer className="lesson-actions"><button type="button" className="lesson-pause-button" onClick={pause} disabled={state.done}>{state.paused ? 'Resume' : 'Pause'}</button></footer></main>
}

function LessonRun({ index, bestWpm, isFirstClear, onClose, onFinish, onNext }: LessonProps) {
  const lesson = lessons[index]
  const [bestBefore, setBestBefore] = useState(bestWpm)
  const [xpReward, setXpReward] = useState(isFirstClear ? 20 : 0)
  const [rounds, setRounds] = useState(() => createRounds(lesson))
  const [round, setRound] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [completedRounds, setCompletedRounds] = useState<LessonResultData[]>([])
  const [finalResult, setFinalResult] = useState<LessonResultData | null>(null)
  function completeRound(result: LessonResultData) {
    const next = [...completedRounds, result]
    if (next.length === ROUNDS_PER_LEVEL) {
      const final = aggregateRounds(next)
      setFinalResult(final)
      onFinish(index, final.seconds, final.wpm, final.accuracy)
    } else { setCompletedRounds(next); setRound(round + 1); setAttempt(0) }
  }
  function retryRound() {
    const candidates = createRounds(lesson)
    setRounds(old => {
      const replacement = candidates.find(text => !old.includes(text)) || candidates.find(text => text !== old[round]) || old[round]
      return old.map((text, i) => i === round ? replacement : text)
    })
    setAttempt(value => value + 1)
    window.scrollTo(0, 0)
  }
  function retryLevel() {
    setBestBefore(bestWpm); setXpReward(0); setRounds(createRounds(lesson)); setCompletedRounds([]); setRound(0); setAttempt(0); setFinalResult(null); window.scrollTo(0, 0)
  }
  if (finalResult) return <LessonResult maxMistakes={lesson.maxMistakes} goalWpm={lesson.minWpm} index={index} xpReward={xpReward} bestBefore={bestBefore} result={finalResult} onRetry={retryLevel} onContinue={onClose} onNext={onNext}/>
  return <RoundAttempt key={`${round}-${attempt}`} index={index} text={rounds[round]} round={round} bestWpm={bestBefore} onClose={onClose} onRoundComplete={completeRound} onRetry={retryRound}/>
}

export function Lesson(props: LessonProps) {
  const [showIntro, setShowIntro] = useState(Boolean(props.showIntro))
  if (showIntro) return props.index === 0 ? <HomeRowIntro onStart={() => setShowIntro(false)} onClose={props.onClose}/> : <ChapterIntro lessonIndex={props.index} onStart={() => setShowIntro(false)} onClose={props.onClose}/>
  return <LessonRun {...props}/>
}

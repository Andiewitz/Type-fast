import { useEffect, useRef, useState } from 'react'
import { lessons } from '../progress'
import { LessonResult } from './lesson/LessonResult'
import { LessonHeader } from './lesson/LessonHeader'
import { TypingKeyboard } from './lesson/TypingKeyboard'
import { useTypingLesson } from './lesson/useTypingLesson'
import './lesson/Lesson.css'
function LessonAttempt({index, bestWpm, onClose, onFinish, onRetry}: {index:number; bestWpm:number; onClose:()=>void; onFinish:(index:number, seconds:number,wpm:number)=>void; onRetry:()=>void}) {
 const bestBefore = useRef(bestWpm).current
 const lesson = lessons[index]
 const state = useTypingLesson(lesson.text, index === 5 ? 30 : 0, (seconds, wpm) => onFinish(index, seconds, wpm))
 const inputRef = useRef<HTMLTextAreaElement>(null)
 useEffect(() => { inputRef.current?.focus() }, [])
 function pause() { const wasPaused = state.paused; state.togglePause(); if (wasPaused) requestAnimationFrame(() => inputRef.current?.focus()) }
 if (state.result) return <LessonResult index={index} bestBefore={bestBefore} result={state.result} onRetry={onRetry} onContinue={onClose}/>
 return <main className="lesson-screen"><div className="lesson-content"><LessonHeader progress={state.input.length / lesson.text.length * 100} combo={state.combo} wpm={state.wpm} accuracy={state.accuracy} hasTyped={state.hasTyped} elapsedMs={state.elapsedMs} bestWpm={bestWpm} onClose={onClose}/><section className={`lesson-exercise ${state.paused ? 'is-paused' : ''}`} aria-labelledby="exercise-title"><div className="lesson-exercise-heading"><h1 id="exercise-title">{index === 5 ? 'Speed check' : `Level ${index+1} · ${lesson.name}`}</h1><span>{index === 5 ? 'Goal: 30 WPM' : 'Find your rhythm'}</span></div><label className="lesson-input-label" htmlFor="lesson-typing">Type the exercise below</label><div className="lesson-text" aria-hidden="true">{[...lesson.text].map((char,i) => <span key={i} className={i<state.input.length ? char===state.input[i] ? 'typed-correct' : 'typed-error' : i===state.input.length ? 'typing-cursor' : ''}>{char}</span>)}</div><textarea ref={inputRef} id="lesson-typing" className="lesson-typing-input" value={state.input} onChange={e=>state.change(e.target.value)} disabled={state.paused || state.done} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-describedby="lesson-instructions" /><p id="lesson-instructions" className="screen-reader-only">Type: {lesson.text}. Correct mistakes to finish. {state.paused ? 'Lesson paused.' : ''}</p>{state.paused && <div className="lesson-paused"><strong>Lesson paused</strong><button type="button" onClick={pause}>Resume lesson</button></div>}{state.done && <p className="lesson-complete-message" role="status">Exercise complete! Select Finish lesson.</p>}</section><TypingKeyboard nextKey={state.done ? undefined : lesson.text[state.input.length]}/></div><footer className="lesson-actions"><button type="button" className="lesson-pause-button" onClick={pause} disabled={state.done}>{state.paused ? 'Resume' : 'Pause'}</button><button type="button" className="lesson-finish-button" onClick={() => { state.finish(); window.scrollTo(0, 0) }} disabled={!state.done}>Finish lesson</button></footer></main>
}


export function Lesson(props: {index:number; bestWpm:number; onClose:()=>void; onFinish:(index:number, seconds:number,wpm:number)=>void}) {
 const [attempt, setAttempt] = useState(0)
 return <LessonAttempt key={attempt} {...props} onRetry={() => { setAttempt(value => value + 1); window.scrollTo(0, 0) }}/>
}

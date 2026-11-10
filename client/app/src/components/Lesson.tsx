import { useEffect, useRef, useState } from 'react'
import { lessons } from '../progress'
import { LessonResult } from './lesson/LessonResult'
import { LessonHeader } from './lesson/LessonHeader'
import { HomeRowIntro } from './lesson/HomeRowIntro'
import { TypingKeyboard } from './lesson/TypingKeyboard'
import { useTypingLesson } from './lesson/useTypingLesson'
import './lesson/Lesson.css'
function LessonAttempt({index, bestWpm, isFirstClear, onClose, onFinish, onNext, onRetry}: {index:number; bestWpm:number; isFirstClear:boolean; onClose:()=>void; onFinish:(index:number, seconds:number,wpm:number,accuracy:number)=>void; onNext?:()=>void; onRetry:()=>void}) {
 const [bestBefore] = useState(bestWpm)
 const [xpReward] = useState(isFirstClear ? 20 : 0)
 const lesson = lessons[index]
 const state = useTypingLesson(lesson.text, lesson.minWpm, lesson.maxMistakes, (seconds, wpm, accuracy) => onFinish(index, seconds, wpm, accuracy))
 const hasError = [...state.input].some((char, i) => char !== lesson.text[i])
 const inputRef = useRef<HTMLTextAreaElement>(null)
 const [inputNotice, setInputNotice] = useState('')
 useEffect(() => { inputRef.current?.focus() }, [])
 function pause() { const wasPaused = state.paused; state.togglePause(); if (wasPaused) requestAnimationFrame(() => inputRef.current?.focus()) }
 if (state.result) return <LessonResult maxMistakes={lesson.maxMistakes} goalWpm={lesson.minWpm} index={index} xpReward={xpReward} bestBefore={bestBefore} result={state.result} onRetry={onRetry} onContinue={onClose} onNext={onNext}/>
 return <main className="lesson-screen"><div className="lesson-content"><LessonHeader progress={state.input.length / lesson.text.length * 100} combo={state.combo} wpm={state.wpm} accuracy={state.accuracy} hasTyped={state.hasTyped} hasError={hasError} mistakeCount={state.mistakeCount} maxMistakes={lesson.maxMistakes} elapsedMs={state.elapsedMs} bestWpm={bestWpm} milestone={state.milestone} onDismissMilestone={state.dismissMilestone} onClose={onClose}/><section className={`lesson-exercise ${state.paused ? 'is-paused' : ''}`} aria-labelledby="exercise-title"><div className="lesson-exercise-heading"><h1 id="exercise-title">{index === 5 ? 'Speed check' : `Level ${index+1} · ${lesson.name}`}</h1><div className="lesson-goals"><span>{`Goal: ${lesson.minWpm} WPM`}</span><span className={state.mistakeCount >= lesson.maxMistakes - 1 ? "mistakes-warning" : ""} role="status">Mistakes {state.mistakeCount} / {lesson.maxMistakes}</span></div></div><label className="lesson-input-label" htmlFor="lesson-typing">Type the exercise below</label><div className="lesson-text" aria-hidden="true">{[...lesson.text].map((char,i) => <span key={i} className={i<state.input.length ? char===state.input[i] ? 'typed-correct' : 'typed-error' : i===state.input.length ? 'typing-cursor' : ''}>{char}</span>)}</div><textarea ref={inputRef} id="lesson-typing" className="lesson-typing-input" value={state.input} onChange={e=>{ setInputNotice(''); state.change(e.target.value) }} onPaste={e=>{ e.preventDefault(); setInputNotice('Please type the exercise instead of pasting it.') }} onDrop={e=>{ e.preventDefault(); setInputNotice('Please type the exercise instead of dropping text.') }} disabled={state.paused || state.done} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-describedby="lesson-instructions" /><p id="lesson-instructions" className="screen-reader-only">Type: {lesson.text}. Correct mistakes to finish. You may make up to {lesson.maxMistakes} mistakes. {state.paused ? 'Lesson paused.' : ''}</p>{inputNotice && <p className="lesson-input-notice" role="status">{inputNotice}</p>}{state.paused && <div className="lesson-paused"><strong>Lesson paused</strong><button type="button" onClick={pause}>Resume lesson</button></div>}</section><TypingKeyboard hasError={hasError} nextKey={state.done ? undefined : lesson.text[state.input.length]}/></div><footer className="lesson-actions"><button type="button" className="lesson-pause-button" onClick={pause} disabled={state.done}>{state.paused ? 'Resume' : 'Pause'}</button></footer></main>
}


export function Lesson(props: {index:number; bestWpm:number; isFirstClear:boolean; showIntro?:boolean; onNext?:()=>void; onClose:()=>void; onFinish:(index:number, seconds:number,wpm:number,accuracy:number)=>void}) {
 const [attempt, setAttempt] = useState(0)
 const [showIntro, setShowIntro] = useState(Boolean(props.showIntro))
 if (showIntro) return <HomeRowIntro onStart={() => setShowIntro(false)} onClose={props.onClose}/>
 return <LessonAttempt key={attempt} {...props} onRetry={() => { setAttempt(value => value + 1); window.scrollTo(0, 0) }}/>
}



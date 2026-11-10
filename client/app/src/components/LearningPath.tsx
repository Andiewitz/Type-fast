import { useState } from 'react'
import { chapters, lessons } from '../curriculum'
import { Mascot } from './Mascot'
import { greetingExpressions } from './mascot/expressions'
import { useSound } from '../sound/SoundProvider'
import './LearningPath.css'

export function LearningPath({ completed, stars, start, hasLegacy }: { completed: number; stars: number[]; start: (index: number) => void; hasLegacy: boolean }) {
  const { play } = useSound()
  const [expressionIndex, setExpressionIndex] = useState(0)
  const expression = greetingExpressions[expressionIndex]
  const current = Math.min(completed, lessons.length - 1)
  const currentChapter = lessons[current].chapterIndex
  return <main id="learn" className="learning"><div className="path chapter-path">
    <header className="course-heading"><h1>Learn to type</h1><p>13 chapters, from your first keys to Java.</p></header>
    {hasLegacy && <p className="course-migration-note">Your new course starts here. Your earlier XP, records, and previous course progress are saved on this device.</p>}
    <div className="mascot-wrap"><button type="button" className="mascot-button" aria-label="Show next Rugo expression" onClick={() => { play('select'); setExpressionIndex(index => (index + 1) % greetingExpressions.length) }}><Mascot mood={expression.mood}/></button><span className="mascot-message" aria-live="polite">{expression.message}</span></div>
    {chapters.map((chapter, chapterIndex) => {
      const first = chapterIndex * 3
      const locked = first > completed
      const chapterComplete = completed >= first + chapter.drills.length
      return <section className={`chapter-section ${locked ? 'is-locked' : ''}`} key={chapter.title} aria-labelledby={`chapter-${chapterIndex}`}>
        <div className="unit chapter-heading"><div><span>Chapter {chapterIndex + 1} · Difficulty {chapter.difficulty}/10</span><h2 id={`chapter-${chapterIndex}`}>{chapter.title}</h2></div><strong>{locked ? 'Locked' : chapterComplete ? 'Complete' : `${Math.min(completed - first + 1, 3)} of 3`}</strong></div>
        {!locked && <details className="chapter-details" open={chapterIndex === currentChapter ? true : undefined}><summary>{chapterComplete ? 'Review lessons' : 'View lessons'}</summary><div className="chapter-lessons">{chapter.drills.map((drill, levelIndex) => {
          const index = first + levelIndex
          const done = index < completed
          const available = index <= completed
          return <button type="button" className={`chapter-lesson ${index === current ? 'is-current' : ''}`} key={drill.name} disabled={!available} onClick={() => start(index)}>
            <span className="chapter-lesson-number">{done ? '✓' : levelIndex + 1}</span><span className="chapter-lesson-name"><strong>{drill.name}</strong><small>{available ? `${lessons[index].minWpm} WPM · ${lessons[index].maxMistakes} mistakes allowed` : 'Complete the previous lesson'}</small></span>{stars[index] > 0 && <span className="path-stars" aria-label={`Best: ${stars[index]} out of 3 stars`}>{'★'.repeat(stars[index])}{'☆'.repeat(3 - stars[index])}</span>}<span aria-hidden="true">{available ? '→' : '🔒'}</span>
          </button>
        })}</div></details>}
      </section>
    })}
  </div></main>
}

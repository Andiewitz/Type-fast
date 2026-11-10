import { useState } from 'react'
import { chapters, lessons, LEVELS_PER_CHAPTER } from '../curriculum'
import { Mascot } from './Mascot'
import { LevelNode } from './LevelNode'
import { greetingExpressions } from './mascot/expressions'
import { useSound } from '../sound/SoundProvider'
import './LearningPath.css'

export function LearningPath({ completed, stars, unearnedLevels, start, hasLegacy }: { completed: number; stars: number[]; unearnedLevels: number[]; start: (index: number) => void; hasLegacy: boolean }) {
  const { play } = useSound()
  const [expressionIndex, setExpressionIndex] = useState(0)
  const expression = greetingExpressions[expressionIndex]
  const [offsets] = useState(() => lessons.map(() => Math.round((Math.random() * 2 - 1) * 65)))
  return <main id="learn" className="learning"><div className="path chapter-path">
    {hasLegacy && <p className="course-migration-note">The course now has more levels. Your previous progress, XP, and records are saved on this device.</p>}
    <div className="mascot-wrap"><button type="button" className="mascot-button" aria-label="Show next Rugo expression" onClick={() => { play('select'); setExpressionIndex(index => (index + 1) % greetingExpressions.length) }}><Mascot mood={expression.mood}/></button><span className="mascot-message" aria-live="polite">{expression.message}</span></div>
    {chapters.map((chapter, chapterIndex) => {
      const first = chapterIndex * LEVELS_PER_CHAPTER
      const locked = first > completed
      const chapterComplete = completed >= first + chapter.drills.length && !unearnedLevels.some(index => index >= first && index < first + chapter.drills.length)
      return <section className="chapter-section" key={chapter.title} aria-labelledby={`chapter-${chapterIndex}`}>
        <div className={`unit ${locked ? 'next' : ''}`}><div><span>CHAPTER {chapterIndex + 1} · DIFFICULTY {chapter.difficulty}/10</span><h2 id={`chapter-${chapterIndex}`}>{chapter.title}</h2></div><strong>{locked ? 'Locked' : chapterComplete ? 'Complete' : completed >= first + chapter.drills.length ? 'New levels' : `Level ${Math.min(completed - first + 1, chapter.drills.length)} of ${chapter.drills.length}`}</strong></div>
        <div className="chapter-levels">{chapter.drills.map((drill, levelIndex) => {
          const index = first + levelIndex
          return <LevelNode key={`${chapterIndex}-${drill.name}`} index={index} completed={completed} stars={stars[index] || 0} offset={offsets[index]} unearned={unearnedLevels.includes(index)} start={start}/>
        })}</div>
      </section>
    })}
  </div></main>
}

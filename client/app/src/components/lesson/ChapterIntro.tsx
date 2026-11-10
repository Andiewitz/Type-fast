import { Mascot } from '../Mascot'
import { chapters, lessons } from '../../curriculum'
import './HomeRowIntro.css'

export function ChapterIntro({ lessonIndex, onStart, onClose }: { lessonIndex: number; onStart: () => void; onClose: () => void }) {
  const lesson = lessons[lessonIndex]
  const chapterIndex = lesson.chapterIndex
  const chapter = chapters[chapterIndex]
  return <main className="home-row-intro">
    <header className="home-row-topbar"><button type="button" className="home-row-close" aria-label="Close introduction" onClick={onClose}>×</button><span>Chapter {chapterIndex + 1} · Level {lesson.levelIndex + 1} of 5</span></header>
    <div className="home-row-content">
      <aside className="home-row-coach"><p>{chapter.focus}</p><Mascot mood="happy" /></aside>
      <section className="home-row-lesson" aria-labelledby="chapter-intro-title">
        <p className="home-row-level">Chapter {chapterIndex + 1} · Difficulty {chapter.difficulty}/10</p>
        <h1 id="chapter-intro-title">{lesson.name}</h1>
        <div className="chapter-intro-sample"><span>Example round</span><pre>{lesson.text.replaceAll('\t', '⇥').replaceAll('\n', '↵\n')}</pre></div>
        <ol className="home-row-steps">{chapter.tips.map((tip, index) => <li key={tip}><span aria-hidden="true">{index + 1}</span><p>{tip}</p></li>)}</ol>
      </section>
    </div>
    <footer className="home-row-actions"><div><button type="button" onClick={onClose}>Back to path</button><button type="button" onClick={onStart}>Let’s practice</button></div></footer>
  </main>
}

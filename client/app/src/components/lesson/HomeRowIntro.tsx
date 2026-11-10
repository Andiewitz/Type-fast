import { Mascot } from '../Mascot'
import { HomeRowKeyboard } from './HomeRowKeyboard'
import './HomeRowIntro.css'

const steps = [
  <>Rest your index fingers on <strong>F</strong> and <strong>J</strong>.</>,
  <>Let your other fingers rest on the keys beside them.</>,
  <>Stay relaxed and keep your eyes on the screen, not your hands.</>,
]

export function HomeRowIntro({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  return <main className="home-row-intro">
    <header className="home-row-topbar"><button type="button" className="home-row-close" aria-label="Close introduction" onClick={onClose}>×</button><span>Unit 1 · Level 1 of 6</span></header>
    <div className="home-row-content">
      <aside className="home-row-coach"><p>Psst, feel the little bumps on F and J? That’s your home base.</p><Mascot mood="happy" /></aside>
      <section className="home-row-lesson" aria-labelledby="home-row-title">
        <p className="home-row-level">Level 1 · F and J</p>
        <h1 id="home-row-title">Meet your home row</h1>
        <HomeRowKeyboard />
        <ol className="home-row-steps">{steps.map((step, index) => <li key={index}><span aria-hidden="true">{index + 1}</span><p>{step}</p></li>)}</ol>
      </section>
    </div>
    <footer className="home-row-actions"><div><button type="button" onClick={onClose}>Back to path</button><button type="button" onClick={onStart}>Let’s practice</button></div></footer>
  </main>
}

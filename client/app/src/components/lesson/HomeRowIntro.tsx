import { Mascot } from '../Mascot'
import './HomeRowIntro.css'

export function HomeRowIntro({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  return <main className="home-row-intro"><section className="home-row-card" aria-labelledby="home-row-title">
    <div className="home-row-mascot"><Mascot mood="happy" /></div>
    <h1 id="home-row-title">Meet your home row</h1>
    <p>Rest your index fingers on <strong>F</strong> and <strong>J</strong>. Feel the little bumps? They help you find your place without looking down.</p>
    <p>Let your other fingers rest on the nearby keys. Keep your hands relaxed and look at the screen as you type.</p>
    <div className="home-row-keys" aria-label="Left hand: A S D F. Right hand: J K L semicolon."><span>A</span><span>S</span><span>D</span><strong>F</strong><strong>J</strong><span>K</span><span>L</span><span>;</span></div>
    <div className="home-row-actions"><button type="button" onClick={onClose}>Back to path</button><button type="button" onClick={onStart}>Let’s practice</button></div>
  </section></main>
}

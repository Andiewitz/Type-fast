import { useState } from 'react'
import { Icon } from './Icon'
import { Mascot } from './Mascot'
import { lessons } from '../progress'
export function LearningPath({completed, start}: {completed:number; start:(index:number)=>void}) {
 const [happy, setHappy] = useState(false)
 const current = Math.min(completed, lessons.length - 1)
 const offsets = ['one','two','three','four','five','six']
 return <main id="learn" className="learning"><div className="path"><header className="unit"><div><span>UNIT 1</span><h1>Home row heroes</h1></div><strong>{completed >= lessons.length ? 'Unit complete!' : `Level ${current + 1} of 6`}</strong></header>{lessons.map((lesson,i) => {
 const done = i < completed, available = i <= current
 const node = <><button type="button" className={`level-circle ${done ? 'complete' : available ? 'current' : 'locked'}`} disabled={!available} onClick={() => start(i)} aria-label={`${done ? 'Replay' : 'Start'} ${lesson.name}`}><Icon name={done ? 'check' : available ? 'keyboard' : i === 5 ? 'star' : 'lock'} size={available && !done ? 40 : 30}/></button><span>{i === 5 ? 'Speed check · 30 WPM' : `Level ${i+1} · ${lesson.name}`}</span></>
 return i === current ? <div className="current-level" key={lesson.name}><div className="mascot-wrap"><button type="button" className={`mascot-button ${happy ? 'happy' : ''}`} aria-label="Say hello to Rugo" aria-pressed={happy} onClick={() => setHappy(!happy)}><Mascot/></button><span className="mascot-message" aria-live="polite">{happy ? 'Rugo says hi!' : 'Say hi!'}</span></div><div className="current-content"><button type="button" className="start-label" onClick={() => start(i)}>{done ? 'REPLAY' : 'START'}</button>{node}</div></div> : <div className={`level ${offsets[i]}`} key={lesson.name}>{node}</div>
 })}<div className="unit next"><div><span>UNIT 2</span><h2>Top row sprint</h2></div><Icon name="lock" size={28}/></div></div></main>
}

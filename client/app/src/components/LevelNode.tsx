import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import { lessons } from '../curriculum'

export function LevelNode({ index, completed, stars, offset, unearned, start }: { index: number; completed: number; stars: number; unearned: boolean; offset: number; start: (index: number) => void }) {
  const lesson = lessons[index]
  const done = index < completed && !unearned
  const available = index <= completed
  const current = index === completed
  const label = `${done ? 'Replay' : available ? 'Start' : 'Locked'} level ${lesson.levelIndex + 1}: ${lesson.name}`
  const node = <><button type="button" className={`level-circle ${done ? 'complete' : current ? 'current' : available ? 'available' : 'locked'}`} disabled={!available} onClick={() => start(index)} aria-label={label}><Icon name={done ? 'check' : available ? 'keyboard' : 'lock'} size={current ? 40 : 30}/></button><span>Level {lesson.levelIndex + 1} · {lesson.name}</span>{stars > 0 && <span className="path-stars" aria-label={`Best: ${stars} out of 3 stars`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>}</>
  const position = { '--node-offset': `${offset}px` } as CSSProperties
  if (current) return <div className="current-level" style={position}><div className="current-content"><button type="button" className="start-label" onClick={() => start(index)}>START</button>{node}</div></div>
  return <div className="level" style={position}>{node}</div>
}

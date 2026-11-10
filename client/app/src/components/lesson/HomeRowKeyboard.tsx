const keys = [
  { letter: 'A', finger: 'Pinky' }, { letter: 'S', finger: 'Ring' },
  { letter: 'D', finger: 'Middle' }, { letter: 'F', finger: 'Index', home: true },
  { letter: 'J', finger: 'Index', home: true }, { letter: 'K', finger: 'Middle' },
  { letter: 'L', finger: 'Ring' }, { letter: ';', finger: 'Pinky' },
]

export function HomeRowKeyboard() {
  return <div className="home-row-keyboard" role="img" aria-label="Home row: left hand pinky on A, ring finger on S, middle finger on D, index finger on F. Right hand index finger on J, middle finger on K, ring finger on L, pinky on semicolon. Both thumbs rest on space. F and J have bumps.">
    <div className="home-row-key-grid" aria-hidden="true">{keys.map(({ letter, finger, home }) => <div className={`home-row-key-column ${letter === 'J' ? 'right-hand-start' : ''}`} key={letter}>
      <span className="home-row-finger">{finger}</span><span className={`home-row-key ${home ? 'is-home' : ''}`}>{letter}{home && <i />}</span><span className="home-row-bump">{home ? 'Bump' : '\u00a0'}</span>
    </div>)}</div>
    <div className="home-row-space" aria-hidden="true">Both thumbs rest on space</div>
  </div>
}

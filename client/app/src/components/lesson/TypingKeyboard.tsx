import { describeLessonCharacter } from './characters'
const rows = ['1234567890-=', 'qwertyuiop[]\\', "asdfghjkl;'", 'zxcvbnm,./']
const shifted: Record<string, string> = { '!':'1', '@':'2', '#':'3', '$':'4', '%':'5', '^':'6', '&':'7', '*':'8', '(':'9', ')':'0', '_':'-', '+':'=', '{':'[', '}':']', '|':'\\', ':':';', '"':"'", '<':',', '>':'.', '?':'/' }
const fingers: Record<string, string> = { a:'left pinky', q:'left pinky', z:'left pinky', s:'left ring finger', w:'left ring finger', x:'left ring finger', d:'left middle finger', e:'left middle finger', c:'left middle finger', f:'left index finger', r:'left index finger', v:'left index finger', g:'left index finger', t:'left index finger', b:'left index finger', h:'right index finger', y:'right index finger', n:'right index finger', j:'right index finger', u:'right index finger', m:'right index finger', k:'right middle finger', i:'right middle finger', ',':'right middle finger', l:'right ring finger', o:'right ring finger', '.':'right ring finger', ';':'right pinky', p:'right pinky', '/':'right pinky', ' ':'thumb' }
export function TypingKeyboard({ nextKey, hasError = false }: { nextKey: string | undefined; hasError?: boolean }) {
  const character = hasError ? undefined : nextKey
  const key = character ? (shifted[character] || character.toLowerCase()) : undefined
  const needsShift = character ? Boolean(shifted[character]) || (/[A-Z]/.test(character)) : false
  const name = character ? describeLessonCharacter(character) : 'none'
  const keyLabel = needsShift ? (key || '').toUpperCase() : (name === character ? name.toUpperCase() : name)
  const hint = hasError ? 'Backspace to correct the highlighted mistake' : character ? `${needsShift ? 'Shift + ' : ''}${keyLabel}: ${fingers[key || ''] || (character === '\n' ? 'press Enter' : character === '\t' ? 'press Tab' : 'find the next key')}` : 'Exercise complete!'
  return <div className="typing-keyboard" aria-label={hasError ? 'Correct the highlighted mistake before continuing' : `Next key: ${name}`}><div className="finger-hint">↑ &nbsp;{hint}</div><p className="keyboard-guide-caption">Keyboard guide · use your keyboard to type</p><div className="keyboard-rows" aria-hidden="true">{rows.map((row, i) => <div className={`keyboard-row keyboard-row-${i}`} key={row}>{[...row].map(char => <span className={`keyboard-key ${'asdfjkl;'.includes(char) ? 'home-key' : ''} ${key === char ? 'active-key' : ''}`} key={char}>{char}</span>)}</div>)}<div className={`keyboard-space ${key === ' ' ? 'active-key' : ''}`}>SPACE</div></div></div>
}

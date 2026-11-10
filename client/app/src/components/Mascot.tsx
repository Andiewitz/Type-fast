import { Body } from './mascot/Body'
import { Head } from './mascot/Head'
import { WalkRig } from './mascot/WalkRig'
import type { RugoMood } from './mascot/expressions'
import './Mascot.css'

type RugoMotion = 'idle' | 'walk'

export function Mascot({ small = false, mood = 'idle', motion = 'idle' }: { small?: boolean; mood?: RugoMood; motion?: RugoMotion }) {
  return <svg className={`mascot ${small ? 'mascot-small' : 'mascot-character'} mood-${mood} motion-${motion}`} viewBox={small ? '20 8 160 136' : '0 0 200 200'} aria-hidden="true">
    {motion === 'walk' && !small ? <WalkRig /> : <>{!small && <Body />}<Head mood={mood} /></>}
  </svg>
}

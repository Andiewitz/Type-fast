import type { RugoMood } from './expressions'

function Eye({ x, side, mood }: { x: number; side: 'left' | 'right'; mood: RugoMood }) {
  const isCelebrating = mood === 'celebrate'
  const pupilShift = mood === 'curious' || mood === 'thinking' ? (side === 'left' ? 6 : 0) : (side === 'left' ? 3 : -3)
  return <g className={`rugo-eye rugo-eye-${side}`}>
    {isCelebrating ? <path d={`M${x-15} 82 Q${x} 58 ${x+15} 82`} fill="none" stroke="#1F1A3D" strokeWidth="7" strokeLinecap="round"/> : <>
      <ellipse cx={x} cy="78" rx={mood === 'surprised' ? 18 : 17} ry={mood === 'surprised' ? 20 : 18} fill="#fff" />
      <g className="rugo-pupil"><circle cx={x+pupilShift} cy={mood === 'thinking' ? 77 : 81} r="9" fill="#1F1A3D"/><circle cx={x+pupilShift+3} cy={mood === 'thinking' ? 73 : 77} r="3" fill="#fff"/></g>
    </>}
  </g>
}

function Mouth({ mood }: { mood: RugoMood }) {
  if (mood === 'surprised') return <ellipse cx="100" cy="121" rx="8" ry="9" fill="#7A2E0A"/>
  if (mood === 'thinking') return <path d="M89 123 Q98 117 109 122" stroke="#7A2E0A" strokeWidth="5" strokeLinecap="round" fill="none"/>
  if (mood === 'celebrate' || mood === 'happy') return <><path d="M76 116 Q100 131 124 116 Q119 137 100 138 Q81 137 76 116Z" fill="#7A2E0A"/><path d="M89 133 Q100 125 111 133 Q100 140 89 133Z" fill="#F87979"/></>
  if (mood === 'proud') return <path d="M79 118 Q100 135 121 118" stroke="#7A2E0A" strokeWidth="6" strokeLinecap="round" fill="none"/>
  if (mood === 'encourage') return <path d="M84 120 Q100 130 116 120" stroke="#7A2E0A" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
  return <path d="M78 120 Q100 136 122 120" stroke="#7A2E0A" strokeWidth="5" strokeLinecap="round" fill="none"/>
}

export function Head({ mood }: { mood: RugoMood }) {
  return <g className="rugo-head">
    <g className="rugo-spikes" fill="#FFC93C"><circle cx="84" cy="22" r="9"/><circle cx="100" cy="17" r="10"/><circle cx="116" cy="22" r="9"/></g>
    <rect x="28" y="30" width="144" height="114" rx="56" fill="#C4510A" />
    <rect x="28" y="24" width="144" height="114" rx="56" fill="#FF8A3D" />
    <g className="rugo-brows" stroke="#E0681A" strokeWidth="4" strokeLinecap="round" fill="none"><path className="rugo-brow-left" d="M58 49 q11 -8 22 0"/><path className="rugo-brow-right" d="M120 49 q11 -8 22 0"/><path d="M91 40 q9 -5 18 0"/></g>
    <Eye x={68} side="left" mood={mood}/><Eye x={132} side="right" mood={mood}/>
    <rect x="60" y="94" width="80" height="42" rx="21" fill="#FFB070" />
    <circle cx="88" cy="106" r="3.5" fill="#7A2E0A"/><circle cx="112" cy="106" r="3.5" fill="#7A2E0A"/>
    <g className="rugo-cheeks" fill="#FF6B6B" opacity=".5"><circle cx="48" cy="112" r="9"/><circle cx="152" cy="112" r="9"/></g>
    <g className="rugo-mouth"><Mouth mood={mood}/></g>
    {mood === 'celebrate' && <g className="rugo-sparkles" fill="#FFC93C"><path d="M25 41 l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/><path d="M175 38 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>}
  </g>
}

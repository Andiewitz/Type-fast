import type { RugoMood } from './expressions'

function Eye({ x, side }: { x: number; side: 'left' | 'right' }) {
  return <g className={`rugo-eye rugo-eye-${side}`}>
    <ellipse cx={x} cy="78" rx="17" ry="18" fill="#fff" />
    <circle cx={x + (side === 'left' ? 3 : -3)} cy="81" r="9" fill="#1F1A3D" />
    <circle cx={x + (side === 'left' ? 6 : 0)} cy="77" r="3" fill="#fff" />
  </g>
}

export function Head({ mood }: { mood: RugoMood }) {
  const happy = mood === 'happy' || mood === 'celebrate' || mood === 'proud'
  return <g className="rugo-head">
    <g className="rugo-spikes" fill="#FFC93C"><circle cx="84" cy="22" r="9"/><circle cx="100" cy="17" r="10"/><circle cx="116" cy="22" r="9"/></g>
    <rect x="28" y="30" width="144" height="114" rx="56" fill="#C4510A" />
    <rect x="28" y="24" width="144" height="114" rx="56" fill="#FF8A3D" />
    <g className="rugo-brows" stroke="#E0681A" strokeWidth="4" strokeLinecap="round" fill="none"><path d="M58 49 q11 -8 22 0"/><path d="M120 49 q11 -8 22 0"/><path d="M91 40 q9 -5 18 0"/></g>
    <Eye x={68} side="left"/><Eye x={132} side="right"/>
    <rect x="60" y="94" width="80" height="42" rx="21" fill="#FFB070" />
    <circle cx="88" cy="106" r="3.5" fill="#7A2E0A"/><circle cx="112" cy="106" r="3.5" fill="#7A2E0A"/>
    <g className="rugo-cheeks" fill="#FF6B6B" opacity=".5"><circle cx="48" cy="112" r="9"/><circle cx="152" cy="112" r="9"/></g>
    <g className="rugo-mouth">{mood === 'surprised' ? <ellipse cx="100" cy="122" rx="8" ry="9" fill="#7A2E0A"/> : mood === 'thinking' ? <path d="M90 123 Q100 118 110 123" stroke="#7A2E0A" strokeWidth="5" strokeLinecap="round" fill="none"/> : happy ? <><path d="M78 117 Q100 140 122 117 Q119 134 100 135 Q81 134 78 117Z" fill="#7A2E0A"/><path d="M90 131 Q100 123 110 131 Q100 137 90 131Z" fill="#F87979"/></> : <path d={mood === 'encourage' ? 'M81 123 Q100 117 119 123' : 'M78 120 Q100 136 122 120'} stroke="#7A2E0A" strokeWidth="5" strokeLinecap="round" fill="none"/>}</g>
  </g>
}

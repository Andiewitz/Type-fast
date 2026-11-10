export function Mascot({small = false}: {small?: boolean}) {
  return <svg className={small ? 'mascot mascot-small' : 'mascot'} viewBox={small ? '20 8 160 136' : '0 0 200 200'} aria-hidden="true">
    {!small && <><path d="M150 172 Q196 178 192 140 Q178 158 150 158Z" fill="#C4510A"/><ellipse cx="100" cy="162" rx="58" ry="38" fill="#C4510A"/><ellipse cx="100" cy="157" rx="58" ry="38" fill="#FF8A3D"/><ellipse cx="100" cy="166" rx="34" ry="26" fill="#FFE3B8"/><ellipse className="mascot-foot-left" cx="50" cy="168" rx="11" ry="8" fill="#E0681A"/><ellipse className="mascot-foot-right" cx="150" cy="168" rx="11" ry="8" fill="#E0681A"/></>}
    <circle cx="84" cy="22" r="9" fill="#FFC93C"/><circle cx="100" cy="17" r="10" fill="#FFC93C"/><circle cx="116" cy="22" r="9" fill="#FFC93C"/><rect x="28" y="30" width="144" height="114" rx="56" fill="#C4510A"/><rect x="28" y="24" width="144" height="114" rx="56" fill="#FF8A3D"/>
    {!small && <path d="M62 46 q10 -7 20 0M118 46 q10 -7 20 0M90 40 q10 -6 20 0" stroke="#E0681A" strokeWidth="4" strokeLinecap="round" fill="none"/>}
    <circle cx="68" cy="78" r="18" fill="white"/><circle cx="132" cy="78" r="18" fill="white"/><circle cx="72" cy="81" r="9" fill="#1F1A3D"/><circle cx="128" cy="81" r="9" fill="#1F1A3D"/><rect x="60" y="94" width="80" height="42" rx="21" fill="#FFB070"/>{!small && <><circle cx="88" cy="106" r="3.5" fill="#7A2E0A"/><circle cx="112" cy="106" r="3.5" fill="#7A2E0A"/><circle cx="48" cy="112" r="9" fill="#FF6B6B" opacity=".5"/><circle cx="152" cy="112" r="9" fill="#FF6B6B" opacity=".5"/></>}<path d="M78 120 Q100 136 122 120" stroke="#7A2E0A" strokeWidth="5" strokeLinecap="round" fill="none"/>
  </svg>
}


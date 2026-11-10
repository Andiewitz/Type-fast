import './WalkRig.css'

/** A side-profile rig with separate joints for the near and far limbs. */
export function WalkRig() {
  return <>
    <g className="walk-tail"><path d="M75 147 Q47 155 27 130 Q29 163 58 172 Q72 176 86 166Z" fill="#C4510A"/><path d="M76 142 Q46 151 27 130 Q34 155 59 164 Q70 168 84 160Z" fill="#FF8A3D"/></g>
    <g className="walk-leg walk-leg-far"><path d="M87 160 Q83 169 78 178 Q73 186 78 190 Q84 194 97 191 L105 187 Q106 183 99 181 L102 165Z" fill="#C4510A"/><path d="M84 183 Q81 187 84 189 L96 189 L100 186Z" fill="#F79550"/></g>
    <g className="walk-arm walk-arm-far"><path d="M87 131 Q77 133 70 145 Q67 151 72 155 Q78 158 84 151 L96 140Z" fill="#C4510A"/></g>
    <g className="walk-upper">
      <g className="walk-torso"><ellipse cx="101" cy="149" rx="35" ry="32" fill="#C4510A"/><ellipse cx="101" cy="145" rx="35" ry="32" fill="#FF8A3D"/><ellipse cx="115" cy="151" rx="21" ry="23" fill="#FFE3B8"/></g>
      <g className="walk-head">
        <g fill="#FFC93C"><circle cx="78" cy="30" r="8"/><circle cx="94" cy="23" r="10"/><circle cx="111" cy="25" r="9"/></g>
        <path d="M52 78 Q51 27 99 27 Q140 27 149 58 Q153 71 153 83 Q156 114 129 130 Q112 140 85 132 Q53 122 52 78Z" fill="#C4510A"/>
        <path d="M52 72 Q53 24 99 24 Q139 24 148 55 Q153 69 152 79 Q155 110 128 125 Q110 135 85 127 Q53 117 52 72Z" fill="#FF8A3D"/>
        <path d="M105 53 Q116 46 126 53" fill="none" stroke="#E0681A" strokeWidth="4" strokeLinecap="round"/>
        <g className="walk-eye"><ellipse cx="117" cy="72" rx="16" ry="18" fill="#fff"/><circle cx="122" cy="74" r="8.5" fill="#1F1A3D"/><circle cx="125" cy="70" r="3" fill="#fff"/></g>
        <path d="M115 92 Q131 84 153 88 Q171 90 172 103 Q171 117 154 121 Q137 125 119 117 Q108 112 108 103 Q108 96 115 92Z" fill="#FFB070"/>
        <circle cx="151" cy="98" r="3" fill="#7A2E0A"/><path d="M132 110 Q145 118 158 110" fill="none" stroke="#7A2E0A" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="91" cy="100" r="8" fill="#FF6B6B" opacity=".45"/>
      </g>
    </g>
    <g className="walk-leg walk-leg-near"><path d="M101 159 Q101 171 97 180 Q94 187 99 191 Q106 195 120 191 L129 188 Q130 184 123 182 L119 165Z" fill="#E0681A"/><path d="M102 158 Q104 171 100 181 Q98 185 102 187 Q109 190 120 187 L125 185 Q121 182 117 181 L114 164Z" fill="#FF8A3D"/><ellipse cx="115" cy="185" rx="8" ry="4" fill="#FFB070"/></g>
    <g className="walk-arm walk-arm-near"><path d="M108 129 Q118 132 123 144 Q125 151 120 154 Q113 157 109 150 L101 139Z" fill="#E0681A"/><path d="M108 127 Q117 130 121 142 Q123 147 119 149 Q114 151 110 146 L103 137Z" fill="#FF8A3D"/></g>
  </>
}

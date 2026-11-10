import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { Howl } from 'howler'
import tap from '../assets/sounds/tap.wav'
import mistake from '../assets/sounds/mistake.wav'
import select from '../assets/sounds/select.wav'
import combo from '../assets/sounds/combo.wav'
import bigCombo from '../assets/sounds/bigCombo.wav'
import success from '../assets/sounds/success.wav'

export type SoundCue = 'tap' | 'mistake' | 'select' | 'combo' | 'bigCombo' | 'success'
type SoundSettings = { enabled: boolean; toggle: () => void; play: (cue: SoundCue) => void }
const SoundContext = createContext<SoundSettings | null>(null)
const files: Record<SoundCue, string> = { tap, mistake, select, combo, bigCombo, success }
const volumes: Record<SoundCue, number> = { tap: .24, mistake: .28, select: .28, combo: .36, bigCombo: .38, success: .4 }
const players = new Map<SoundCue, Howl>()
let lastTap = 0
function playCue(cue: SoundCue) {
  if (cue === 'tap') { const now = Date.now(); if (now - lastTap < 90) return; lastTap = now }
  try {
    let player = players.get(cue)
    if (!player) { player = new Howl({ src: [files[cue]], volume: volumes[cue], preload: true }); players.set(cue, player) }
    const id = player.play()
    if (cue === 'tap') player.rate(.97 + (lastTap % 7) * .01, id)
  } catch { /* Sound should never interrupt a lesson. */ }
}
function initialSound() { try { return localStorage.getItem('rugo-sound-enabled') !== 'false' } catch { return true } }
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(initialSound)
  const play = useCallback((cue: SoundCue) => { if (enabled) playCue(cue) }, [enabled])
  const toggle = useCallback(() => {
    const next = !enabled
    try { localStorage.setItem('rugo-sound-enabled', String(next)) } catch { /* Keep the in-memory preference. */ }
    setEnabled(next)
    if (!next) players.forEach(player => player.stop())
    else playCue('select')
  }, [enabled])
  return <SoundContext.Provider value={{ enabled, toggle, play }}>{children}</SoundContext.Provider>
}
export function useSound() {
  const sound = useContext(SoundContext)
  if (!sound) throw new Error('useSound requires SoundProvider')
  return sound
}


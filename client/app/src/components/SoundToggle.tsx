import { useSound } from '../sound/SoundProvider'
import './SoundToggle.css'
export function SoundToggle({ compact = false }: { compact?: boolean }) {
  const { enabled, toggle } = useSound()
  return <button type="button" className={`sound-toggle ${compact ? 'sound-toggle-compact' : ''}`} onClick={toggle} aria-label={enabled ? 'Mute sound effects' : 'Enable sound effects'} aria-pressed={enabled} title={enabled ? 'Mute sound effects' : 'Enable sound effects'}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/>{enabled ? <><path d="M16 9a4 4 0 0 1 0 6"/><path d="M19 6a8 8 0 0 1 0 12"/></> : <path d="m17 9 4 6m0-6-4 6"/>}</svg>
    {!compact && <span>Sound {enabled ? 'on' : 'off'}</span>}
  </button>
}

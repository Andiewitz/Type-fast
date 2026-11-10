import { useEffect, useState } from 'react'
import { RuntimeLoader, useRive } from '@rive-app/react-canvas'
import wasmUrl from '@rive-app/canvas/rive.wasm?url'
import characterUrl from '../assets/rugo-character.riv?url'
import fallbackUrl from '../assets/rugo-character-concept.png'
import './RiveMascot.css'

// Bundle the runtime with the app instead of requiring a third-party CDN.
RuntimeLoader.setWasmUrl(wasmUrl)
RuntimeLoader.setWasmFallbackUrl(null)

function AnimatedCharacter() {
  const [failed, setFailed] = useState(false)
  const { RiveComponent } = useRive({
    src: characterUrl,
    stateMachine: 'Rugo Motion',
    autoplay: true,
    onLoadError: () => setFailed(true),
  })
  return failed ? <img className="rugo-rive-image" src={fallbackUrl} alt="" /> : <RiveComponent className="rugo-rive-canvas" />
}

export function RiveMascot() {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return <div className="mascot rugo-rive" aria-hidden="true">{reducedMotion ? <img className="rugo-rive-image" src={fallbackUrl} alt="" /> : <AnimatedCharacter />}</div>
}

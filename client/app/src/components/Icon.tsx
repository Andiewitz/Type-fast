import type { ReactNode } from 'react'

type IconName = 'home' | 'keyboard' | 'trophy' | 'target' | 'user' | 'check' | 'lock' | 'star' | 'fire' | 'bolt' | 'shield'
const paths: Record<IconName, ReactNode> = {
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  keyboard: <><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></>,
  trophy: <><path d="M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8M10 18h4"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
  check: <path d="M5 12.5l4.5 4.5L19 7"/>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  star: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/>,
  fire: <path d="M12 2.5c1 3.6 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.1 1-3.4 2.2-4.4 0 1.7 1 2.8 2.1 2.8C10.6 8.6 10.6 5.2 12 2.5z"/>,
  bolt: <path d="M13.5 2L4.5 13.5h6L9.5 22l9-11.5h-6L13.5 2z"/>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M12 8l1.2 2.5 2.8.3-2 1.9.5 2.8L12 14.2 9.5 15.5l.5-2.8-2-1.9 2.8-.3L12 8z" fill="white" stroke="none"/></>,
}
export function Icon({name, size = 24, className = ''}: {name: IconName; size?: number; className?: string}) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

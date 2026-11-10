export type RugoMood = 'idle' | 'happy' | 'curious' | 'thinking' | 'surprised' | 'proud' | 'celebrate' | 'encourage'

export const greetingExpressions: ReadonlyArray<{ mood: RugoMood; message: string }> = [
  { mood: 'idle', message: 'Tap Rugo for a reaction' },
  { mood: 'happy', message: 'Rugo says hi!' },
  { mood: 'curious', message: 'What are we learning?' },
  { mood: 'thinking', message: 'Hmm, let me think…' },
  { mood: 'surprised', message: 'Oh! You found me!' },
  { mood: 'proud', message: 'We make a great team!' },
  { mood: 'celebrate', message: 'Let’s celebrate!' },
]

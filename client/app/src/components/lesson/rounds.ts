import type { lessons } from '../../curriculum'

export const ROUNDS_PER_LEVEL = 10
export type CourseLesson = (typeof lessons)[number]

function shuffled<T>(values: T[], random: () => number): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const punctuationEndings = ['Hi, friend.', 'Yes, please.', 'Go, Rugo.', 'Well, hello.', 'Yes, I can.', 'No, thank you.', 'Red, then blue.', 'Here, look.', 'One, then two.', 'See you, friend.']
const questionEndings = ['Ready? Yes!', 'Where? Here!', 'Can I? Yes!', 'Go? Go!', 'Who? Rugo!', 'Again? Sure!', 'Is it fun? Yes!', 'Why? Just because!', 'Now? Now!', 'All set? Yes!']
const sentenceEndings = ['Take your time.', 'Nice work!', 'Keep going.', 'You can do it!', 'What a day!', 'That was fun.', 'Here we go!', 'See you soon.', 'Good job!', 'Let us begin.']

function variation(lesson: CourseLesson, variant: number, random: () => number): string {
  const text = lesson.text
  const chapter = lesson.chapterIndex
  if (chapter <= 3) return shuffled(text.split(' '), random).join(' ')
  if (chapter === 4) return `${text} ${(lesson.levelIndex === 1 || lesson.levelIndex === 3 ? questionEndings : punctuationEndings)[variant]}`
  if (chapter === 8) return /\d/.test(text) ? text.replace(/\d/g, digit => String((Number(digit) + variant) % 10)) : shuffled(text.split(' '), random).join(' ')
  if (chapter === 5) return `${text} ${sentenceEndings[variant]}`
  if (chapter === 6) return text.replace(/\d/g, digit => String((Number(digit) + variant) % 10))
  if (chapter === 7) return text.replace(/\n/, ` ${variant + 1}\n`)
  if (chapter >= 9 && (chapter <= 11 || /\b(?:String|int|if)\b/.test(text))) {
    const match = text.match(/\b(?:score|scores|name|wave|add|Rugo|ready|total|first|doubleIt|Pet|pet)\b/)
    return match ? text.replaceAll(match[0], `${match[0]}${variant}`) : text
  }
  if (text.includes('\n')) return text.replace(/\n/, ` ${variant + 1}\n`)
  return `${text} ${sentenceEndings[variant]}`
}

/** Randomize once per attempt; prompts stay stable while a round is being typed. */
export function createRounds(lesson: CourseLesson, random: () => number = Math.random): string[] {
  const variants = shuffled(Array.from({ length: ROUNDS_PER_LEVEL }, (_, i) => i), random)
  const rounds: string[] = []
  for (const variant of variants) {
    let candidate = variation(lesson, variant, random)
    for (let tries = 0; rounds.includes(candidate) && tries < 100; tries++) candidate = variation(lesson, variant, random)
    rounds.push(candidate)
  }
  return rounds
}


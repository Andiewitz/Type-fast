import type { lessons } from '../../curriculum'
import { letterBanks } from './content/letters.ts'
import { languageBanks } from './content/language.ts'
import { javaBanks } from './content/java.ts'

export const ROUNDS_PER_LEVEL = 10
export type CourseLesson = (typeof lessons)[number]

/** Each level has its own authored examples; combinations add variety on replay. */
export const roundBanks = [...letterBanks, ...languageBanks, ...javaBanks]

const leftHome = ['asd','sdf','dfg','gfd','fds','dsa','aga','sds','dfd','faf','gag','ads','sag','fad','dad','gas']
const rightHome = ['hjk','jkl','klh','lhj','jhk','khj','lkh','hjj','jkk','kll','hhj','jkj','klk','hlh','lkl']
const leftReach = ['qaz','wsx','edc','rfv','tgb','qwe','wer','ert','zxc','xcv','cvb','vbf','qas','wed','sxd']
const rightReach = ['yhn','ujm','ikm','olp','yui','uio','iop','jui','klm','hnm','poi','mju','iko','lpo']
const leftWords = ['after','grass','fast','craft','great','free','tree','seed','rest','trade','read','care','safe','face','fade','grade','react','trace','crate','treat','rare','deer','feed','red','wet','tax','wax','vex','dress','street','draft']
const rightWords = ['jump','join','look','moon','pony','hill','jolly','milk','only','noon','pool','lily','pink','pupil','union','hull','hoop','kiln','yolk','polo','loop','lion','lump']

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function handPractice(lesson: CourseLesson, random: () => number): string | undefined {
  if (lesson.chapterIndex > 1) return undefined
  const right = lesson.chapterIndex === 1
  const choices = lesson.levelIndex === 1 ? (right ? rightReach : leftReach)
    : lesson.levelIndex === 2 || lesson.levelIndex === 4 ? (right ? rightWords : leftWords)
    : (right ? rightHome : leftHome)
  return shuffled(choices, random).slice(0, 4).join(' ')
}

/** Select genuinely different authored examples once per attempt, with fresh skill-specific practice. */
export function createRounds(lesson: CourseLesson, random: () => number = Math.random): string[] {
  const bank = roundBanks[lesson.chapterIndex]?.[lesson.levelIndex]
  if (!bank || new Set(bank).size < ROUNDS_PER_LEVEL) throw new Error(`Missing round content for ${lesson.name}`)
  const selected = shuffled([...new Set(bank)], random).slice(0, ROUNDS_PER_LEVEL)
  return selected.map((base, index) => {
    const parts = [base]
    const practice = handPractice(lesson, random)
    if (practice) parts.push(practice)
    let text = parts.join(' ')
    // Short examples are paired with other complete examples, never with scrambled sentence fragments.
    for (let offset = 1; text.length < 28 && offset < selected.length; offset++) {
      parts.push(selected[(index + offset) % selected.length])
      text = parts.join(parts.some(part => part.includes('\n')) ? '\n' : ' ')
    }
    if (!practice && text.length < 55 && random() < 0.5) {
      const extra = selected[(index + 5) % selected.length]
      const combined = `${text}${text.includes('\n') || extra.includes('\n') ? '\n' : ' '}${extra}`
      if (combined.length <= 85) text = combined
    }
    return text
  })
}

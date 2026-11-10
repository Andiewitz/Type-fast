import { sanitizeStars } from './components/lesson/savedStars'
import { resetDailyTotals } from './dailyProgress'
export type Page = 'Learn' | 'Practice' | 'Leagues' | 'Quests' | 'Profile'
export type Progress = { completed: number; stars: number[]; xp: number; bestWpm: number; lessons: number; seconds: number; dates: string[]; today: string; todayLessons: number; todaySeconds: number; todayBest: number }
export const lessons = [
  {name:'F and J', minWpm:15, text:'fff jjj fjf jfj fj fj jf fj'},
  {name:'D and K', minWpm:15, text:'ddd kkk dkd kdk fj dk fd jk'},
  {name:'S and L', minWpm:15, text:'sss lll sls lsl sad fall flask'},
  {name:'A and ;', minWpm:15, text:'aaa ;;; asdf jkl; fall ask dad'},
  {name:'G and H', minWpm:15, text:'ggg hhh ghg hgh has had glad'},
  {name:'Speed check', minWpm:30, text:'a glad lad has a flask and a salad'}
]
export const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
export function initialProgress(): Progress { return {completed:0,stars:[],xp:0,bestWpm:0,lessons:0,seconds:0,dates:[],today:todayKey(),todayLessons:0,todaySeconds:0,todayBest:0} }
export function readProgress(): Progress { try { const value = JSON.parse(localStorage.getItem('rugo-progress') || 'null'); if (!value || typeof value.completed !== 'number' || !Array.isArray(value.dates)) return initialProgress(); const merged = {...initialProgress(), ...value, stars: sanitizeStars(value.stars, lessons.length)}; return resetDailyTotals(merged, todayKey()) } catch { return initialProgress() } }
export function streak(dates: string[]) { let count=0; const d=new Date(); if(!dates.includes(todayKey())) d.setDate(d.getDate()-1); while(true) { const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; if(!dates.includes(key)) break; count++; d.setDate(d.getDate()-1) } return count }

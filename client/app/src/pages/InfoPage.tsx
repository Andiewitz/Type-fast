import type { Page, Progress } from '../progress'
export function InfoPage({page,progress,start}: {page:Exclude<Page,'Learn'>;progress:Progress;start:()=>void}) {
 const content = {
 Practice: {title:'Practice', text:'Warm up with a home row typing exercise. Complete it to earn XP and track your speed.'},
 Leagues: {title:'Leagues', text:'Leagues will bring friendly competition to Rugo. Online leaderboards are not connected yet.'},
 Quests: {title:'Daily quests', text:`Today you have finished ${progress.todayLessons} lesson${progress.todayLessons===1?'':'s'} and reached ${progress.todayBest} WPM. Your daily goals are shown alongside your learning path.`},
 Profile: {title:'Your profile', text:`You have completed ${progress.lessons} lessons, earned ${progress.xp} XP, and reached a best speed of ${progress.bestWpm} WPM. Your progress is saved on this device.`},
 }[page]
 return <main className="activity"><section className="activity-card info-card"><h1>{content.title}</h1><p>{content.text}</p>{(page==='Practice'||page==='Quests') && <button className="primary-button" type="button" onClick={start}>Start practice</button>}</section></main>
}

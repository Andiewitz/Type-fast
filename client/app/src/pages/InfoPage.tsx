import type { Page, Progress } from '../progress'
export function InfoPage({page,progress,start}: {page:Exclude<Page,'Learn'>;progress:Progress;start:()=>void}) {
 const content = {
 Practice: {title:'Practice', text:'Warm up with a home row typing exercise. Complete it to earn XP and track your speed.'},
 Leagues: {title:'Leagues', text:'Leagues will bring friendly competition to Rugo. Online leaderboards are not connected yet.'},
 Quests: {title:'Daily quests', text:`Today you have finished ${progress.todayLessons} lesson${progress.todayLessons===1?'':'s'} and reached ${progress.todayBest} WPM. Your daily goals are shown alongside your learning path.`},
 Profile: {title:'Your profile', text:`You have completed ${progress.lessons} lessons, earned ${progress.xp} XP, and reached a best speed of ${progress.bestWpm} WPM. Your progress is saved on this device.`},
 }[page]
 return <main className="activity"><section className="activity-card info-card"><h1>{content.title}</h1><p>{content.text}</p>{page==='Profile' && progress.legacyCourse && <p>Previous course: {progress.legacyCourse.completed} of 6 levels completed.{progress.legacyCourse.stars.some(Boolean) && ` Best stars: ${progress.legacyCourse.stars.map((stars, index) => stars ? `level ${index + 1}: ${stars}` : null).filter(Boolean).join(', ')}.`}</p>}{page==='Profile' && progress.previousCourse && <details className="previous-course"><summary>Previous chapter course: {progress.previousCourse.completed} of 39 levels completed</summary><p>{progress.previousCourse.stars.some(Boolean) ? progress.previousCourse.stars.map((stars, index) => stars ? `Level ${index + 1}: ${stars} star${stars === 1 ? '' : 's'}` : null).filter(Boolean).join(' · ') : 'No star ratings were recorded.'}</p></details>}{(page==='Practice'||page==='Quests') && <button className="primary-button" type="button" onClick={start}>Start practice</button>}</section></main>
}

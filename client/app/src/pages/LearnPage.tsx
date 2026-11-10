import { useCallback, useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { LearningPath } from '../components/LearningPath'
import { ProgressPanel } from '../components/ProgressPanel'
import { Lesson } from '../components/Lesson'
import { LessonLoading } from '../components/LessonLoading'
import { InfoPage } from './InfoPage'
import { lessons, readProgress, todayKey, type Page } from '../progress'
import { useSound } from '../sound/SoundProvider'
import { recordBestStars, starsFor } from '../components/lesson/stars'
export function LearnPage() {
 const { play } = useSound()
 const [page,setPage]=useState<Page>('Learn'); const [lesson,setLesson]=useState<number|null>(null); const [loadingLesson,setLoadingLesson]=useState<number|null>(null); const [progress,setProgress]=useState(readProgress)
 useEffect(()=>{localStorage.setItem('rugo-progress',JSON.stringify(progress))},[progress])
 function navigate(next:Page){setLoadingLesson(null);setLesson(null);setPage(next);window.scrollTo(0,0)}
 const openLesson = useCallback((index:number) => { setLoadingLesson(null); setLesson(index) }, [])
 function startLesson(index:number){play('select');setLesson(null);setLoadingLesson(index);window.scrollTo(0,0)}
 function finish(index:number,seconds:number,wpm:number,accuracy:number){setProgress(old=>{const today=todayKey(); const same=old.today===today; return {...old,completed:Math.max(old.completed,index+1),stars:recordBestStars(old.stars,index,starsFor(true,accuracy)),xp:old.xp+(index >= old.completed ? 20 : 0),bestWpm:Math.max(old.bestWpm,wpm),lessons:old.lessons+1,seconds:old.seconds+seconds,dates:old.dates.includes(today)?old.dates:[...old.dates,today],today,todayLessons:(same?old.todayLessons:0)+1,todaySeconds:(same?old.todaySeconds:0)+seconds,todayBest:Math.max(same?old.todayBest:0,wpm)}})}
 if (loadingLesson !== null) return <LessonLoading key={loadingLesson} index={loadingLesson} onReady={openLesson}/>
 if (lesson !== null) return <div className="lesson-focused"><Lesson key={lesson} showIntro={lesson === 0 && progress.completed === 0} isFirstClear={lesson >= progress.completed} onNext={lesson < lessons.length - 1 ? () => startLesson(lesson + 1) : undefined} index={lesson} bestWpm={progress.bestWpm} onClose={()=>{setLesson(null);setPage('Learn')}} onFinish={finish}/></div>
 return <div className="app-shell"><Sidebar page={page} navigate={navigate}/>{page==='Learn' ? <LearningPath stars={progress.stars} completed={progress.completed} start={startLesson}/> : <InfoPage page={page} progress={progress} start={()=>startLesson(0)}/>}<ProgressPanel progress={progress} navigate={navigate}/></div>
}


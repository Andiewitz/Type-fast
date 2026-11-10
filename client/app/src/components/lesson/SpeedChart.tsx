import type { SpeedSample } from './useTypingLesson'
export function SpeedChart({ samples, goal }: { samples: SpeedSample[]; goal?: number }) {
  if (samples.length < 2) return <div className="speed-empty">Complete a longer exercise to see how your speed changes.</div>
  const maxY = Math.max(10, goal || 0, ...samples.map(sample => sample.wpm)) * 1.15
  const end = Math.max(samples[samples.length - 1].seconds, 1)
  const x = (seconds: number) => 20 + seconds / end * 560
  const y = (wpm: number) => 150 - wpm / maxY * 125
  const points = samples.map(sample => `${x(sample.seconds)},${y(sample.wpm)}`).join(' ')
  const area = `M ${x(samples[0].seconds)} 150 L ${points.replaceAll(' ', ' L ')} L ${x(samples[samples.length-1].seconds)} 150 Z`
  return <><svg className="speed-chart" viewBox="0 0 600 170" role="img" aria-label={`Speed over the lesson, from ${samples[0].wpm} to ${samples[samples.length - 1].wpm} words per minute`}><path d={area} fill="#ede9ff"/>{goal && <><line x1="20" x2="580" y1={y(goal)} y2={y(goal)} stroke="#1fa86e" strokeWidth="3" strokeDasharray="8 7"/><text x="20" y={Math.max(12,y(goal)-8)} className="speed-goal">Goal {goal}</text></>}<polyline points={points} fill="none" stroke="#6c4dff" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>{samples.map((sample,i)=><circle key={i} cx={x(sample.seconds)} cy={y(sample.wpm)} r="5.5" fill="#fff" stroke="#6c4dff" strokeWidth="4"/>)}</svg><div className="speed-axis"><span>{Math.round(samples[0].seconds)}s</span><span>{Math.round(end)}s</span></div></>
}

import { Icon } from './Icon'
import { Mascot } from './Mascot'
import type { Page } from '../progress'
const items = [{label:'Learn', icon:'home'}, {label:'Practice', icon:'keyboard'}, {label:'Leagues', icon:'trophy'}, {label:'Quests', icon:'target'}, {label:'Profile', icon:'user'}] as const
export function Sidebar({page, navigate}: {page: Page; navigate: (page: Page) => void}) {
 return <aside className="sidebar"><div className="brand"><Mascot small/><span>Rugo</span></div><nav aria-label="Main navigation">{items.map(({label, icon}) => <button key={label} type="button" className={`nav-item ${page === label ? 'active' : ''}`} aria-current={page === label ? 'page' : undefined} onClick={() => navigate(label)}><Icon name={icon} size={26}/><span>{label}</span></button>)}</nav><div className="layout"><span>Layout</span><strong>QWERTY</strong></div></aside>
}

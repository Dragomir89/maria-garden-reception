'use client';
import {useEffect,useState} from 'react';
import {ChevronLeft,ChevronRight,RefreshCw,Check} from 'lucide-react';
import {day,iso,type Reservation} from '@/lib/reception';
import {sofiaToday} from '@/lib/daily-program';
import {calendarRequest} from '@/lib/calendar-client';
import {housekeepingProgram,type HousekeepingTask} from '@/lib/housekeeping';
type Props={reservations:Reservation[];date:string;onDate:(date:string)=>void;loading:boolean;busy:boolean;onRefresh:()=>void;onComplete:(task:HousekeepingTask,done:boolean)=>void};
export function Housekeeping({reservations,date,onDate,loading,busy,onRefresh,onComplete}:Props){
 const [archive,setArchive]=useState<{reservations:Reservation[];available:boolean;asOf:string}|null>(null),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
 const today=sofiaToday(),past=date<today,readOnly=date!==today;
 useEffect(()=>{if(!past)return;let active=true;setArchive(null);setError('');calendarRequest<{reservations:Reservation[];available:boolean;asOf:string}>(undefined,'?asOf='+date).then(r=>{if(active)setArchive(r);}).catch(e=>{if(active)setError((e as Error).message);});return()=>{active=false;};},[past,date,refresh]);
 const ready=archive?.asOf===date;
 const tasks=housekeepingProgram(past?(ready?archive.reservations:[]):reservations,date);
 const groups=[{kind:'departure',title:'Основно почистване',note:'След напускане · включва смяна на бельото',tone:'departures'},{kind:'daily',title:'Ежедневно почистване',note:'Стаи с оставащи гости',tone:'staying'},{kind:'linen',title:'Смяна на чаршафи',note:'След всеки 3 нощувки',tone:'arrivals'}] as const;
 const unavailable=past&&(!!error||(ready&&!archive.available));
 return <section className="daily-program housekeeping">
  <div className="daily-toolbar"><div className="daily-date"><button className="icon-button" aria-label="Предишен ден" onClick={()=>onDate(iso(day(date)-1))}><ChevronLeft size={20}/></button><label>Дата<input type="date" value={date} onChange={e=>e.target.value&&onDate(e.target.value)}/></label><button className="icon-button" aria-label="Следващ ден" onClick={()=>onDate(iso(day(date)+1))}><ChevronRight size={20}/></button><button className="secondary" onClick={()=>onDate(today)}>Днес</button></div><button className="secondary" disabled={busy||loading} onClick={()=>{onRefresh();setRefresh(n=>n+1);}}><RefreshCw size={16}/> Обнови</button></div>
  <p className="daily-date-label">{new Date(date+'T12:00:00').toLocaleDateString('bg-BG',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
  {readOnly&&<p className="history-notice">{past?'История — само за преглед.':'План за бъдещ ден — отбелязването е достъпно в самия ден.'}</p>}
  {error&&<p role="alert" className="error-banner">{error}</p>}
  {loading||(past&&!ready&&!error)?<p role="status" className="empty">Зареждане…</p>:unavailable?<p className="empty">{error?'Не успяхме да заредим историята. Натисни „Обнови“.':'За тази дата няма запазена история.'}</p>:<div className="housekeeping-groups">{groups.map(group=>{const list=tasks.filter(t=>t.kind===group.kind);return <section key={group.kind} className={'housekeeping-group daily-tone-'+group.tone}><div className="section-heading"><h2>{group.title}</h2><span>{list.filter(t=>!t.done).length} оставащи</span></div><p className="muted">{group.note}</p>{!list.length?<p className="housekeeping-empty">Няма стаи.</p>:<div className="housekeeping-rooms">{list.map(task=><div key={task.id} className={'housekeeping-room '+(task.done?'is-done':'')}><div><strong>Стая {task.room}</strong><span>{Math.floor(task.room/100)} етаж</span>{task.priority&&<span className="task-badge pending">Приоритет · пристигане днес</span>}{!task.done&&task.due<date&&<span className="task-badge pending">Просрочено</span>}{!task.done&&task.waiting&&<span>Очаква напускане</span>}</div><button type="button" className={task.done?'secondary':'primary'} aria-pressed={task.done} aria-label={`${task.done?'Отмени отметката':'Отбележи като готово'}: ${group.title}, стая ${task.room}`} disabled={busy||readOnly} onClick={()=>onComplete(task,!task.done)}>{task.done?<><Check size={18}/> Готово</>:'Готово'}</button></div>)}</div>}</section>;})}</div>}
 </section>;
}

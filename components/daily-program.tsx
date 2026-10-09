'use client';
import { useEffect, useState, type ReactNode } from 'react';
import {calendarRequest} from '@/lib/calendar-client';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { dailyProgram, sofiaToday } from '@/lib/daily-program';
import {details,payment,money} from '@/lib/reception-details';
import {readyLabels} from './reception-fields';
import { day, iso, type Reservation } from '@/lib/reception';

export type Props = { reservations: Reservation[]; date: string; onDate: (date: string) => void; loading: boolean; busy: boolean; onRefresh: () => void; onSelect: (r: Reservation) => void; readOnly?:boolean; notice?:ReactNode; unavailable?:boolean };
export function DailyProgram({reservations, date, onDate, loading, busy, onRefresh, onSelect, readOnly=false, notice, unavailable=false}: Props) {
  const program = dailyProgram(reservations, date);
  const label = new Date(date + 'T12:00:00').toLocaleDateString('bg-BG', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  const groups = [{ tone:'departures', title:'Напускащи', list:program.departures, empty:'Няма напускания за тази дата.' }, { tone:'arrivals', title:'Пристигащи', list:program.arrivals, empty:'Няма пристигания за тази дата.' }, { tone:'staying', title:'Оставащи гости', list:program.staying, empty:'Няма продължаващи престои за тази дата.' }];
  return <section className="daily-program">
    <div className="daily-toolbar"><div className="daily-date"><button className="icon-button" aria-label="Предишен ден" onClick={()=>onDate(iso(day(date)-1))}><ChevronLeft size={20}/></button><label>Дата<input type="date" value={date} onChange={e=>e.target.value&&onDate(e.target.value)}/></label><button className="icon-button" aria-label="Следващ ден" onClick={()=>onDate(iso(day(date)+1))}><ChevronRight size={20}/></button><button className="secondary" onClick={()=>onDate(sofiaToday())}>Днес</button></div><button className="secondary" onClick={onRefresh} disabled={loading||busy}><RefreshCw size={16}/> Обнови</button></div>
    <p className="daily-date-label">{label}</p>
    {notice}
    {loading?<div className="empty" role="status">Зареждане на дневната програма…</div>:unavailable?null:<>
      <div className="daily-stats">{groups.map(g=><div className={'daily-tone-'+g.tone} key={g.title}><span>{g.title}</span><strong>{g.list.length}</strong><span>{g.list.reduce((sum,r)=>sum+r.adults+r.children,0)} гости</span></div>)}<div><span>Смяна на гости в стая</span><strong>{program.turnovers.length}</strong><span>Напускане и пристигане днес</span></div></div>
      <section className="daily-turnovers"><h2>Почистване преди ново настаняване</h2>{program.turnovers.length?<div className="turnover-list">{program.turnovers.map(t=><div className={details(t.arrival).roomReady==='ready'?'turnover-ready':'turnover-dirty'} key={t.room}><strong className="room-chip">Стая {t.room}</strong><span>Напускат: {t.departure.name}<br/>Пристигат: {t.arrival.name}</span><strong>{readyLabels[details(t.arrival).roomReady]}</strong>{!readOnly&&<button className="secondary" onClick={()=>onSelect(t.arrival)}>Обнови</button>}</div>)}</div>:<p className="muted">Няма стаи с напускане и пристигане в един ден.</p>}<p className="muted daily-note">Списъкът е по датите на резервациите. Чистотата и действителното напускане се отбелязват от рецепциониста.</p></section>
      {groups.map(g=><section className={'booking-list daily-list daily-tone-'+g.tone} key={g.title}><div className="section-heading"><h2>{g.title}</h2><span>{g.list.length} резервации</span></div>{!g.list.length?<p className="muted">{g.empty}</p>:<div className="table-scroll"><table><thead><tr><th>Стая</th><th>Гост / телефон</th><th>Гости</th><th>Престой</th><th>Стая / престой</th><th>Цена / плащане</th><th>Данни / регистрация</th><th/></tr></thead><tbody>{g.list.map(r=><tr key={r.id}><td><span className="room-chip">{r.room}</span><small>{Math.floor(r.room/100)} етаж</small></td><td><strong>{r.name}</strong><small>{r.phone||'Без телефон'}</small></td><td>{r.adults} възр.{r.children?` + ${r.children} деца`:''}{r.ages&&<small>Възраст: {r.ages}</small>}</td><td>{new Date(r.start+'T12:00:00').toLocaleDateString('bg-BG')} – {new Date(r.end+'T12:00:00').toLocaleDateString('bg-BG')}<small>{day(r.end)-day(r.start)} нощувки</small></td><td className="daily-notes"><span className={'task-badge '+(details(r).roomReady==='ready'?'done':'pending')}>{readyLabels[details(r).roomReady]}</span><small>{details(r).departed?'Напуснали':r.status==='arrived'?'Настанени':'Резервирано'}</small>{r.notes&&<small>{r.notes}</small>}</td><td className="daily-notes">{details(r).source==='booking'?<span className="task-badge done">Платено чрез Booking</span>:<><strong>{payment(r).balance===null?'Цена не е въведена':payment(r).balance!<0?`Надплатено: ${money(-payment(r).balance!)}`:payment(r).balance===0?'Платено':`Остава: ${money(payment(r).balance)}`}</strong><small>На нощувка: {money(details(r).nightlyRate)}</small><small>Общо: {money(payment(r).total)}</small><small>Капаро: {money(details(r).deposit)}</small><small>В брой: {money(details(r).paidCash)} · С карта: {money(details(r).paidCard)}</small></>}</td><td><span className={'task-badge '+(details(r).dataTaken?'done':'pending')}>Данни: {details(r).dataTaken?'взети':'не са взети'}</span><br/><span className={'task-badge '+(details(r).registered?'done':'pending')}>Регистрация: {details(r).registered?'да':'не'}</span></td><td>{!readOnly&&<button className="secondary" onClick={()=>onSelect(r)}>Обнови</button>}</td></tr>)}</tbody></table></div>}</section>)}
    </>}
  </section>;
}


type HistoryState = {reservations:Reservation[];available:boolean;snapshotAt:string|null;historySince:string|null;asOf:string};
export function DailyProgramWithHistory(props:Props) {
 const [mode,setMode]=useState<'current'|'history'>(props.date<sofiaToday()?'history':'current');
 const [archive,setArchive]=useState<HistoryState|null>(null),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
 const historical=mode==='history';
 useEffect(()=>{
  if(!historical)return;
  let active=true;setArchive(null);setError('');
  calendarRequest<HistoryState>(undefined,'?asOf='+encodeURIComponent(props.date)).then(data=>{if(active)setArchive(data);}).catch(e=>{if(active)setError((e as Error).message);});
  return()=>{active=false;};
 },[historical,props.date,refresh]);
 const ready=archive?.asOf===props.date;
 const format=(s:string)=>new Date(s).toLocaleString('bg-BG',{timeZone:'Europe/Sofia'});
 const notice=<div className="history-controls"><div className="floor-tabs" aria-label="Изглед на програмата"><button className={!historical?'active':''} onClick={()=>setMode('current')}>Текущи данни</button><button className={historical?'active':''} onClick={()=>setMode('history')} disabled={props.date>sofiaToday()}>История</button></div>{historical&&<div role="status" className="history-notice">{error?<><p>{error}</p><button className="secondary" onClick={()=>setRefresh(n=>n+1)}>Опитай отново</button></>:ready?(archive.available?<><strong>Исторически преглед — само за четене</strong><p>{props.date===sofiaToday()?'Последно запазено състояние за днес.':'Състояние към края на избрания ден.'} Последен запис: {format(archive.snapshotAt!)}.</p></>:<><strong>За тази дата няма запазена история.</strong><p>{archive.historySince?`Историята започва от ${format(archive.historySince)}.`:'Историята все още няма записи.'} Можеш да разгледаш „Текущи данни“.</p></>):<p>Зареждаме запазената история…</p>}</div>}</div>;
 return <DailyProgram {...props} reservations={historical?(ready?archive.reservations:[]):props.reservations} loading={historical?!ready&&!error:props.loading} unavailable={historical&&(!!error||(!!ready&&!archive.available))} readOnly={historical} notice={notice} onDate={date=>{props.onDate(date);setMode(date<sofiaToday()?'history':'current');}} onRefresh={()=>{props.onRefresh();setRefresh(n=>n+1);}}/>;
}

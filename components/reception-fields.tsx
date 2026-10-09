'use client';
import {details, payment, money, type ReceptionDetails} from '@/lib/reception-details';
import type {Reservation} from '@/lib/reception';
export const readyLabels = {needsCleaning:'Мръсна — за почистване',ready:'Чиста'};
export function ReceptionFields({reservation,onChange}: {reservation:Reservation;onChange:(d:ReceptionDetails)=>void}) {
 const d=details(reservation), amounts=payment(reservation);
 const update=(key:keyof ReceptionDetails,value:unknown)=>onChange({...d,[key]:value});
 const amount=(key:'nightlyRate'|'totalOverride'|'deposit'|'paidCash'|'paidCard',label:string,optional=false)=><label key={key}>{label}<input type="number" min="0" max="1000000" step="0.01" value={d[key]??''} onChange={e=>update(key,e.target.value===''?(optional?null:0):Number(e.target.value))}/></label>;
 return <div className="form-grid reception-fields"><h3 className="wide">Рецепция и плащане</h3><label className="wide">Резервацията е от<select value={d.source} onChange={e=>update('source',e.target.value)}><option value="direct">Директна резервация</option><option value="booking">Booking — платено чрез платформата</option></select></label>
 {d.source==='booking'?<div className="wide payment-summary paid">Платено чрез Booking — не се събира на рецепция.</div>:<>{amount('nightlyRate','Цена на нощувка (€)',true)}{amount('totalOverride','Уговорена обща сума (€) — по избор',true)}<p className="wide muted">Без уговорена обща сума: цена на нощувка × брой нощувки. При отстъпка въведи уговорената обща сума.</p>{amount('deposit','Получено капаро (€)')}{amount('paidCash','Получено на рецепция в брой (€)')}{amount('paidCard','Получено на рецепция с карта (€)')}<p className="wide muted">Сумите на рецепция са общо получените до момента, без капарото.</p><div className="wide payment-summary"><span>Обща сума: <strong>{money(amounts.total)}</strong></span><span>Получено с капарото: <strong>{money(amounts.received)}</strong></span><span>{amounts.balance!==null&&amounts.balance<0?'Надплатено':'Остава за плащане'}: <strong>{money(amounts.balance===null?null:Math.abs(amounts.balance))}</strong></span></div></>}
 <label className="wide">Подготовка на стаята<select value={d.roomReady} onChange={e=>update('roomReady',e.target.value)}>{Object.entries(readyLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
 <label className="checkbox"><input type="checkbox" checked={d.dataTaken} onChange={e=>update('dataTaken',e.target.checked)}/>Взети данни</label><label className="checkbox"><input type="checkbox" checked={d.registered} onChange={e=>update('registered',e.target.checked)}/>Регистриран</label><p className="wide muted">Отметките се попълват ръчно. „Регистриран“ отбелязва извършена регистрация във външната система.</p>
 </div>;
}

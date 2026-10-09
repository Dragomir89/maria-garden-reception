'use client';
import {useState} from 'react';
import {X} from 'lucide-react';
import type {Reservation} from '@/lib/reception';
import {details, type ReceptionDetails} from '@/lib/reception-details';
import {ReceptionFields} from './reception-fields';
export function ReceptionModal({reservation,onClose,onSave,busy,error}: {reservation:Reservation;onClose:()=>void;onSave:(d:ReceptionDetails,status:Reservation['status'])=>void;busy:boolean;error:string}) {
 const [draft,setDraft]=useState({...reservation,reception:details(reservation)});
 return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="reception-title"><div className="modal-heading"><h2 id="reception-title">{reservation.name} · {reservation.room}</h2><button aria-label="Затвори" disabled={busy} onClick={onClose}><X/></button></div><form onSubmit={e=>{e.preventDefault();onSave(draft.reception,draft.status);}}><ReceptionFields reservation={draft} onChange={reception=>setDraft({...draft,reception})}/><div className="form-grid reception-fields"><label>Настаняване<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as Reservation['status']})}><option value="booked">Очаква настаняване</option><option value="arrived">Настанени</option></select></label><label className="checkbox"><input type="checkbox" checked={draft.reception.departed} onChange={e=>setDraft({...draft,reception:{...draft.reception,departed:e.target.checked}})}/>Гостите са напуснали</label></div>{error&&<p className="inline-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary" disabled={busy} onClick={onClose}>Затвори</button><button className="primary" disabled={busy}>{busy?'Записваме…':'Запази'}</button></div></form></section></div>;
}

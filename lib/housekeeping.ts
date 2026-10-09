import {day, iso, rooms, type Reservation} from './reception';
import {details} from './reception-details';
export type HousekeepingKind = 'departure' | 'daily' | 'linen';
export type HousekeepingEvent = {kind:HousekeepingKind; date:string; completedOn:string; room:number};
export type HousekeepingTask = {id:string; reservationId:string; room:number; kind:HousekeepingKind; due:string; done:boolean; priority:boolean; waiting:boolean};
export function housekeepingProgram(reservations:Reservation[], date:string) {
 const tasks:HousekeepingTask[]=[];
 const eventFor=(r:Reservation,kind:HousekeepingKind,due:string)=>(r.housekeeping??[]).find(e=>e.kind===kind&&e.date===due&&e.room===r.room&&e.completedOn<=date);
 for(const room of rooms){
  const stays=reservations.filter(r=>r.room===room.number);
  // Keep unfinished checkout cleaning visible while the room is vacant.
  const departure=stays.filter(r=>r.end<=date).sort((a,b)=>b.end.localeCompare(a.end))[0];
  const occupied=stays.find(r=>r.start<date&&r.end>date);
  if(departure&&(!occupied||departure.end===date)){
   const done=!!eventFor(departure,'departure',departure.end);
   if(departure.end===date||!done)tasks.push({id:`departure:${departure.id}:${departure.end}`,reservationId:departure.id,room:room.number,kind:'departure',due:departure.end,done,priority:stays.some(r=>r.start===date),waiting:departure.end===date&&!details(departure).departed});
  }
  if(occupied&&!details(occupied).departed){
   tasks.push({id:`daily:${occupied.id}:${date}`,reservationId:occupied.id,room:room.number,kind:'daily',due:date,done:!!eventFor(occupied,'daily',date),priority:false,waiting:false});
   const changes=(occupied.housekeeping??[]).filter(e=>e.kind==='linen'&&e.room===occupied.room&&e.completedOn>=occupied.start&&e.completedOn<=date).sort((a,b)=>b.completedOn.localeCompare(a.completedOn));
   const today=changes.find(e=>e.completedOn===date);
   const due=today?.date??iso(day(changes[0]?.completedOn??occupied.start)+3);
   if(due<=date)tasks.push({id:`linen:${occupied.id}:${due}`,reservationId:occupied.id,room:room.number,kind:'linen',due,done:!!today,priority:false,waiting:false});
  }
 }
 return tasks.sort((a,b)=>Number(b.priority)-Number(a.priority)||a.room-b.room);
}

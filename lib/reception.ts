import {housekeepingProgram, type HousekeepingEvent, type HousekeepingKind} from './housekeeping';
import {sofiaToday} from './daily-program';
import {populateDemoMonth} from './demo-month';
import {details, validateDetails, type ReceptionDetails} from './reception-details';
export const rooms = [101,102,103,104,105,106,201,202,203,204,205,206,207,302,303,304,305].map(number=>({number,floor:Math.floor(number/100),capacity:[304,305].includes(number)?2:[201,204,205].includes(number)?4:3}));
export type Reservation = {id:string; name:string; phone:string; start:string; end:string; adults:number; children:number; ages:string; extraChild:boolean; floor:number; floorHard:boolean; preferredRoom:number; roomHard:boolean; room:number; status:'booked'|'arrived'; notes:string; demo?:boolean; reception?:ReceptionDetails; housekeeping?:HousekeepingEvent[]};
export type Operation = {kind:'add'|'edit'|'delete'|'optimize'|'demo'|'clearDemo'|'reception'|'demoMonth'|'housekeeping'; taskKind?:HousekeepingKind; taskDate?:string; date?:string; done?:boolean; details?:ReceptionDetails; status?:'booked'|'arrived'; reservation?:Reservation; id?:string; month?:string};
export const day=(s:string)=>Date.parse(s+'T00:00:00Z')/86400000;
export const iso=(d:number)=>new Date(d*86400000).toISOString().slice(0,10);
export const overlaps=(a:Reservation,b:Reservation)=>a.start<b.end&&b.start<a.end;
export function validate(r:Reservation){
 if(r.reception)validateDetails(r.reception);
 if(!r||typeof r.id!=='string'||!r.id||typeof r.name!=='string'||!r.name.trim())throw Error('Въведи име на госта.');
 for(const s of [r.start,r.end])if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(day(s))||iso(day(s))!==s)throw Error('Провери датите.');
 if(r.start>=r.end||day(r.end)-day(r.start)>366)throw Error('Напускането трябва да е след пристигането, до 366 нощувки.');
 if(!Number.isInteger(r.adults)||r.adults<1||r.adults>4||!Number.isInteger(r.children)||r.children<0||r.children>4)throw Error('Провери броя гости.');
 if(r.extraChild&&r.children<1)throw Error('Изключението е само за резервация с дете.');
 if(![0,1,2,3].includes(r.floor)||![0,...rooms.map(x=>x.number)].includes(r.preferredRoom))throw Error('Невалидна стая или етаж.');
 if(!['booked','arrived'].includes(r.status))throw Error('Невалиден статус.');
}
export function allowed(r:Reservation){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Sofia',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return rooms.filter(x=>x.capacity>=r.adults+r.children-(r.extraChild?1:0)&&(!r.floorHard||!r.floor||x.floor===r.floor)&&(!r.roomHard||!r.preferredRoom||x.number===r.preferredRoom)&& ((r.status!=='arrived'&&r.end>today)||!r.room||x.number===r.room));}
export function validState(rs:Reservation[]){for(const r of rs){validate(r);if(!allowed(r).some(x=>x.number===r.room))throw Error('Стая '+r.room+' не отговаря на условията за '+r.name);if(rs.some(b=>b.id!==r.id&&b.room===r.room&&overlaps(r,b)))throw Error('Застъпване в стая '+r.room);}if(new Set(rs.map(r=>r.id)).size!==rs.length)throw Error('Дублирана резервация.');}
function bounds(rs:Reservation[]){const starts=rs.map(r=>day(r.start)),ends=rs.map(r=>day(r.end));const a=Math.min(...starts),b=Math.max(...ends);return [a-7,b+7];}
export function metrics(rs:Reservation[]){if(!rs.length)return {shortGaps:0,largestGap:0,score:0};const [lo,hi]=bounds(rs);let shortGaps=0,largestGap=0,score=0;for(const room of rooms){let cursor=lo;const list=rs.filter(r=>r.room===room.number).sort((a,b)=>a.start.localeCompare(b.start));for(const r of list){const gap=day(r.start)-cursor;if(gap>0){score+=gap*gap;largestGap=Math.max(largestGap,gap);if(gap<=2&&cursor!==lo)shortGaps++;}cursor=Math.max(cursor,day(r.end));}const gap=hi-cursor;score+=gap*gap;largestGap=Math.max(largestGap,gap);}return {shortGaps,largestGap,score};}
function utility(rs:Reservation[],original:Reservation[]){let score=metrics(rs).score;for(const r of rs){const room=rooms.find(x=>x.number===r.room)!;if(r.floor&&room.floor!==r.floor)score-=500;if(r.preferredRoom&&r.room!==r.preferredRoom)score-=500;if(original.find(x=>x.id===r.id)?.room!==r.room)score-=12;score-=(room.capacity-(r.adults+r.children-(r.extraChild?1:0)))*2;}return score;}
function improve(rs:Reservation[],original:Reservation[]){let current=rs.map(r=>({...r}));for(let round=0;round<20;round++){let best=current;let value=utility(current,original);for(let i=0;i<current.length;i++){const r=current[i];for(const room of allowed(r)){if(room.number===r.room||current.some(b=>b.id!==r.id&&b.room===room.number&&overlaps(r,b)))continue;const trial=current.map((b,j)=>j===i?{...b,room:room.number}:b);const s=utility(trial,original);if(s>value){best=trial;value=s;}}}if(best===current)break;current=best;}return current;}
export function plan(original:Reservation[],op:Operation){
 if(op.kind==='housekeeping'){
  if(op.date!==sofiaToday()||typeof op.done!=='boolean')throw Error('Отбелязването е разрешено само за днешния ден.');
  const task=housekeepingProgram(original,op.date).find(t=>t.reservationId===op.id&&t.kind===op.taskKind&&t.due===op.taskDate);
  if(!task)throw Error('Задачата е променена. Обнови списъка.');
  const result=original.map(r=>{
   if(r.id===op.id){
    const events=(r.housekeeping??[]).filter(e=>!(e.kind===task.kind&&e.date===task.due&&e.room===task.room));
    if(op.done)events.push({kind:task.kind,date:task.due,completedOn:op.date!,room:task.room});
    return {...r,housekeeping:events};
   }
   if(task.kind==='departure'&&r.room===task.room&&r.start===op.date)return {...r,reception:{...details(r),roomReady:op.done?'ready' as const:'needsCleaning' as const}};
   return r;
  });
  return {reservations:result,changes:[],before:metrics(original),after:metrics(result),preferenceWarnings:[]};
 }
 if(op.kind==='demoMonth'){
  const result=populateDemoMonth(original,op.month||'2027-07');
  return {reservations:result,changes:[],before:metrics(original),after:metrics(result),preferenceWarnings:[]};
 }
 if(op.kind==='reception'){
  const existing=original.find(r=>r.id===op.id);if(!existing)throw Error('Резервацията вече не съществува.');
  validateDetails(op.details!);if(op.status!==undefined&&!['booked','arrived'].includes(op.status))throw Error('Невалиден статус.');
  const result=original.map(r=>r.id===op.id?{...r,reception:op.details!,status:op.status??r.status}:r);
  return {reservations:result,changes:[],before:metrics(original),after:metrics(result),preferenceWarnings:[]};
 }
 let target=original.map(r=>({...r}));if(op.kind==='delete'){if(!target.some(r=>r.id===op.id))throw Error('Резервацията вече не съществува.');target=target.filter(r=>r.id!==op.id);}
 else if(op.kind==='clearDemo')target=target.filter(r=>!r.demo);
 else if(op.kind==='demo'){if(target.length)throw Error('Примерите се добавят само в празен календар.');target=examples(op.month||'2027-07');}
 else if(op.kind==='add'||op.kind==='edit'){const r=op.reservation!;validate(r);if(op.kind==='add'&&target.some(x=>x.id===r.id))throw Error('Резервацията вече съществува.');if(op.kind==='edit'&&!target.some(x=>x.id===r.id))throw Error('Резервацията вече не съществува.');target=target.filter(x=>x.id!==r.id);target.push({...r,housekeeping:op.kind==='add'?[]:original.find(x=>x.id===r.id)?.housekeeping,room:op.kind==='add'?0:r.room});}
 else if(op.kind!=='optimize')throw Error('Непознато действие.');
 if(target.length>400)throw Error('Първата версия поддържа до 400 резервации.');
 for(const r of target)validate(r);
 let assigned:Reservation[]=[];let visited=0;let found:Reservation[]|null=null;
 // Most constrained first. Already checked-in guests are fixed. Touching endpoints are allowed.
 function search(rest:Reservation[]){if(++visited>40000)return false;if(!rest.length){found=assigned.map(r=>({...r}));return true;}let index=0;let options:typeof rooms=[];let count=Infinity;for(let i=0;i<rest.length;i++){const opts=allowed(rest[i]).filter(room=>!assigned.some(b=>b.room===room.number&&overlaps(rest[i],b)));if(opts.length<count){count=opts.length;index=i;options=opts;}if(!count)return false;}
 const r=rest[index];options.sort((a,b)=>{const rank=(x:typeof a)=>(x.number===r.room?-1000:0)+(r.preferredRoom&&r.preferredRoom!==x.number?50:0)+(r.floor&&r.floor!==x.floor?50:0)+x.capacity;return rank(a)-rank(b)||a.number-b.number;});
 const next=rest.filter((_,i)=>i!==index);for(const room of options){assigned.push({...r,room:room.number});if(search(next))return true;assigned.pop();if(visited>40000)break;}return false;}
 // Preserve valid assignments before trying any reshuffle.
 try{validState(target);found=target;}catch{search(target);}
 if(!found)throw Error(visited>40000?'Не е намерен вариант в рамките на проверката. Опитай други дати или по-малко ограничения; това не доказва, че няма възможно разпределение.':'Няма възможно разпределение при тези дати и задължителни условия.');
 const result=improve(found,original).map(r=>{
  const previous=original.find(x=>x.id===r.id);
  return previous&&(previous.room!==r.room||previous.start!==r.start)?{...r,housekeeping:[],reception:{...details(r),roomReady:'needsCleaning' as const}}:r;
 });validState(result);
 const changes=result.filter(r=>original.some(x=>x.id===r.id&&x.room!==r.room)).map(r=>({id:r.id,name:r.name,from:original.find(x=>x.id===r.id)!.room,to:r.room}));
 const preferenceWarnings=result.filter(r=>(r.floor&&Math.floor(r.room/100)!==r.floor)||(r.preferredRoom&&r.room!==r.preferredRoom)).map(r=>r.name);
 return {reservations:result,changes,before:metrics(original),after:metrics(result),preferenceWarnings};
}
export function examples(month:string):Reservation[]{const make=(n:number,start:number,end:number,room:number):Reservation=>({id:'demo-'+n,name:['Пример: Сем. Иванови','Пример: Сем. Петрови','Пример: Сем. Георгиеви','Пример: Сем. Димитрови','Пример: Сем. Стоянови'][n-1],phone:'',start:month+'-'+String(start).padStart(2,'0'),end:month+'-'+String(end).padStart(2,'0'),adults:2,children:0,ages:'',extraChild:false,floor:1,floorHard:true,preferredRoom:0,roomHard:false,room,status:'booked',notes:'Примерна резервация за тестване.',demo:true});return [make(1,1,6,101),make(2,8,13,101),make(3,6,8,102),make(4,13,18,102),make(5,4,10,103)];}

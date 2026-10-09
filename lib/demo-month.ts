import {rooms, day, iso, validState, type Reservation} from './reception';
import {details} from './reception-details';
export function populateDemoMonth(existing:Reservation[],month:string):Reservation[] {
 if(!/^\d{4}-\d{2}$/.test(month)||!Number.isFinite(day(month+'-01'))||iso(day(month+'-01')).slice(0,7)!==month)throw Error('Невалиден месец.');
 const first=day(month+'-01'), next=new Date((first+32)*86400000).toISOString().slice(0,7)+'-01', end=day(next);
 const target=Math.ceil(rooms.length*(end-first)*0.70);
 const result=existing.map(r=>({...r}));
 const occupied=()=>result.reduce((sum,r)=>sum+Math.max(0,Math.min(end,day(r.end))-Math.max(first,day(r.start))),0);
 if(occupied()>=target)return result;
 let sequence=0;
 const names=['Иванови','Петрови','Георгиеви','Димитрови','Стоянови','Тодорови','Николови','Маринови'];
 const add=(number:number,start:number,finish:number)=>{
  const room=rooms.find(r=>r.number===number)!;
  sequence++;
  const id=`demo-${month}-${number}-${iso(start)}`;
  if(result.some(r=>r.id===id))return;
  const r:Reservation={id,name:`ТЕСТ ${sequence}: Сем. ${names[(sequence-1)%names.length]}`,phone:'',start:iso(start),end:iso(finish),adults:sequence%3===0?room.capacity:2,children:0,ages:'',extraChild:false,floor:0,floorHard:false,preferredRoom:0,roomHard:false,room:number,status:'booked',notes:'Измислени тестови данни за дневната програма.',demo:true};
  const rate=room.capacity===4?90:room.capacity===3?75:60;
  r.reception={...details(r),source:sequence%3===0?'booking':'direct',nightlyRate:sequence%3===0?null:rate,deposit:sequence%4===0?rate*2:0,paidCash:sequence%5===0?rate:0,paidCard:sequence%7===0?rate:0,roomReady:sequence%4===0?'ready':'needsCleaning'};
  result.push(r);
 };
 // Spread bookings and short gaps over every room, then fill remaining gaps if needed.
 for(const room of rooms){
  let cursor=first+(room.number%3);
  while(cursor<end&&occupied()<target){
   if(result.some(r=>r.room===room.number&&day(r.start)<=cursor&&day(r.end)>cursor)){cursor++;continue;}
   let freeEnd=cursor;while(freeEnd<end&&!result.some(r=>r.room===room.number&&day(r.start)<=freeEnd&&day(r.end)>freeEnd))freeEnd++;
   const finish=Math.min(freeEnd,cursor+3+(sequence%5));add(room.number,cursor,finish);
   cursor=finish+1+(sequence%2);
  }
 }
 for(const room of rooms){let cursor=first;while(cursor<end&&occupied()<target){if(result.some(r=>r.room===room.number&&day(r.start)<=cursor&&day(r.end)>cursor)){cursor++;continue;}let finish=cursor+1;while(finish<end&&!result.some(r=>r.room===room.number&&day(r.start)<=finish&&day(r.end)>finish)&&finish-cursor<5)finish++;add(room.number,cursor,finish);cursor=finish;}}
 if(result.length>400)throw Error('Тестовите данни биха надхвърлили лимита от 400 резервации.');
 validState(result);return result;
}

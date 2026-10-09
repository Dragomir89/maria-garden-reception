import { database } from '@/lib/storage';
import {plan, type Reservation, type Operation} from '@/lib/reception';
import {baselineHistorySQL, snapshotSQL, insertHistorySQL, updateCalendarSQL, historyTimestamp, validHistoryDate} from '@/lib/calendar-history';
export const dynamic='force-dynamic';
function json(data:unknown,init:ResponseInit={}){const headers=new Headers(init.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');return new Response(JSON.stringify(data),{...init,headers});}
async function read(){
 const db=database(), timestamp=historyTimestamp();
 await db.batch([
  db.prepare('INSERT OR IGNORE INTO calendar (id, revision, data) VALUES (1, 0, ?)').bind('[]'),
  db.prepare(baselineHistorySQL).bind(timestamp.at,timestamp.day,'baseline'),
 ]);
 const row=await db.prepare('SELECT revision, data FROM calendar WHERE id = 1').first<{revision:number;data:string}>();
 if(!row)throw Error('Календарът не е достъпен.');
 return {revision:row.revision,reservations:JSON.parse(row.data) as Reservation[]};
}
export async function GET(req:Request){try{
 const asOf=new URL(req.url).searchParams.get('asOf');
 if(asOf&&!validHistoryDate(asOf))return json({error:'Невалидна дата за история.'},{status:400});
 const state=await read();
 if(!asOf)return json(state);
 const db=database();
 const [snapshot,since]=await Promise.all([
  db.prepare(snapshotSQL).bind(asOf).first<{revision:number;recorded_at:string;data:string}>(),
  db.prepare('SELECT recorded_at FROM calendar_history ORDER BY revision ASC LIMIT 1').first<{recorded_at:string}>(),
 ]);
 return json({reservations:snapshot?JSON.parse(snapshot.data):[],revision:snapshot?.revision??null,snapshotAt:snapshot?.recorded_at??null,historySince:since?.recorded_at??null,available:!!snapshot,asOf});
 }catch(e){console.error(e);return json({error:'Не успяхме да заредим календара или историята. Опитай отново.'},{status:503});}}
export async function POST(req:Request){try{
 const body=await req.json().catch(()=>{throw Error('Заявката не беше прочетена. Опитай отново; въведените данни остават във формата.');}) as {action:string;revision:number;operation:Operation};
 if(!['preview','commit'].includes(body.action))return json({error:'Невалидно действие.'},{status:400});
 const state=await read();
 if(body.revision!==state.revision)return json({error:'Календарът е променен. Обнови и направи нова проверка.'},{status:409});
 const result=plan(state.reservations,body.operation);
 if(body.action==='preview')return json(result);
 const db=database(), timestamp=historyTimestamp(), data=JSON.stringify(result.reservations);
 // The history insert and revision-guarded write commit or roll back together.
 const writes=await db.batch([
  db.prepare(insertHistorySQL).bind(timestamp.at,timestamp.day,body.operation.kind,data,state.revision),
  db.prepare(updateCalendarSQL).bind(data,state.revision),
 ]);
 if(writes[1].meta.changes!==1)return json({error:'Друг запис промени календара. Обнови и провери отново.'},{status:409});
 return json({...result,revision:state.revision+1});
 }catch(e){console.error(e);return json({error:e instanceof Error?e.message:'Неуспешно действие. Въведените данни са запазени във формата.'},{status:400});}}

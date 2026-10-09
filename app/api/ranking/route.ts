import {readRankings,saveRanking,acquireRefresh,releaseRefresh} from '@/lib/ranking-store';
import {fetchBookingRating} from '@/lib/booking-rating';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const failure='Пробата ви беше неуспешна, опитайте по-късно';
export async function GET(){try{return Response.json({snapshots:await readRankings()},{headers});}catch{return Response.json({error:failure},{status:503,headers});}}
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin)return Response.json({error:failure},{status:403,headers});
 let attempt:number|null=null;
 try{
  attempt=await acquireRefresh();
  if(attempt===null)return Response.json({error:failure},{status:429,headers:{...headers,'Retry-After':'60'}});
  const previous=(await readRankings())[0];
  const hotels=[];
  // Bounded parallelism; every hotel must be freshly verified before writing.
  for(let start=0;start<previous.hotels.length;start+=4){
   const batch=await Promise.allSettled(previous.hotels.slice(start,start+4).map(async hotel=>({...hotel,...await fetchBookingRating(hotel)})));
   if(batch.some(result=>result.status==='rejected'))throw Error('Booking did not provide all hotel ratings');
   for(const result of batch)if(result.status==='fulfilled')hotels.push(result.value);
  }
  await saveRanking({...previous,observedAt:new Date().toISOString(),hotels});
  return Response.json({snapshots:await readRankings()},{headers});
 }catch{return Response.json({error:failure},{status:503,headers});}
 finally{if(attempt!==null)await releaseRefresh(attempt).catch(()=>{});}
}

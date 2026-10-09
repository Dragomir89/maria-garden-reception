'use client';
import {useEffect,useState} from 'react';
import {firstRanking,rankedHotels,positionChange,type RankingSnapshot} from '@/lib/hotel-ranking';

import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from '@/components/ui/table';
const dateLabel=(date:string)=>new Date(date).toLocaleString('bg-BG',{timeZone:'Europe/Sofia',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
export function BookingRanking(){
 const [snapshots,setSnapshots]=useState<RankingSnapshot[]>([firstRanking]),[error,setError]=useState('');
 useEffect(()=>{let active=true;fetch('/api/ranking',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Историята не можа да се зареди.');const data=await response.json() as {snapshots:RankingSnapshot[]};if(active)setSnapshots(data.snapshots);}).catch(()=>{if(active)setError('Историята не можа да се зареди. Показана е първата проверка.');});return()=>{active=false;};},[]);
 const snapshot=snapshots[0],rows=rankedHotels(snapshot),mine=rows.find(h=>h.id==='mariia-gardn');
 const change=positionChange(snapshot,snapshots[1],'mariia-gardn');
 return <section className="reputation reputation-compact">
  <div className="reputation-toolbar"><span>Последна актуализация на данните: {dateLabel(snapshot.observedAt)} · {snapshot.complete?'Потвърден пълен обхват':'Частичен обхват'}</span></div>
  <p className="reputation-footnote">За обновяване на данните отворете разговора с ChatGPT за това приложение и поискайте актуализация.</p>
  {error&&<p className="error-banner" role="alert">{error}</p>}
  <article className="reputation-card ranking-summary"><div><span className="stat-label">MARIA GARDEN · СРЕД ПРОВЕРЕНИТЕ ХОТЕЛИ</span><h2>{mine?`${mine.rank}-то място`:'Няма потвърдена позиция'}</h2><p>{mine?`${mine.rating.toLocaleString('bg-BG')} / 10 · ${mine.reviews} отзива`: 'Няма текуща оценка в тази проверка.'}</p></div><div><strong>Промяна в мястото</strong><p>{change===null?'Няма сравнима предишна проверка.':change===0?'Без промяна.':change>0?`↑ ${change} места нагоре`:`↓ ${Math.abs(change)} места надолу`}</p></div></article>
  <section className="reputation-card reputation-table-card"><div className="reputation-card-heading"><h2>Топ 10 по оценка в Booking</h2><span>Сред {snapshot.hotels.length} проверени хотела в Кранево</span></div>
   <p className="reputation-scope"><strong>{snapshot.complete?'Класация по общата оценка.':'Предварителна класация — пълният списък за Кранево не е потвърден.'}</strong>Равните оценки споделят място. Имената подреждат равните оценки само за показване. Броят отзиви не променя мястото.</p>
   <Table className="reputation-table ranking-table"><TableHeader><TableRow><TableHead>Място</TableHead><TableHead>Хотел</TableHead><TableHead>Оценка</TableHead><TableHead>Отзиви</TableHead><TableHead>Промяна</TableHead></TableRow></TableHeader><TableBody>{rows.slice(0,10).map(hotel=>{const delta=positionChange(snapshot,snapshots[1],hotel.id);return <TableRow key={hotel.id} className={hotel.id==='mariia-gardn'?'ranking-own':''}><TableCell><strong>{hotel.rank}</strong></TableCell><TableCell><a href={hotel.url} target="_blank" rel="noopener noreferrer">{hotel.name}</a>{hotel.id==='mariia-gardn'&&<span className="ranking-you">Твоят хотел</span>}</TableCell><TableCell><strong>{hotel.rating.toLocaleString('bg-BG')}</strong> / 10</TableCell><TableCell>{hotel.reviews.toLocaleString('bg-BG')}</TableCell><TableCell>{delta===null?'—':delta===0?'Без промяна':delta>0?`↑ ${delta}`:`↓ ${Math.abs(delta)}`}</TableCell></TableRow>;})}</TableBody></Table>
  </section>
  <details className="reputation-card ranking-method"><summary>Обхват и правила</summary><p>{snapshot.scope}</p><p>Това е подреждане в нашата платформа по общата оценка в Booking, различно от „Top reviewed“ на Booking. При равенство например местата са 1, 1, 3. Показват се точно 10 хотела; равенство около границата се подрежда по име. Промяната се изчислява само при две проверки на едни и същи хотели.</p></details>
  <p className="reputation-footnote">Показани са последните запазени данни. Данните не се обновяват автоматично.</p>
 </section>;
}

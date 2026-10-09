import {z} from 'zod';
export const rankingSchema=z.object({observedAt:z.string().datetime(),scope:z.string().min(1).max(1000),complete:z.boolean(),hotels:z.array(z.object({id:z.string().min(1),name:z.string().min(1).max(200),rating:z.number().min(0).max(10),reviews:z.number().int().positive(),url:z.string().url().refine(url=>new URL(url).hostname==='www.booking.com')})).min(1).max(100)}).refine(value=>new Set(value.hotels.map(h=>h.id)).size===value.hotels.length,'Хотелите трябва да са уникални.');
export type RankingSnapshot=z.infer<typeof rankingSchema>;
const hotel=(id:string,name:string,rating:number,reviews:number)=>({id,name,rating,reviews,url:`https://www.booking.com/hotel/bg/${id}.html`});
export const firstRanking:RankingSnapshot={observedAt:'2026-10-05T17:43:00.000Z',complete:false,scope:'19 хотела в Кранево с прочетена обща оценка в Booking. Публичният списък „Hotels“ е допълнен с Maria Garden, Sea View Family Hotel, Effect Algara Beach Resort и Hotel Magnific. Апартаменти, студиа, вили и обекти извън Кранево са изключени. Пълният списък не е потвърден: Hotel Vega пренасочва към търсенето и няма текущ прочит.',hotels:[
 hotel('casa-di-fiore-spa-amp-medical-kranevo','Casa di Fiore SPA and Medical Hotel',9.6,1225),
 hotel('aquamarine-kranevo1','Aquamarine — Beach & SPA Hotel',9.6,524),
 hotel('sea-view-family','Sea View Family Hotel',9.5,44),
 hotel('mariia-gardn','Maria Garden',9.4,157),
 hotel('sunny-castle','Sunny Castle Hotel',9.3,505),
 hotel('algara-beach','Effect Algara Beach Resort',9.3,1667),
 hotel('family-julian','Family Hotel Yulian',8.9,151),
 hotel('magnific','Hotel Magnific',8.9,562),
 hotel('palma-kranevo','Palma Beach Hotel',8.8,292),
 hotel('morski-dar','Hotel Morski Dar',8.7,79),
 hotel('stefan-hotel','Stefan Family Hotel',8.6,54),
 hotel('family-gery','Family Hotel Gery',8.4,44),
 hotel('balneohotel-therma-palace','Therma Palace',8.1,761),
 hotel('semeen-khotel-randevu-kranevo','Family Hotel Randevu',8,107),
 hotel('therma-eco','ECO Therma Village',7.8,1926),
 hotel('veronika-kranevo','Hotel Veronika',7.5,151),
 hotel('festa-hotel','Festa-Kranevo',7,460),
 hotel('vedren','Club Hotel Vedren',6.7,111),
 hotel('jaki','Hotel Jaky SPA Complex',6,100)
]};
export function rankedHotels(snapshot:RankingSnapshot){const sorted=[...snapshot.hotels].sort((a,b)=>b.rating-a.rating||a.name.localeCompare(b.name,'bg'));return sorted.map(hotel=>({...hotel,rank:1+sorted.filter(other=>other.rating>hotel.rating).length}));}
export function positionChange(current:RankingSnapshot,previous:RankingSnapshot|undefined,id:string){if(!previous||previous.observedAt>=current.observedAt)return null;const cohort=(s:RankingSnapshot)=>s.hotels.map(h=>h.id).sort().join('|');if(cohort(current)!==cohort(previous))return null;const now=rankedHotels(current).find(h=>h.id===id),before=rankedHotels(previous).find(h=>h.id===id);return now&&before?before.rank-now.rank:null;}

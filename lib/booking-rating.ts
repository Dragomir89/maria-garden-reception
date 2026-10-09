// Read only explicit, hotel-specific aggregate ratings. A challenge page is never data.
export function parseBookingRating(html:string,hotelId:string){
 const nodes:Record<string,unknown>[]=[];
 function collect(value:unknown){if(Array.isArray(value)){value.forEach(collect);return;}if(!value||typeof value!=='object')return;const node=value as Record<string,unknown>;nodes.push(node);if(node['@graph'])collect(node['@graph']);}
 for(const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{collect(JSON.parse(match[1]));}catch{/* Malformed metadata cannot prove a rating. */}}
 for(const node of nodes){
  const types=Array.isArray(node['@type'])?node['@type']:[node['@type']];
  if(!types.some(type=>['Hotel','LodgingBusiness','Resort'].includes(String(type))))continue;
  const identity=node.url??node['@id'];if(typeof identity!=='string')continue;
  let url:URL;try{url=new URL(identity);}catch{continue;}
  if(url.hostname!=='www.booking.com'||!url.pathname.startsWith(`/hotel/bg/${hotelId}.`))continue;
  const aggregate=node.aggregateRating as Record<string,unknown>|undefined;if(!aggregate)continue;
  const rating=Number(aggregate.ratingValue),reviews=Number(aggregate.reviewCount??aggregate.ratingCount),best=Number(aggregate.bestRating);
  if(best!==10||!Number.isFinite(rating)||rating<0||rating>10||!Number.isInteger(reviews)||reviews<=0)continue;
  return {rating,reviews};
 }
 throw Error('Booking не предостави потвърдена оценка.');
}
export async function fetchBookingRating(hotel:{id:string;url:string},fetcher:typeof fetch=fetch){
 const response=await fetcher(hotel.url,{headers:{Accept:'text/html','Accept-Language':'en'},cache:'no-store',redirect:'follow',signal:AbortSignal.timeout(12000)});
 if(response.status!==200)throw Error('Booking временно не допуска автоматичната проверка.');
 const url=new URL(response.url||hotel.url);
 if(url.hostname!=='www.booking.com'||!url.pathname.startsWith(`/hotel/bg/${hotel.id}.`))throw Error('Booking пренасочи към друга страница.');
 return parseBookingRating(await response.text(),hotel.id);
}

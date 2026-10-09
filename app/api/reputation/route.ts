import {readReports} from '@/lib/reputation-store';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json({reports:await readReports()},{headers:{'Cache-Control':'no-store'}});}catch(e){console.error(e);return Response.json({error:'Прегледите временно не са достъпни. Опитай отново.'},{status:503});}}

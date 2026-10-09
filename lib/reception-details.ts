import type {Reservation} from './reception';
export type ReceptionDetails = {
  source: 'direct' | 'booking'; nightlyRate: number | null; totalOverride: number | null;
  deposit: number; paidCash: number; paidCard: number;
  roomReady: 'needsCleaning' | 'ready';
  dataTaken: boolean; registered: boolean; departed: boolean;
};
export function details(r: Reservation): ReceptionDetails {
  return {source:'direct', nightlyRate:null, totalOverride:null, deposit:0, paidCash:0, paidCard:0, roomReady:'needsCleaning', dataTaken:false, registered:false, departed:false, ...r.reception};
}
export const roundMoney = (value:number) => Math.round((value + Number.EPSILON) * 100) / 100;
export function payment(r: Reservation) {
  const d = details(r);
  const nights = (Date.parse(r.end+'T00:00:00Z')-Date.parse(r.start+'T00:00:00Z'))/86400000;
  const total = d.totalOverride ?? (d.nightlyRate === null ? null : roundMoney(d.nightlyRate * nights));
  const received = roundMoney(d.deposit + d.paidCash + d.paidCard);
  const balance = d.source === 'booking' ? 0 : total === null ? null : roundMoney(total - received);
  return {total, received, balance};
}
export const money = (value:number|null) => value === null ? 'Не е въведено' : new Intl.NumberFormat('bg-BG',{style:'currency',currency:'EUR'}).format(value);
export function validateDetails(d: ReceptionDetails) {
  if (!d || !['direct','booking'].includes(d.source) || !['needsCleaning','ready'].includes(d.roomReady)) throw Error('Провери източника и готовността на стаята.');
  for (const field of ['nightlyRate','totalOverride','deposit','paidCash','paidCard'] as const) {
    const value = d[field];
    if (value === null && (field === 'nightlyRate' || field === 'totalOverride')) continue;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1000000 || Math.abs(roundMoney(value) - value)>0.000001) throw Error('Сумите трябва да са положителни или нула, с до два знака след запетаята.');
  }
  for (const field of ['dataTaken','registered','departed'] as const) if(typeof d[field] !== 'boolean') throw Error('Невалидна отметка за рецепцията.');
}

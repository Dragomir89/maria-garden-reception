import type { Reservation } from './reception';

export function sofiaToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sofia', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (type: string) => parts.find(p => p.type === type)!.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function dailyProgram(reservations: Reservation[], date: string) {
  const sorted = [...reservations].sort((a, b) => a.room - b.room || a.name.localeCompare(b.name, 'bg'));
  const arrivals = sorted.filter(r => r.start === date);
  const departures = sorted.filter(r => r.end === date);
  const staying = sorted.filter(r => r.start < date && r.end > date);
  const turnovers = departures.flatMap(departure => arrivals.filter(arrival => arrival.room === departure.room).map(arrival => ({ room: departure.room, departure, arrival })));
  return { arrivals, departures, staying, turnovers };
}

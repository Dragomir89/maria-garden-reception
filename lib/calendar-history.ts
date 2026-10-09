import {sofiaToday} from './daily-program';
export const baselineHistorySQL = 'INSERT OR IGNORE INTO calendar_history (revision, recorded_at, recorded_day, action, data) SELECT revision, ?, ?, ? , data FROM calendar WHERE id = 1 AND NOT EXISTS (SELECT 1 FROM calendar_history)';
export const snapshotSQL = 'SELECT revision, recorded_at, recorded_day, action, data FROM calendar_history WHERE recorded_day <= ? ORDER BY recorded_day DESC, revision DESC LIMIT 1';
export const insertHistorySQL = 'INSERT INTO calendar_history (revision, recorded_at, recorded_day, action, data) SELECT revision + 1, ?, ?, ?, ? FROM calendar WHERE id = 1 AND revision = ?';
export const updateCalendarSQL = 'UPDATE calendar SET data = ?, revision = revision + 1 WHERE id = 1 AND revision = ?';
export function historyTimestamp(now = new Date()) { return {at:now.toISOString(), day:sofiaToday(now)}; }
export function validHistoryDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date+'T00:00:00Z')) && new Date(date+'T00:00:00Z').toISOString().slice(0,10) === date;
}

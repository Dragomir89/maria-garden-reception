import {database} from './storage';
import {readReports} from './reputation-store';
import {firstRanking,rankingSchema,type RankingSnapshot} from './hotel-ranking';
export async function readRankings(){
 const rows=await database().prepare('SELECT data FROM ranking_snapshots ORDER BY observed_at DESC LIMIT 104').all<{data:string}>();
 const saved=rows.results.map(row=>rankingSchema.parse(JSON.parse(row.data)));
 const reports=await readReports();
 const unique=new Map([firstRanking,...reports.flatMap(report=>report.ranking?[report.ranking]:[]),...saved].map(snapshot=>[snapshot.observedAt,snapshot]));
 return [...unique.values()].sort((a,b)=>b.observedAt.localeCompare(a.observedAt));
}
export async function saveRanking(snapshot:RankingSnapshot){
 const valid=rankingSchema.parse(snapshot);
 await database().prepare('INSERT INTO ranking_snapshots (observed_at,data) VALUES (?,?)').bind(valid.observedAt,JSON.stringify(valid)).run();
}
export async function acquireRefresh(){
 const now=Date.now();
 const result=await database().prepare('INSERT INTO ranking_refresh_state (id,attempted_at,locked_until) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET attempted_at=excluded.attempted_at,locked_until=excluded.locked_until WHERE ranking_refresh_state.locked_until < ? AND ranking_refresh_state.attempted_at < ?').bind(now,now+120000,now,now-60000).run();
 return result.meta.changes===1?now:null;
}
export async function releaseRefresh(attempt:number){await database().prepare('UPDATE ranking_refresh_state SET locked_until=0 WHERE id=1 AND attempted_at=?').bind(attempt).run();}

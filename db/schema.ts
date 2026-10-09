// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const calendar = sqliteTable("calendar", {
  id: integer("id").primaryKey(),
  revision: integer("revision").notNull().default(0),
  data: text("data").notNull().default("[]"),
});
export const calendarHistory = sqliteTable("calendar_history", {
  revision: integer("revision").primaryKey(),
  recordedAt: text("recorded_at").notNull(),
  recordedDay: text("recorded_day").notNull(),
  action: text("action").notNull(),
  data: text("data").notNull(),
}, table => [index("idx_calendar_history_day_revision").on(table.recordedDay, table.revision)]);

export const reputationReports = sqliteTable("reputation_reports", {
 id: text("id").primaryKey(),
 observedAt: text("observed_at").notNull(),
 data: text("data").notNull(),
}, table => [index("idx_reputation_reports_observed_at").on(table.observedAt)]);

export const rankingSnapshots = sqliteTable("ranking_snapshots", {
 observedAt: text("observed_at").primaryKey(),
 data: text("data").notNull(),
});
export const rankingRefreshState = sqliteTable("ranking_refresh_state", {
 id: integer("id").primaryKey(),
 attemptedAt: integer("attempted_at").notNull(),
 lockedUntil: integer("locked_until").notNull(),
});

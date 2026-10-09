CREATE TABLE `calendar_history` (
	`revision` integer PRIMARY KEY NOT NULL,
	`recorded_at` text NOT NULL,
	`recorded_day` text NOT NULL,
	`action` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_calendar_history_day_revision` ON `calendar_history` (`recorded_day`,`revision`);
CREATE TABLE `reputation_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`observed_at` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reputation_reports_observed_at` ON `reputation_reports` (`observed_at`);
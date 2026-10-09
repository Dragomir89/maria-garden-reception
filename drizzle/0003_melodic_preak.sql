CREATE TABLE `ranking_refresh_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`attempted_at` integer NOT NULL,
	`locked_until` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ranking_snapshots` (
	`observed_at` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);

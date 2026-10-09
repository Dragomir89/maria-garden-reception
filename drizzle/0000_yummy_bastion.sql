CREATE TABLE `calendar` (
	`id` integer PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`data` text DEFAULT '[]' NOT NULL
);

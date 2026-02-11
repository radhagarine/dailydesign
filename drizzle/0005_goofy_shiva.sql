CREATE TABLE `access_codes` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`redeemed_by` integer,
	`redeemed_at` integer,
	`created_at` integer,
	FOREIGN KEY (`redeemed_by`) REFERENCES `subscribers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_codes_code_unique` ON `access_codes` (`code`);--> statement-breakpoint
CREATE INDEX `access_code_idx` ON `access_codes` (`code`);
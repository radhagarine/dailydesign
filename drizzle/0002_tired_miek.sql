CREATE TABLE `referrals` (
	`id` integer PRIMARY KEY NOT NULL,
	`referrer_id` integer NOT NULL,
	`referred_id` integer NOT NULL,
	`reward_status` text DEFAULT 'pending',
	`created_at` integer,
	FOREIGN KEY (`referrer_id`) REFERENCES `subscribers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referred_id`) REFERENCES `subscribers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `referral_referrer_idx` ON `referrals` (`referrer_id`);--> statement-breakpoint
CREATE INDEX `referral_referred_idx` ON `referrals` (`referred_id`);--> statement-breakpoint
ALTER TABLE `subscribers` ADD `referral_code` text;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `referred_by` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_referral_code_unique` ON `subscribers` (`referral_code`);
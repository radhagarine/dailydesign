CREATE TABLE `emails` (
	`id` integer PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`sent_at` integer,
	`recipient_count` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`theme` text NOT NULL,
	`problem_type` text NOT NULL,
	`focus_area` text,
	`generated_at` integer,
	`scheduled_for` integer,
	`scenario_status` text DEFAULT 'sent'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scenarios_slug_unique` ON `scenarios` (`slug`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `scenarios` (`slug`);--> statement-breakpoint
CREATE INDEX `generated_at_idx` ON `scenarios` (`generated_at`);--> statement-breakpoint
CREATE INDEX `theme_idx` ON `scenarios` (`theme`);--> statement-breakpoint
CREATE INDEX `scheduled_for_idx` ON `scenarios` (`scheduled_for`);--> statement-breakpoint
CREATE INDEX `scenario_status_idx` ON `scenarios` (`scenario_status`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'active',
	`unsubscribe_token` text NOT NULL,
	`joined_at` integer,
	`years_experience` text,
	`primary_role` text,
	`prep_stage` text,
	`timezone` text DEFAULT 'UTC',
	`stripe_customer_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_unsubscribe_token_unique` ON `subscribers` (`unsubscribe_token`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY NOT NULL,
	`subscriber_id` integer NOT NULL,
	`stripe_subscription_id` text NOT NULL,
	`stripe_price_id` text NOT NULL,
	`status` text NOT NULL,
	`plan` text NOT NULL,
	`current_period_start` integer,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_subscription_id_unique` ON `subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE INDEX `subscription_subscriber_idx` ON `subscriptions` (`subscriber_id`);--> statement-breakpoint
CREATE INDEX `stripe_subscription_idx` ON `subscriptions` (`stripe_subscription_id`);
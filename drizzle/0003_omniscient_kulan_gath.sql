CREATE TABLE `email_send_log` (
	`id` integer PRIMARY KEY NOT NULL,
	`recipient_email` text NOT NULL,
	`subject` text NOT NULL,
	`send_status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_attempt_at` integer,
	`last_error` text,
	`email_type` text NOT NULL,
	`scenario_slug` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `email_send_log_status_idx` ON `email_send_log` (`send_status`);--> statement-breakpoint
CREATE INDEX `email_send_log_recipient_idx` ON `email_send_log` (`recipient_email`);
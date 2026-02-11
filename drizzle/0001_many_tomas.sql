CREATE TABLE `email_events` (
	`id` integer PRIMARY KEY NOT NULL,
	`resend_email_id` text NOT NULL,
	`recipient_email` text NOT NULL,
	`event_type` text NOT NULL,
	`metadata` text,
	`occurred_at` integer
);
--> statement-breakpoint
CREATE INDEX `email_event_resend_idx` ON `email_events` (`resend_email_id`);--> statement-breakpoint
CREATE INDEX `email_event_recipient_idx` ON `email_events` (`recipient_email`);--> statement-breakpoint
CREATE INDEX `email_event_type_idx` ON `email_events` (`event_type`);--> statement-breakpoint
ALTER TABLE `subscriptions` ALTER COLUMN "subscriber_id" TO "subscriber_id" integer NOT NULL REFERENCES subscribers(id) ON DELETE no action ON UPDATE no action;
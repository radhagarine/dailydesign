CREATE INDEX `subscriber_status_idx` ON `subscribers` (`status`);--> statement-breakpoint
CREATE INDEX `subscriber_stripe_customer_idx` ON `subscribers` (`stripe_customer_id`);
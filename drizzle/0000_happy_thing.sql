CREATE TABLE `article_clicks` (
	`event_id` text PRIMARY KEY NOT NULL,
	`article_id` text NOT NULL,
	`clicked_at` integer NOT NULL,
	`day` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `article_clicks_article_day_idx` ON `article_clicks` (`article_id`,`day`);
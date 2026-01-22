ALTER TABLE `badges` RENAME COLUMN `iconUrl` TO `icon`;--> statement-breakpoint
ALTER TABLE `badges` ADD `category` enum('performer_type','country') DEFAULT 'performer_type' NOT NULL;
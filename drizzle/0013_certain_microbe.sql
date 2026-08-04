ALTER TABLE `badges` MODIFY COLUMN `category` enum('performer_type','country','gameplay') NOT NULL DEFAULT 'performer_type';--> statement-breakpoint
ALTER TABLE `performers` ADD `measurements` varchar(50);--> statement-breakpoint
ALTER TABLE `performers` ADD `hairColor` varchar(50);--> statement-breakpoint
ALTER TABLE `performers` ADD `eyeColor` varchar(50);--> statement-breakpoint
ALTER TABLE `performers` ADD `height` varchar(20);--> statement-breakpoint
ALTER TABLE `performers` ADD `sex` varchar(20);
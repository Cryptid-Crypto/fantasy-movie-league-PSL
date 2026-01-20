CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`iconUrl` text,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `badges_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `performerBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`performerId` int NOT NULL,
	`badgeId` int NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performerBadges_id` PRIMARY KEY(`id`),
	CONSTRAINT `performerBadges_performerId_badgeId_unique` UNIQUE(`performerId`,`badgeId`)
);
--> statement-breakpoint
ALTER TABLE `performerBadges` ADD CONSTRAINT `performerBadges_performerId_performers_id_fk` FOREIGN KEY (`performerId`) REFERENCES `performers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performerBadges` ADD CONSTRAINT `performerBadges_badgeId_badges_id_fk` FOREIGN KEY (`badgeId`) REFERENCES `badges`(`id`) ON DELETE cascade ON UPDATE no action;
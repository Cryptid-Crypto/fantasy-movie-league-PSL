CREATE TABLE `tournamentEntryPerformers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryId` int NOT NULL,
	`performerId` int NOT NULL,
	`nftTokenId` varchar(78) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tournamentEntryPerformers_id` PRIMARY KEY(`id`),
	CONSTRAINT `tournamentEntryPerformers_entryId_performerId_unique` UNIQUE(`entryId`,`performerId`)
);
--> statement-breakpoint
ALTER TABLE `tournamentEntries` DROP FOREIGN KEY `tournamentEntries_performerId_performers_id_fk`;
--> statement-breakpoint
ALTER TABLE `tournamentEntryPerformers` ADD CONSTRAINT `tournamentEntryPerformers_entryId_tournamentEntries_id_fk` FOREIGN KEY (`entryId`) REFERENCES `tournamentEntries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tournamentEntryPerformers` ADD CONSTRAINT `tournamentEntryPerformers_performerId_performers_id_fk` FOREIGN KEY (`performerId`) REFERENCES `performers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tournamentEntries` DROP COLUMN `performerId`;--> statement-breakpoint
ALTER TABLE `tournamentEntries` DROP COLUMN `nftTokenId`;
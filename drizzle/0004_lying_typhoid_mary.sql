CREATE TABLE `tournamentRosterRequirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tournamentId` int NOT NULL,
	`performerType` varchar(50),
	`requiredCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tournamentRosterRequirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tournamentRosterRequirements` ADD CONSTRAINT `tournamentRosterRequirements_tournamentId_tournaments_id_fk` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE cascade ON UPDATE no action;
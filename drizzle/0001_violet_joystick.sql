CREATE TABLE `actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `actions_id` PRIMARY KEY(`id`),
	CONSTRAINT `actions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `movies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`releaseDate` timestamp,
	`coverImageUrl` text,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `movies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`bio` text,
	`imageUrl` text,
	`nftContractAddress` varchar(42),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenePerformerActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sceneId` int NOT NULL,
	`performerId` int NOT NULL,
	`actionId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scenePerformerActions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`movieId` int NOT NULL,
	`title` varchar(500),
	`sceneNumber` int,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournamentEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tournamentId` int NOT NULL,
	`userId` int NOT NULL,
	`performerId` int NOT NULL,
	`nftTokenId` varchar(78) NOT NULL,
	`totalScore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tournamentEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `tournamentEntries_tournamentId_userId_unique` UNIQUE(`tournamentId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(500) NOT NULL,
	`description` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`requiredNftContractAddress` varchar(42),
	`entryFee` decimal(18,8) DEFAULT '0',
	`status` enum('upcoming','active','completed') NOT NULL DEFAULT 'upcoming',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tournaments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userNftInventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`performerId` int NOT NULL,
	`contractAddress` varchar(42) NOT NULL,
	`tokenId` varchar(78) NOT NULL,
	`lastSyncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userNftInventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `userNftInventory_userId_contractAddress_tokenId_unique` UNIQUE(`userId`,`contractAddress`,`tokenId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `walletAddress` varchar(42);--> statement-breakpoint
ALTER TABLE `scenePerformerActions` ADD CONSTRAINT `scenePerformerActions_sceneId_scenes_id_fk` FOREIGN KEY (`sceneId`) REFERENCES `scenes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scenePerformerActions` ADD CONSTRAINT `scenePerformerActions_performerId_performers_id_fk` FOREIGN KEY (`performerId`) REFERENCES `performers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scenePerformerActions` ADD CONSTRAINT `scenePerformerActions_actionId_actions_id_fk` FOREIGN KEY (`actionId`) REFERENCES `actions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scenes` ADD CONSTRAINT `scenes_movieId_movies_id_fk` FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tournamentEntries` ADD CONSTRAINT `tournamentEntries_tournamentId_tournaments_id_fk` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tournamentEntries` ADD CONSTRAINT `tournamentEntries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tournamentEntries` ADD CONSTRAINT `tournamentEntries_performerId_performers_id_fk` FOREIGN KEY (`performerId`) REFERENCES `performers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userNftInventory` ADD CONSTRAINT `userNftInventory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userNftInventory` ADD CONSTRAINT `userNftInventory_performerId_performers_id_fk` FOREIGN KEY (`performerId`) REFERENCES `performers`(`id`) ON DELETE cascade ON UPDATE no action;
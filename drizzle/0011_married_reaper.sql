CREATE TABLE `creditLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('admin_grant','tournament_prize','nft_sale','nft_purchase','tournament_entry','refund') NOT NULL,
	`description` text,
	`relatedNftCardId` int,
	`relatedListingId` int,
	`relatedTournamentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditLedger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nftCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`performerId` int NOT NULL,
	`ownerId` int,
	`serialNumber` int NOT NULL,
	`rarity` enum('Common','Rare','Epic','Legendary') NOT NULL DEFAULT 'Common',
	`cardImageUrl` text,
	`mintedAt` timestamp NOT NULL DEFAULT (now()),
	`mintedBy` int,
	`onChainTokenId` varchar(78),
	`onChainContractAddress` varchar(42),
	`isLocked` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nftCards_id` PRIMARY KEY(`id`),
	CONSTRAINT `nftCards_performerId_serialNumber_unique` UNIQUE(`performerId`,`serialNumber`)
);
--> statement-breakpoint
CREATE TABLE `nftListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nftCardId` int NOT NULL,
	`sellerId` int NOT NULL,
	`priceCredits` int NOT NULL,
	`status` enum('active','sold','cancelled') NOT NULL DEFAULT 'active',
	`buyerId` int,
	`soldAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nftListings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nftTransferHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nftCardId` int NOT NULL,
	`fromUserId` int,
	`toUserId` int,
	`transferType` enum('mint','marketplace_sale','admin_transfer','tournament_reward') NOT NULL,
	`priceCredits` int,
	`listingId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nftTransferHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `creditLedger` ADD CONSTRAINT `creditLedger_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creditLedger` ADD CONSTRAINT `creditLedger_relatedNftCardId_nftCards_id_fk` FOREIGN KEY (`relatedNftCardId`) REFERENCES `nftCards`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creditLedger` ADD CONSTRAINT `creditLedger_relatedListingId_nftListings_id_fk` FOREIGN KEY (`relatedListingId`) REFERENCES `nftListings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creditLedger` ADD CONSTRAINT `creditLedger_relatedTournamentId_tournaments_id_fk` FOREIGN KEY (`relatedTournamentId`) REFERENCES `tournaments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftCards` ADD CONSTRAINT `nftCards_performerId_performers_id_fk` FOREIGN KEY (`performerId`) REFERENCES `performers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftCards` ADD CONSTRAINT `nftCards_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftCards` ADD CONSTRAINT `nftCards_mintedBy_users_id_fk` FOREIGN KEY (`mintedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftListings` ADD CONSTRAINT `nftListings_nftCardId_nftCards_id_fk` FOREIGN KEY (`nftCardId`) REFERENCES `nftCards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftListings` ADD CONSTRAINT `nftListings_sellerId_users_id_fk` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftListings` ADD CONSTRAINT `nftListings_buyerId_users_id_fk` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftTransferHistory` ADD CONSTRAINT `nftTransferHistory_nftCardId_nftCards_id_fk` FOREIGN KEY (`nftCardId`) REFERENCES `nftCards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftTransferHistory` ADD CONSTRAINT `nftTransferHistory_fromUserId_users_id_fk` FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftTransferHistory` ADD CONSTRAINT `nftTransferHistory_toUserId_users_id_fk` FOREIGN KEY (`toUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftTransferHistory` ADD CONSTRAINT `nftTransferHistory_listingId_nftListings_id_fk` FOREIGN KEY (`listingId`) REFERENCES `nftListings`(`id`) ON DELETE set null ON UPDATE no action;
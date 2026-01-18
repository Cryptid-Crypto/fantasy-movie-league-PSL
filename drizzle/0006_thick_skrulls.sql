CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tournamentId` int,
	`type` enum('entry_fee','prize_payout','refund') NOT NULL,
	`amount` decimal(18,8) NOT NULL,
	`tokenAddress` varchar(42),
	`txHash` varchar(66) NOT NULL,
	`fromAddress` varchar(42) NOT NULL,
	`toAddress` varchar(42) NOT NULL,
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`blockNumber` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_txHash_unique` UNIQUE(`txHash`)
);
--> statement-breakpoint
ALTER TABLE `tournaments` ADD `paymentTokenAddress` varchar(42);--> statement-breakpoint
ALTER TABLE `tournaments` ADD `prizePool` decimal(18,8) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `tournaments` ADD `escrowContractAddress` varchar(42);--> statement-breakpoint
ALTER TABLE `tournaments` ADD `payoutComplete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_tournamentId_tournaments_id_fk` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE set null ON UPDATE no action;
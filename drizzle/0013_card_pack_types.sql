CREATE TABLE `packTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`priceUsdCents` int NOT NULL,
	`cardCount` int NOT NULL DEFAULT 8,
	`rareCount` int NOT NULL DEFAULT 1,
	`uncommonCount` int NOT NULL DEFAULT 2,
	`commonCount` int NOT NULL DEFAULT 5,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `packTypes_id` PRIMARY KEY(`id`)
);
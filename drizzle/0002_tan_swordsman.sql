CREATE TABLE `moviePerformers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`movieId` int NOT NULL,
	`performerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moviePerformers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `moviePerformers` ADD CONSTRAINT `moviePerformers_movieId_movies_id_fk` FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moviePerformers` ADD CONSTRAINT `moviePerformers_performerId_performers_id_fk` FOREIGN KEY (`performerId`) REFERENCES `performers`(`id`) ON DELETE cascade ON UPDATE no action;
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  walletAddress: varchar("walletAddress", { length: 42 }), // Ethereum address
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Performers (actors/actresses in the platform)
 */
export const performers = mysqlTable("performers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  portraitUrl: text("portraitUrl"), // Original portrait image
  imageUrl: text("imageUrl"), // Generated NFT card
  nftContractAddress: varchar("nftContractAddress", { length: 42 }), // Polygon contract address
  performerType: mysqlEnum("performerType", [
    "Legend",
    "Anal Queen",
    "Super Slut",
    "Extreme",
    "Girl Next Door",
    "Rising Star",
    "Hall of Fame",
    "Specialist",
    "MILF",
  ]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Performer = typeof performers.$inferSelect;
export type InsertPerformer = typeof performers.$inferInsert;

/**
 * Badge types available for performers
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: mysqlEnum("category", ["performer_type", "country"]).notNull().default("performer_type"),
  icon: text("icon"), // URL to badge icon image
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Junction table linking performers to their badges
 * Allows multiple badges per performer
 */
export const performerBadges = mysqlTable("performerBadges", {
  id: int("id").autoincrement().primaryKey(),
  performerId: int("performerId").notNull().references(() => performers.id, { onDelete: "cascade" }),
  badgeId: int("badgeId").notNull().references(() => badges.id, { onDelete: "cascade" }),
  order: int("order").notNull().default(0), // Display order on the card
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniquePerformerBadge: unique().on(table.performerId, table.badgeId),
}));

export type PerformerBadge = typeof performerBadges.$inferSelect;
export type InsertPerformerBadge = typeof performerBadges.$inferInsert;

/**
 * Movies in the platform
 */
export const movies = mysqlTable("movies", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  releaseDate: timestamp("releaseDate"),
  coverImageUrl: text("coverImageUrl"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = typeof movies.$inferInsert;

/**
 * Junction table linking movies and performers
 * Tracks which performers appear in which movies
 */
export const moviePerformers = mysqlTable("moviePerformers", {
  id: int("id").autoincrement().primaryKey(),
  movieId: int("movieId").notNull().references(() => movies.id, { onDelete: "cascade" }),
  performerId: int("performerId").notNull().references(() => performers.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoviePerformer = typeof moviePerformers.$inferSelect;
export type InsertMoviePerformer = typeof moviePerformers.$inferInsert;

/**
 * Scenes within movies
 */
export const scenes = mysqlTable("scenes", {
  id: int("id").autoincrement().primaryKey(),
  movieId: int("movieId").notNull().references(() => movies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }),
  sceneNumber: int("sceneNumber"),
  duration: int("duration"), // Duration in seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scene = typeof scenes.$inferSelect;
export type InsertScene = typeof scenes.$inferInsert;

/**
 * Action types with point values (e.g., "facial" = 10 points)
 */
export const actions = mysqlTable("actions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  points: int("points").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Action = typeof actions.$inferSelect;
export type InsertAction = typeof actions.$inferInsert;

/**
 * Junction table linking scenes, performers, and actions
 * Tracks which performer did which action in which scene
 */
export const scenePerformerActions = mysqlTable("scenePerformerActions", {
  id: int("id").autoincrement().primaryKey(),
  sceneId: int("sceneId").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  performerId: int("performerId").notNull().references(() => performers.id, { onDelete: "cascade" }),
  actionId: int("actionId").notNull().references(() => actions.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScenePerformerAction = typeof scenePerformerActions.$inferSelect;
export type InsertScenePerformerAction = typeof scenePerformerActions.$inferInsert;

/**
 * Tournaments
 */
export const tournaments = mysqlTable("tournaments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  requiredNftContractAddress: varchar("requiredNftContractAddress", { length: 42 }), // Required NFT to enter
  entryFee: decimal("entryFee", { precision: 18, scale: 8 }).default("0"), // In MATIC or PSL token
  paymentTokenAddress: varchar("paymentTokenAddress", { length: 42 }), // Token contract address (null = native MATIC)
  prizePool: decimal("prizePool", { precision: 18, scale: 8 }).default("0"), // Total prize pool accumulated
  escrowContractAddress: varchar("escrowContractAddress", { length: 42 }), // Smart contract holding funds
  payoutComplete: boolean("payoutComplete").default(false).notNull(), // Whether winners have been paid
  status: mysqlEnum("status", ["upcoming", "active", "completed"]).default("upcoming").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;

/**
 * Tournament roster requirements (defines what performer types are needed to enter)
 */
export const tournamentRosterRequirements = mysqlTable("tournamentRosterRequirements", {
  id: int("id").autoincrement().primaryKey(),
  tournamentId: int("tournamentId").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  performerType: varchar("performerType", { length: 50 }), // null means "Any Type"
  requiredCount: int("requiredCount").notNull(), // How many performers of this type are required
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TournamentRosterRequirement = typeof tournamentRosterRequirements.$inferSelect;
export type InsertTournamentRosterRequirement = typeof tournamentRosterRequirements.$inferInsert;

/**
 * Tournament entries (users who joined tournaments)
 * Note: Each entry can have multiple performers (roster) via tournamentEntryPerformers junction table
 */
export const tournamentEntries = mysqlTable("tournamentEntries", {
  id: int("id").autoincrement().primaryKey(),
  tournamentId: int("tournamentId").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalScore: int("totalScore").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueEntry: unique().on(table.tournamentId, table.userId),
}));

export type TournamentEntry = typeof tournamentEntries.$inferSelect;
export type InsertTournamentEntry = typeof tournamentEntries.$inferInsert;

/**
 * Tournament entry performers (junction table for roster)
 * Links tournament entries to multiple performers (the user's selected roster)
 */
export const tournamentEntryPerformers = mysqlTable("tournamentEntryPerformers", {
  id: int("id").autoincrement().primaryKey(),
  entryId: int("entryId").notNull().references(() => tournamentEntries.id, { onDelete: "cascade" }),
  performerId: int("performerId").notNull().references(() => performers.id, { onDelete: "cascade" }),
  nftTokenId: varchar("nftTokenId", { length: 78 }).notNull(), // The specific NFT token ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniquePerformer: unique().on(table.entryId, table.performerId),
}));

export type TournamentEntryPerformer = typeof tournamentEntryPerformers.$inferSelect;
export type InsertTournamentEntryPerformer = typeof tournamentEntryPerformers.$inferInsert;

/**
 * User NFT inventory cache (to avoid constant blockchain queries)
 */
export const userNftInventory = mysqlTable("userNftInventory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  performerId: int("performerId").notNull().references(() => performers.id, { onDelete: "cascade" }),
  contractAddress: varchar("contractAddress", { length: 42 }).notNull(),
  tokenId: varchar("tokenId", { length: 78 }).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueNft: unique().on(table.userId, table.contractAddress, table.tokenId),
}));

export type UserNftInventory = typeof userNftInventory.$inferSelect;
export type InsertUserNftInventory = typeof userNftInventory.$inferInsert;

/**
 * Transactions table for tracking all crypto payments and payouts
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  tournamentId: int("tournamentId").references(() => tournaments.id, { onDelete: "set null" }),
  type: mysqlEnum("type", ["entry_fee", "prize_payout", "refund"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  tokenAddress: varchar("tokenAddress", { length: 42 }), // null = native MATIC
  txHash: varchar("txHash", { length: 66 }).notNull().unique(), // Blockchain transaction hash
  fromAddress: varchar("fromAddress", { length: 42 }).notNull(),
  toAddress: varchar("toAddress", { length: 42 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  blockNumber: int("blockNumber"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

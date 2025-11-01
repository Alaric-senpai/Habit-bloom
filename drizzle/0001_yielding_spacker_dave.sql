CREATE TABLE `user_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`userId` integer NOT NULL,
	`questionKey` text NOT NULL,
	`answer` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`userId` integer NOT NULL,
	`key` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`icon` text DEFAULT '🏆',
	`points` integer DEFAULT 10,
	`achievedAt` integer DEFAULT '"2025-11-01T13:07:32.296Z"',
	`type` text DEFAULT 'misc',
	`linkedHabitId` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`linkedHabitId`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_achievements`("id", "createdAt", "updatedAt", "userId", "key", "title", "description", "icon", "points", "achievedAt", "type", "linkedHabitId") SELECT "id", "createdAt", "updatedAt", "userId", "key", "title", "description", "icon", "points", "achievedAt", "type", "linkedHabitId" FROM `achievements`;--> statement-breakpoint
DROP TABLE `achievements`;--> statement-breakpoint
ALTER TABLE `__new_achievements` RENAME TO `achievements`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_key_unique` ON `achievements` (`key`);--> statement-breakpoint
CREATE TABLE `__new_habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`userId` integer NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`category` text DEFAULT 'general',
	`frequency` text DEFAULT 'daily',
	`customFrequency` text DEFAULT '',
	`startTime` text DEFAULT '',
	`endTime` text DEFAULT '',
	`startDate` integer DEFAULT '"2025-11-01T13:07:32.295Z"',
	`endDate` integer DEFAULT '"1970-01-01T00:00:00.000Z"',
	`inCalendar` integer DEFAULT false,
	`goalPerDay` integer DEFAULT 1,
	`totalCompletions` integer DEFAULT 0,
	`currentStreak` integer DEFAULT 0,
	`longestStreak` integer DEFAULT 0,
	`lastCompletedAt` integer DEFAULT '"1970-01-01T00:00:00.000Z"',
	`colorTag` text DEFAULT '#A78BFA',
	`icon` text DEFAULT '✨',
	`visibility` text DEFAULT 'private',
	`difficulty` text DEFAULT 'medium',
	`rewardTag` text DEFAULT '',
	`locationTag` text DEFAULT '',
	`isArchived` integer DEFAULT false,
	`isPaused` integer DEFAULT false,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_habits`("id", "createdAt", "updatedAt", "userId", "title", "description", "category", "frequency", "customFrequency", "startTime", "endTime", "startDate", "endDate", "inCalendar", "goalPerDay", "totalCompletions", "currentStreak", "longestStreak", "lastCompletedAt", "colorTag", "icon", "visibility", "difficulty", "rewardTag", "locationTag", "isArchived", "isPaused") SELECT "id", "createdAt", "updatedAt", "userId", "title", "description", "category", "frequency", "customFrequency", "startTime", "endTime", "startDate", "endDate", "inCalendar", "goalPerDay", "totalCompletions", "currentStreak", "longestStreak", "lastCompletedAt", "colorTag", "icon", "visibility", "difficulty", "rewardTag", "locationTag", "isArchived", "isPaused" FROM `habits`;--> statement-breakpoint
DROP TABLE `habits`;--> statement-breakpoint
ALTER TABLE `__new_habits` RENAME TO `habits`;--> statement-breakpoint
CREATE TABLE `__new_moods` (
	`userId` integer NOT NULL,
	`moodLevel` integer NOT NULL,
	`moodLabel` text DEFAULT 'Neutral',
	`note` text DEFAULT '',
	`emoji` text DEFAULT '',
	`energyLevel` integer DEFAULT 5,
	`stressLevel` integer DEFAULT 5,
	`loggedAt` integer DEFAULT '"2025-11-01T13:07:32.326Z"',
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_moods`("userId", "moodLevel", "moodLabel", "note", "emoji", "energyLevel", "stressLevel", "loggedAt", "id", "createdAt", "updatedAt") SELECT "userId", "moodLevel", "moodLabel", "note", "emoji", "energyLevel", "stressLevel", "loggedAt", "id", "createdAt", "updatedAt" FROM `moods`;--> statement-breakpoint
DROP TABLE `moods`;--> statement-breakpoint
ALTER TABLE `__new_moods` RENAME TO `moods`;
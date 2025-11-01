import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "./user.table";
import baseFields from "./shared.fields";

export const habitsTable = sqliteTable("habits", {
  ...baseFields,
  userId: int().notNull().references(() => usersTable.id),

  // Core habit data
  title: text().notNull(),
  description: text().default(""),
  category: text().default("general"),

  // Scheduling
  frequency: text({ enum: ["daily", "hourly", "weekly", "custom", "monthly", "once"] }).default("daily"),
  customFrequency: text().default(""), // e.g. "Mon, Wed, Fri"
  startTime: text().default(""), // HH:mm format
  endTime: text().default(""), // optional cutoff for time-based habits
  startDate: integer({ mode: "timestamp" }).default(new Date()), // first activation date
  endDate: integer({ mode: "timestamp" }).default(new Date(0)), // optional expiry

  inCalendar: integer({mode: 'boolean'}).default(false),
  // Goals and tracking
  goalPerDay: int().default(1),
  totalCompletions: int().default(0),
  currentStreak: int().default(0),
  longestStreak: int().default(0),
  lastCompletedAt: integer({ mode: "timestamp" }).default(new Date(0)),

  // Customization
  colorTag: text().default("#A78BFA"), // accent color
  icon: text().default("✨"),
  visibility: text({ enum: ["private", "friends", "public"] }).default("private"),
  difficulty: text({ enum: ["easy", "medium", "hard"] }).default("medium"),
  rewardTag: text().default(""), // e.g., "Treat yourself", optional motivator
  locationTag: text().default(""), // e.g., "Gym", "Home"

  // State
  isArchived: int({ mode: "boolean" }).default(false),
  isPaused: int({ mode: "boolean" }).default(false),
});

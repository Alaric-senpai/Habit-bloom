import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "./user.table";
import baseFields from "./shared.fields";
import { habitsTable } from "./habits.table";

export const achievementsTable = sqliteTable("achievements", {
  ...baseFields,
  userId: int().notNull().references(() => usersTable.id),

  key: text().notNull().unique(), // e.g., "7_DAY_STREAK"
  title: text().notNull(), // e.g., "Week Warrior"
  description: text().default(""),
  icon: text().default("🏆"),
  points: int().default(10), // XP or reward points

  achievedAt: integer({ mode: "timestamp" }).default(new Date()),
  type: text({ enum: ["streak", "completion", "habit_count", "mood", "misc"] }).default("misc"),
  linkedHabitId: int().references(() => habitsTable.id), // optional relation
});

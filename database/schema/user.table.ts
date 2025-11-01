// users.schema.ts
import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import baseFields from "./shared.fields";
import { sql } from "drizzle-orm";

export const usersTable = sqliteTable("users", {
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatarUrl").default(""),

  bio: text("bio").default(""),
  timezone: text("timezone").default("UTC"),
  joinedAt: integer({ mode: "timestamp" }).default(sql`(strftime('%s','now'))`),

  totalHabitsCreated: int().default(0),
  totalCompletions: int().default(0),
  streakLongest: int().default(0),
  streakCurrent: int().default(0),

  theme: text("theme").default("light"),
  notificationsEnabled: int({ mode: "boolean" }).default(true),

  ...baseFields,
});

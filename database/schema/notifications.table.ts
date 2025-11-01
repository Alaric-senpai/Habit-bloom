import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "./user.table";
import { habitsTable } from "./habits.table";
import baseFields from "./shared.fields";

export const notificationsTable = sqliteTable("notifications", {
  ...baseFields,
  userId: int().notNull().references(() => usersTable.id),
  habitId: int().references(() => habitsTable.id), // optional if linked to a specific habit

  title: text().notNull(), // e.g., "Time to code JavaScript!"
  message: text().default(""),
  type: text({ enum: ["reminder", "achievement", "system", "streak", "custom"] }).default("reminder"),
  
  scheduledFor: integer({ mode: "timestamp" }).notNull(), // when it should trigger
  sentAt: integer({ mode: "timestamp" }).default(new Date(0)),
  delivered: int({ mode: "boolean" }).default(false),
  read: int({ mode: "boolean" }).default(false),
  openedAt: integer({ mode: "timestamp" }).default(new Date(0)),

  channel: text({enum: ['local', 'push', 'email']}).default("local"), // e.g., "local", "push", "email"
});

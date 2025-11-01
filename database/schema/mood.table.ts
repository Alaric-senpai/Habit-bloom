import { int, sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import baseFields from "./shared.fields";
import { usersTable } from "./user.table";

export const moodsTable = sqliteTable("moods", {
  userId: int().notNull().references(() => usersTable.id),

  // Mood data
  moodLevel: int().notNull(),
moodLabel: text({
  enum: [
    // Positive / Energized
    "Happy",
    "Relaxed",
    "Motivated",
    "Focused",
    "Grateful",
    "Calm",
    "Excited",
    "Confident",
    "Proud",
    "Content",
    "Inspired",
    "Optimistic",
    "Loved",

    // Neutral / Mixed
    "Neutral",
    "Reflective",
    "Bored",
    "Indifferent",

    // Negative / Low energy
    "Tired",
    "Sad",
    "Anxious",
    "Angry",
    "Stressed",
    "Overwhelmed",
    "Lonely",
    "Frustrated",
    "Disappointed",
    "Guilty",
    "Worried",
  ],
}).default("Neutral"),

  note: text().default(""), // optional reflection
  emoji: text().default(""), // e.g., 😀 😔 😤

  // Analytics
  energyLevel: int().default(5), // optional 1–10 scale
  stressLevel: int().default(5), // optional 1–10 scale

  // Timestamp for when the mood was logged
  loggedAt: integer({ mode: "timestamp" }).default(new Date()),

  ...baseFields,
});

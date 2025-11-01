import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./user.table";
import baseFields from "./shared.fields";

export const userAnswersTable = sqliteTable("user_answers", {
  ...baseFields,
  userId: int().notNull().references(() => usersTable.id),
  questionKey: text().notNull(),  // e.g. "exercise_frequency"
  answer: text().notNull(),
});

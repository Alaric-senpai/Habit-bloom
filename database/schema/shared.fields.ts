// shared.fields.ts
import { int, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const baseFields = {
  id: int().primaryKey({ autoIncrement: true }),
  createdAt: integer({ mode: "timestamp" })
    .default(sql`(strftime('%s','now'))`)
    .notNull(),
  updatedAt: integer({ mode: "timestamp" })
    .default(sql`(strftime('%s','now'))`)
    .notNull()
};

export default baseFields;

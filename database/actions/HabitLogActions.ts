import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { db, schema } from "@/database/calldb";
import {
  createHabitLogSchema,
  updateHabitLogSchema,
  type CreateHabitLogSchemaType,
  type UpdateHabitLogSchemaType,
} from "@/types";
import { HabitActions } from "./HabitActions";

export class HabitLogActions {
  private habitActions = new HabitActions();

  /**
   * Create habit log
   */
  async createLog(data: CreateHabitLogSchemaType) {
    const parsed = createHabitLogSchema.parse(data);

    const [log] = await db()
      .insert(schema.habitLogsTable)
      .values(parsed)
      .returning();

    // If completed, update habit stats
    if (log.status === "completed") {
      await this.habitActions.incrementCompletions(log.habitId);

      // Update user total completions
      await db()
        .update(schema.usersTable)
        .set({
          totalCompletions: sql`${schema.usersTable.totalCompletions} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.usersTable.id, log.userId));
    }

    return log;
  }

  /**
   * Get logs for a habit
   */
  async getHabitLogs(habitId: number, userId: number, limit: number = 30) {
    return await db()
      .select()
      .from(schema.habitLogsTable)
      .where(
        and(
          eq(schema.habitLogsTable.habitId, habitId),
          eq(schema.habitLogsTable.userId, userId)
        )
      )
      .orderBy(desc(schema.habitLogsTable.logDate))
      .limit(limit)
      .all();
  }

  /**
   * Get logs for a date range
   */
  async getLogsByDateRange(userId: number, startDate: Date, endDate: Date) {
    return await db()
      .select()
      .from(schema.habitLogsTable)
      .where(
        and(
          eq(schema.habitLogsTable.userId, userId),
          gte(schema.habitLogsTable.logDate, startDate),
          lte(schema.habitLogsTable.logDate, endDate)
        )
      )
      .orderBy(desc(schema.habitLogsTable.logDate))
      .all();
  }

  /**
   * Get today's logs
   */
  async getTodaysLogs(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.getLogsByDateRange(userId, today, tomorrow);
  }

  /**
   * Get log by ID
   */
  async getLogById(logId: number, userId: number) {
    const log = await db()
      .select()
      .from(schema.habitLogsTable)
      .where(
        and(
          eq(schema.habitLogsTable.id, logId),
          eq(schema.habitLogsTable.userId, userId)
        )
      )
      .get();

    if (!log) {
      throw new Error("Log not found");
    }

    return log;
  }

  /**
   * Update log
   */
  async updateLog(logId: number, userId: number, data: UpdateHabitLogSchemaType) {
    const parsed = updateHabitLogSchema.parse(data);

    await db()
      .update(schema.habitLogsTable)
      .set({ ...parsed, updatedAt: new Date() })
      .where(
        and(
          eq(schema.habitLogsTable.id, logId),
          eq(schema.habitLogsTable.userId, userId)
        )
      );

    return await this.getLogById(logId, userId);
  }

  /**
   * Delete log
   */
  async deleteLog(logId: number, userId: number) {
    await db()
      .delete(schema.habitLogsTable)
      .where(
        and(
          eq(schema.habitLogsTable.id, logId),
          eq(schema.habitLogsTable.userId, userId)
        )
      );

    return { success: true };
  }

  /**
   * Get completion stats
   */
  async getCompletionStats(userId: number, habitId?: number) {
    let query = db()
      .select()
      .from(schema.habitLogsTable)
      .where(eq(schema.habitLogsTable.userId, userId));

    if (habitId) {
      query = db()
        .select()
        .from(schema.habitLogsTable)
        .where(
          and(
            eq(schema.habitLogsTable.userId, userId),
            eq(schema.habitLogsTable.habitId, habitId)
          )
        );
    }

    const logs = await query.all();

    const completed = logs.filter((l) => l.status === "completed").length;
    const missed = logs.filter((l) => l.status === "missed").length;
    const pending = logs.filter((l) => l.status === "pending").length;
    const total = logs.length;

    return {
      completed,
      missed,
      pending,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Check if habit was logged today
   */
  async isLoggedToday(habitId: number, userId: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const log = await db()
      .select()
      .from(schema.habitLogsTable)
      .where(
        and(
          eq(schema.habitLogsTable.habitId, habitId),
          eq(schema.habitLogsTable.userId, userId),
          gte(schema.habitLogsTable.logDate, today),
          lte(schema.habitLogsTable.logDate, tomorrow)
        )
      )
      .get();

    return !!log;
  }

  /**
   * Get log for specific date
   */
  async getLogForDate(habitId: number, userId: number, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db()
      .select()
      .from(schema.habitLogsTable)
      .where(
        and(
          eq(schema.habitLogsTable.habitId, habitId),
          eq(schema.habitLogsTable.userId, userId),
          gte(schema.habitLogsTable.logDate, startOfDay),
          lte(schema.habitLogsTable.logDate, endOfDay)
        )
      )
      .get();
  }

  /**
   * Get streak data for calendar view
   */
  async getStreakCalendar(habitId: number, userId: number, days: number = 90) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.getLogsByDateRange(userId, startDate, endDate);
    const habitLogs = logs.filter(log => log.habitId === habitId);

    const calendar: Record<string, { status: string; note?: string, mood?:string, }> = {};
    
    habitLogs.forEach(log => {
      const dateKey = new Date(log.logDate).toISOString().split('T')[0];
      calendar[dateKey] = {
        status: log.status,
        mood: log.mood ?? undefined,
        note: log.note ?? undefined,
      };
    });

    return calendar;
  }

  /**
   * Get logs with mood data
   */
  async getLogsWithMood(userId: number, limit: number = 30) {
    const logs = await db()
      .select()
      .from(schema.habitLogsTable)
      .where(
        and(
          eq(schema.habitLogsTable.userId, userId),
          sql`${schema.habitLogsTable.mood} != ''`
        )
      )
      .orderBy(desc(schema.habitLogsTable.logDate))
      .limit(limit)
      .all();

    return logs;
  }

  /**
   * Bulk create logs (for initialization or catch-up)
   */
  async bulkCreateLogs(logs: CreateHabitLogSchemaType[]) {
    const parsed = logs.map(log => createHabitLogSchema.parse(log));

    const created = await db()
      .insert(schema.habitLogsTable)
      .values(parsed)
      .returning();

    return created;
  }

  /**
   * Get completion rate for date range
   */
  async getCompletionRateForPeriod(
    userId: number,
    startDate: Date,
    endDate: Date,
    habitId?: number
  ) {
    let query = db()
      .select()
      .from(schema.habitLogsTable)
      .where(
        and(
          eq(schema.habitLogsTable.userId, userId),
          gte(schema.habitLogsTable.logDate, startDate),
          lte(schema.habitLogsTable.logDate, endDate)
        )
      );

    if (habitId) {
      query = db()
        .select()
        .from(schema.habitLogsTable)
        .where(
          and(
            eq(schema.habitLogsTable.userId, userId),
            eq(schema.habitLogsTable.habitId, habitId),
            gte(schema.habitLogsTable.logDate, startDate),
            lte(schema.habitLogsTable.logDate, endDate)
          )
        );
    }

    const logs = await query.all();
    const completed = logs.filter(l => l.status === 'completed').length;
    const total = logs.length;

    return {
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }
}
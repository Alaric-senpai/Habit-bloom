import { eq, and, desc, sql } from "drizzle-orm";
import { db, schema } from "@/database/calldb";
import {
  createHabitSchema,
  updateHabitSchema,
  type CreateHabitSchemaType,
  type UpdateHabitSchemaType,
} from "@/types";

export class HabitActions {
  /**
   * Create new habit
   */
  async createHabit(data: CreateHabitSchemaType) {
    const parsed = createHabitSchema.parse(data);

    const [habit] = await db()
      .insert(schema.habitsTable)
      .values(parsed)
      .returning();

    // Update user stats
    await db()
      .update(schema.usersTable)
      .set({
        totalHabitsCreated: sql`${schema.usersTable.totalHabitsCreated} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.usersTable.id, data.userId));

    return habit;
  }

  /**
   * Get all habits for user
   */
  async getHabits(userId: number, includeArchived: boolean = false) {
    const conditions = [eq(schema.habitsTable.userId, userId)];
    
    if (!includeArchived) {
      conditions.push(eq(schema.habitsTable.isArchived, false));
    }

    return await db()
      .select()
      .from(schema.habitsTable)
      .where(and(...conditions))
      .orderBy(desc(schema.habitsTable.createdAt))
      .all();
  }

  /**
   * Get habit by ID
   */
  async getHabitById(habitId: number, userId: number) {
    const habit = await db()
      .select()
      .from(schema.habitsTable)
      .where(
        and(
          eq(schema.habitsTable.id, habitId),
          eq(schema.habitsTable.userId, userId)
        )
      )
      .get();

    if (!habit) {
      throw new Error("Habit not found");
    }

    return habit;
  }

  /**
   * Update habit
   */
  async updateHabit(habitId: number, userId: number, data: UpdateHabitSchemaType) {
    const parsed = updateHabitSchema.parse(data);

    await db()
      .update(schema.habitsTable)
      .set({ ...parsed, updatedAt: new Date() })
      .where(
        and(
          eq(schema.habitsTable.id, habitId),
          eq(schema.habitsTable.userId, userId)
        )
      );

    return await this.getHabitById(habitId, userId);
  }

  /**
   * Delete habit (soft delete by archiving)
   */
  async deleteHabit(habitId: number, userId: number) {
    await db()
      .update(schema.habitsTable)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(
        and(
          eq(schema.habitsTable.id, habitId),
          eq(schema.habitsTable.userId, userId)
        )
      );

    return { success: true };
  }

  /**
   * Hard delete habit
   */
  async hardDeleteHabit(habitId: number, userId: number) {
    await db()
      .delete(schema.habitsTable)
      .where(
        and(
          eq(schema.habitsTable.id, habitId),
          eq(schema.habitsTable.userId, userId)
        )
      );

    return { success: true };
  }

  /**
   * Toggle pause state
   */
  async togglePause(habitId: number, userId: number) {
    const habit = await this.getHabitById(habitId, userId);

    await db()
      .update(schema.habitsTable)
      .set({ isPaused: !habit.isPaused, updatedAt: new Date() })
      .where(eq(schema.habitsTable.id, habitId));

    return { isPaused: !habit.isPaused };
  }

  /**
   * Update streak
   */
  async updateStreak(habitId: number, userId: number, streak: number) {
    const habit = await this.getHabitById(habitId, userId);

    await db()
      .update(schema.habitsTable)
      .set({
        currentStreak: streak,
        longestStreak: Math.max(streak, habit.longestStreak || 0),
        lastCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.habitsTable.id, habitId));

    return { success: true };
  }

  /**
   * Increment completions
   */
  async incrementCompletions(habitId: number) {
    await db()
      .update(schema.habitsTable)
      .set({
        totalCompletions: sql`${schema.habitsTable.totalCompletions} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.habitsTable.id, habitId));

    return { success: true };
  }

  /**
   * Get habits by category
   */
  async getHabitsByCategory(userId: number, category: string) {
    return await db()
      .select()
      .from(schema.habitsTable)
      .where(
        and(
          eq(schema.habitsTable.userId, userId),
          eq(schema.habitsTable.category, category),
          eq(schema.habitsTable.isArchived, false)
        )
      )
      .all();
  }

  /**
   * Get active habits (not paused, not archived)
   */
  async getActiveHabits(userId: number) {
    return await db()
      .select()
      .from(schema.habitsTable)
      .where(
        and(
          eq(schema.habitsTable.userId, userId),
          eq(schema.habitsTable.isArchived, false),
          eq(schema.habitsTable.isPaused, false)
        )
      )
      .orderBy(desc(schema.habitsTable.createdAt))
      .all();
  }

  /**
   * Get habits due today
   */
  async getHabitsDueToday(userId: number) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const habits = await this.getActiveHabits(userId);

    return habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly' &&  habit.customFrequency &&habit.customFrequency.includes(today.substring(0, 3))) {
        return true;
      }
      return false;
    });
  }

  /**
   * Archive multiple habits
   */
  async archiveMultiple(userId: number, habitIds: number[]) {
    await db()
      .update(schema.habitsTable)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(
        and(
          eq(schema.habitsTable.userId, userId),
          sql`${schema.habitsTable.id} IN ${habitIds}`
        )
      );

    return { success: true, archived: habitIds.length };
  }
}
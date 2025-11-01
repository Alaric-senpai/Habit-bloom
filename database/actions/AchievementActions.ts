// @ts-nocheck
import { eq, and, desc } from "drizzle-orm";
import { db, schema } from "@/database/calldb";
import {
  createAchievementSchema,
  type CreateAchievementSchemaType,
} from "@/types";

export class AchievementActions {
  /**
   * Unlock achievement
   */
  async unlockAchievement(data: CreateAchievementSchemaType) {
    const parsed = createAchievementSchema.parse(data);

    // Check if already unlocked
    const existing = await db()
      .select()
      .from(schema.achievementsTable)
      .where(
        and(
          eq(schema.achievementsTable.userId, parsed.userId),
          eq(schema.achievementsTable.key, parsed.key)
        )
      )
      .get();

    if (existing) {
      return existing; // Already unlocked, return existing
    }

    // Create new achievement
    const [achievement] = await db()
      .insert(schema.achievementsTable)
      .values(parsed)
      .returning();

    return achievement;
  }

  /**
   * Get user achievements
   */
  async getAchievements(userId: number) {
    return await db()
      .select()
      .from(schema.achievementsTable)
      .where(eq(schema.achievementsTable.userId, userId))
      .orderBy(desc(schema.achievementsTable.achievedAt))
      .all();
  }

  /**
   * Get achievement by ID
   */
  async getAchievementById(achievementId: number, userId: number) {
    const achievement = await db()
      .select()
      .from(schema.achievementsTable)
      .where(
        and(
          eq(schema.achievementsTable.id, achievementId),
          eq(schema.achievementsTable.userId, userId)
        )
      )
      .get();

    if (!achievement) {
      throw new Error("Achievement not found");
    }

    return achievement;
  }

  /**
   * Get achievements by type
   */
  async getAchievementsByType(
    userId: number, 
    type: "streak" | "completion" | "habit_count" | "mood" | "misc"
  ) {
    return await db()
      .select()
      .from(schema.achievementsTable)
      .where(
        and(
          eq(schema.achievementsTable.userId, userId),
          eq(schema.achievementsTable.type, type)
        )
      )
      .orderBy(desc(schema.achievementsTable.achievedAt))
      .all();
  }

  /**
   * Get achievements by habit
   */
  async getAchievementsByHabit(userId: number, habitId: number) {
    return await db()
      .select()
      .from(schema.achievementsTable)
      .where(
        and(
          eq(schema.achievementsTable.userId, userId),
          eq(schema.achievementsTable.linkedHabitId, habitId)
        )
      )
      .orderBy(desc(schema.achievementsTable.achievedAt))
      .all();
  }

  /**
   * Get recent achievements
   */
  async getRecentAchievements(userId: number, limit: number = 5) {
    return await db()
      .select()
      .from(schema.achievementsTable)
      .where(eq(schema.achievementsTable.userId, userId))
      .orderBy(desc(schema.achievementsTable.achievedAt))
      .limit(limit)
      .all();
  }

  /**
   * Check if achievement is unlocked
   */
  async isAchievementUnlocked(userId: number, key: string): Promise<boolean> {
    const achievement = await db()
      .select()
      .from(schema.achievementsTable)
      .where(
        and(
          eq(schema.achievementsTable.userId, userId),
          eq(schema.achievementsTable.key, key)
        )
      )
      .get();

    return !!achievement;
  }

  /**
   * Get total points
   */
  async getTotalPoints(userId: number): Promise<number> {
    const achievements = await this.getAchievements(userId);
    return achievements.reduce((sum, a) => sum + a.points, 0);
  }

  /**
   * Get achievement count
   */
  async getAchievementCount(userId: number): Promise<number> {
    const achievements = await this.getAchievements(userId);
    return achievements.length;
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(userId: number) {
    const achievements = await this.getAchievements(userId);
    
    const byType = {
      streak: achievements.filter(a => a.type === 'streak').length,
      completion: achievements.filter(a => a.type === 'completion').length,
      habit_count: achievements.filter(a => a.type === 'habit_count').length,
      mood: achievements.filter(a => a.type === 'mood').length,
      misc: achievements.filter(a => a.type === 'misc').length,
    };

    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const avgPoints = achievements.length > 0 ? totalPoints / achievements.length : 0;

    return {
      total: achievements.length,
      totalPoints,
      avgPoints: Math.round(avgPoints),
      byType,
      latest: achievements[0] || null,
    };
  }

  /**
   * Delete achievement
   */
  async deleteAchievement(achievementId: number, userId: number) {
    await db()
      .delete(schema.achievementsTable)
      .where(
        and(
          eq(schema.achievementsTable.id, achievementId),
          eq(schema.achievementsTable.userId, userId)
        )
      );

    return { success: true };
  }

  /**
   * Get achievements unlocked this week
   */
  async getAchievementsThisWeek(userId: number) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const achievements = await this.getAchievements(userId);
    return achievements.filter(a => new Date(a.achievedAt) >= weekAgo);
  }

  /**
   * Get achievements unlocked this month
   */
  async getAchievementsThisMonth(userId: number) {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const achievements = await this.getAchievements(userId);
    return achievements.filter(a => new Date(a.achievedAt) >= monthAgo);
  }

  /**
   * Get achievement progress (for display)
   */
  async getAchievementProgress(userId: number) {
    const achievements = await this.getAchievements(userId);
    
    // Define all possible achievements
    const allAchievements = [
      // Streak achievements
      { key: '7_DAY_STREAK', title: 'Week Warrior', points: 50, type: 'streak' },
      { key: '30_DAY_STREAK', title: 'Monthly Master', points: 200, type: 'streak' },
      { key: '100_DAY_STREAK', title: 'Centurion', points: 1000, type: 'streak' },
      { key: '365_DAY_STREAK', title: 'Year Champion', points: 5000, type: 'streak' },
      
      // Completion achievements
      { key: '50_COMPLETIONS', title: 'Getting Started', points: 100, type: 'completion' },
      { key: '500_COMPLETIONS', title: 'Habit Hero', points: 500, type: 'completion' },
      { key: '1000_COMPLETIONS', title: 'Master of Habits', points: 2000, type: 'completion' },
      
      // Habit count achievements
      { key: '5_HABITS_CREATED', title: 'Building Momentum', points: 25, type: 'habit_count' },
      { key: '10_HABITS_CREATED', title: 'Habit Collector', points: 75, type: 'habit_count' },
      { key: '25_HABITS_CREATED', title: 'Habit Master', points: 250, type: 'habit_count' },
      
      // Mood achievements
      { key: '30_MOODS_LOGGED', title: 'Emotional Awareness', points: 100, type: 'mood' },
      { key: '100_MOODS_LOGGED', title: 'Mood Tracker', points: 300, type: 'mood' },
    ];

    const unlockedKeys = new Set(achievements.map(a => a.key));

    return allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedKeys.has(achievement.key),
      unlockedAt: achievements.find(a => a.key === achievement.key)?.achievedAt,
    }));
  }

  /**
   * Bulk unlock achievements
   */
  async bulkUnlockAchievements(achievements: CreateAchievementSchemaType[]) {
    const results = [];

    for (const achievement of achievements) {
      const result = await this.unlockAchievement(achievement);
      results.push(result);
    }

    return results;
  }

  /**
   * Get achievements leaderboard (for future social features)
   */
  async getLeaderboardPosition(userId: number) {
    const userPoints = await this.getTotalPoints(userId);
    const userCount = await this.getAchievementCount(userId);

    return {
      userId,
      totalPoints: userPoints,
      totalAchievements: userCount,
    };
  }
}
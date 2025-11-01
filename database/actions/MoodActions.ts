import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db, schema } from "@/database/calldb";
import {
  createMoodSchema,
  updateMoodSchema,
  type CreateMoodSchemaType,
  type UpdateMoodSchemaType,
} from "@/types";

export class MoodActions {
  /**
   * Log mood
   */
  async logMood(data: CreateMoodSchemaType) {
    const parsed = createMoodSchema.parse(data);

    const [mood] = await db()
      .insert(schema.moodsTable)
      .values(parsed)
      .returning();

    return mood;
  }

  /**
   * Get mood history
   */
  async getMoodHistory(userId: number, limit: number = 30) {
    return await db()
      .select()
      .from(schema.moodsTable)
      .where(eq(schema.moodsTable.userId, userId))
      .orderBy(desc(schema.moodsTable.loggedAt))
      .limit(limit)
      .all();
  }

  /**
   * Get moods by date range
   */
  async getMoodsByDateRange(userId: number, startDate: Date, endDate: Date) {
    return await db()
      .select()
      .from(schema.moodsTable)
      .where(
        and(
          eq(schema.moodsTable.userId, userId),
          gte(schema.moodsTable.loggedAt, startDate),
          lte(schema.moodsTable.loggedAt, endDate)
        )
      )
      .orderBy(desc(schema.moodsTable.loggedAt))
      .all();
  }

  /**
   * Get mood today
   */
  async getTodaysMood(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await db()
      .select()
      .from(schema.moodsTable)
      .where(
        and(
          eq(schema.moodsTable.userId, userId),
          gte(schema.moodsTable.loggedAt, today)
        )
      )
      .orderBy(desc(schema.moodsTable.loggedAt))
      .get();
  }

  /**
   * Get mood by ID
   */
  async getMoodById(moodId: number, userId: number) {
    const mood = await db()
      .select()
      .from(schema.moodsTable)
      .where(
        and(
          eq(schema.moodsTable.id, moodId),
          eq(schema.moodsTable.userId, userId)
        )
      )
      .get();

    if (!mood) {
      throw new Error("Mood not found");
    }

    return mood;
  }

  /**
   * Update mood
   */
  async updateMood(moodId: number, userId: number, data: UpdateMoodSchemaType) {
    const parsed = updateMoodSchema.parse(data);

    await db()
      .update(schema.moodsTable)
      .set({ ...parsed, updatedAt: new Date() })
      .where(
        and(
          eq(schema.moodsTable.id, moodId),
          eq(schema.moodsTable.userId, userId)
        )
      );

    return await this.getMoodById(moodId, userId);
  }

  /**
   * Delete mood
   */
  async deleteMood(moodId: number, userId: number) {
    await db()
      .delete(schema.moodsTable)
      .where(
        and(
          eq(schema.moodsTable.id, moodId),
          eq(schema.moodsTable.userId, userId)
        )
      );

    return { success: true };
  }

  /**
   * Get mood statistics
   */
  async getMoodStats(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await this.getMoodsByDateRange(userId, startDate, new Date());

    if (moods.length === 0) {
      return {
        avgMoodLevel: 0,
        avgEnergyLevel: 0,
        avgStressLevel: 0,
        totalLogs: 0,
        period: `${days} days`,
        mostCommonMood: null,
      };
    }

    const avgMoodLevel =
      moods.reduce((sum, m) => sum + m.moodLevel, 0) / moods.length;
    const avgEnergyLevel =
      moods.reduce((sum, m) => sum + (m.energyLevel ?? 0), 0) / moods.length;
    const avgStressLevel =
      moods.reduce((sum, m) => sum + (m.stressLevel ?? 0), 0) / moods.length;

    // Find most common mood
    const moodCounts: Record<string, number> = {};
    for (const m of moods) {
      let label = m.moodLabel;
      if (!label) {
        continue;
      }
      moodCounts[label] = (moodCounts[label] || 0) + 1;
    }
    const mostCommonMoodEntry = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    const mostCommonMood = mostCommonMoodEntry ? mostCommonMoodEntry[0] : null;

    return {
      avgMoodLevel: Math.round(avgMoodLevel * 10) / 10,
      avgEnergyLevel: Math.round(avgEnergyLevel * 10) / 10,
      avgStressLevel: Math.round(avgStressLevel * 10) / 10,
      totalLogs: moods.length,
      period: `${days} days`,
      mostCommonMood,
    };
  }

  /**
   * Get mood trends (daily averages)
   */
  async getMoodTrends(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await this.getMoodsByDateRange(userId, startDate, new Date());

    // Group by date
    const dailyMoods: Record<string, typeof moods> = {};
    moods.forEach(mood => {
      let dateKey = new Date(mood.loggedAt || mood.createdAt).toISOString().split('T')[0];
      if (!dailyMoods[dateKey]) {
        dailyMoods[dateKey] = [];
      }
      dailyMoods[dateKey].push(mood);
    });

    // Calculate daily averages
    const trends = Object.entries(dailyMoods).map(([date, dayMoods]) => ({
      date,
      avgMoodLevel: dayMoods.reduce((sum, m) => sum + m.moodLevel, 0) / dayMoods.length,
      avgEnergyLevel: dayMoods.reduce((sum, m) => sum + (m.energyLevel ?? 0), 0) / dayMoods.length,
      avgStressLevel: dayMoods.reduce((sum, m) => sum + (m.stressLevel ?? 0 ), 0) / dayMoods.length,
      count: dayMoods.length,
    }));

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get mood distribution
   */
  async getMoodDistribution(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await this.getMoodsByDateRange(userId, startDate, new Date());

    const distribution: Record<string, number> = {};

    for(let mood of moods) {
        let label = mood.moodLabel;
        if(!label){
            continue;
        }
        distribution[label] = (distribution[label] || 0) + 1;
    }



    return Object.entries(distribution)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / moods.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Check if mood logged today
   */
  async isMoodLoggedToday(userId: number): Promise<boolean> {
    const todaysMood = await this.getTodaysMood(userId);
    return !!todaysMood;
  }

  /**
   * Get mood for specific date
   */
  async getMoodForDate(userId: number, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db()
      .select()
      .from(schema.moodsTable)
      .where(
        and(
          eq(schema.moodsTable.userId, userId),
          gte(schema.moodsTable.loggedAt, startOfDay),
          lte(schema.moodsTable.loggedAt, endOfDay)
        )
      )
      .orderBy(desc(schema.moodsTable.loggedAt))
      .get();
  }

  /**
   * Get best and worst days
   */
  async getBestAndWorstDays(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await this.getMoodsByDateRange(userId, startDate, new Date());

    if (moods.length === 0) {
      return { bestDay: null, worstDay: null };
    }

    const sortedByMood = [...moods].sort((a, b) => b.moodLevel - a.moodLevel);

    return {
      bestDay: {
        date: sortedByMood[0].loggedAt,
        moodLevel: sortedByMood[0].moodLevel,
        moodLabel: sortedByMood[0].moodLabel,
        note: sortedByMood[0].note,
      },
      worstDay: {
        date: sortedByMood[sortedByMood.length - 1].loggedAt,
        moodLevel: sortedByMood[sortedByMood.length - 1].moodLevel,
        moodLabel: sortedByMood[sortedByMood.length - 1].moodLabel,
        note: sortedByMood[sortedByMood.length - 1].note,
      },
    };
  }

  /**
   * Get mood insights
   */
  async getMoodInsights(userId: number, days: number = 30) {
    const stats = await this.getMoodStats(userId, days);
    const trends = await this.getMoodTrends(userId, days);
    const distribution = await this.getMoodDistribution(userId, days);
    const bestWorst = await this.getBestAndWorstDays(userId, days);

    return {
      stats,
      trends,
      distribution,
      bestDay: bestWorst.bestDay,
      worstDay: bestWorst.worstDay,
    };
  }
}
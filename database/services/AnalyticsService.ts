import {
  HabitActions,
  HabitLogActions,
  MoodActions,
} from "../actions";

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================
export class AnalyticsService {
  private habitLogActions = new HabitLogActions();
  private moodActions = new MoodActions();
  private habitActions = new HabitActions();

  /**
   * Get comprehensive analytics
   */
  async getAnalytics(userId: number, period: "week" | "month" | "year" = "week") {
    const days = period === "week" ? 7 : period === "month" ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.habitLogActions.getLogsByDateRange(userId, startDate, new Date());
    const moods = await this.moodActions.getMoodsByDateRange(userId, startDate, new Date());
    const habits = await this.habitActions.getActiveHabits(userId);

    // Completion trends
    const completionTrend = this.calculateTrend(logs, days);

    // Mood correlation
    const moodCorrelation = this.calculateMoodCorrelation(logs, moods);

    // Best performing habits
    const habitPerformance = await this.getHabitPerformance(userId, days);

    return {
      period,
      completionTrend,
      moodCorrelation,
      habitPerformance,
      summary: {
        totalCompletions: logs.filter((l) => l.status === "completed").length,
        totalMissed: logs.filter((l) => l.status === "missed").length,
        avgMoodLevel: moods.reduce((sum, m) => sum + m.moodLevel, 0) / (moods.length || 1),
        activeHabits: habits.length,
      },
    };
  }

  private calculateTrend(logs: any[], days: number) {
    const dailyCompletions = new Array(days).fill(0);
    
    logs
      .filter((l) => l.status === "completed")
      .forEach((log) => {
        const daysAgo = Math.floor(
          (Date.now() - new Date(log.logDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysAgo < days) {
          dailyCompletions[days - daysAgo - 1]++;
        }
      });

    return dailyCompletions;
  }

  private calculateMoodCorrelation(logs: any[], moods: any[]) {
    // Calculate average mood on days with completions vs without
    const daysWithCompletions = new Set(
      logs
        .filter((l) => l.status === "completed")
        .map((l) => new Date(l.logDate).toDateString())
    );

    const moodsOnCompletionDays = moods.filter((m) =>
      daysWithCompletions.has(new Date(m.loggedAt).toDateString())
    );

    const moodsOnNonCompletionDays = moods.filter(
      (m) => !daysWithCompletions.has(new Date(m.loggedAt).toDateString())
    );

    const avgWithCompletions =
      moodsOnCompletionDays.reduce((sum, m) => sum + m.moodLevel, 0) /
      (moodsOnCompletionDays.length || 1);

    const avgWithoutCompletions =
      moodsOnNonCompletionDays.reduce((sum, m) => sum + m.moodLevel, 0) /
      (moodsOnNonCompletionDays.length || 1);

    return {
      withCompletions: Math.round(avgWithCompletions * 10) / 10,
      withoutCompletions: Math.round(avgWithoutCompletions * 10) / 10,
      difference: Math.round((avgWithCompletions - avgWithoutCompletions) * 10) / 10,
    };
  }

  private async getHabitPerformance(userId: number, days: number) {
    const habits = await this.habitActions.getHabits(userId, false);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const performance = await Promise.all(
      habits.map(async (habit) => {
        const logs = await this.habitLogActions.getHabitLogs(habit.id, userId, days);
        const completed = logs.filter((l) => l.status === "completed").length;
        const total = logs.length;

        return {
          habitId: habit.id,
          title: habit.title,
          completed,
          total,
          completionRate: total > 0 ? (completed / total) * 100 : 0,
          streak: habit.currentStreak,
        };
      })
    );

    return performance.sort((a, b) => b.completionRate - a.completionRate);
  }
}
export const analyticsService = new AnalyticsService();

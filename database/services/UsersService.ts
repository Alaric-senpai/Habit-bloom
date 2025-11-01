import {
  UserActions,
  HabitActions,
  HabitLogActions,
  MoodActions,
  NotificationActions,
  AchievementActions,
  UserAnswerActions,
} from "../actions";

// ============================================================================
// USER SERVICE
// ============================================================================
export class UserService {
  private userActions = new UserActions();
  private habitActions = new HabitActions();
  private achievementActions = new AchievementActions();
  private habitLogActions = new HabitLogActions();

  /**
   * Get user profile with stats
   */
  async getProfile(userId: number) {
    const user = await this.userActions.getUserById(userId);
    const habits = await this.habitActions.getHabits(userId, false);
    const achievements = await this.achievementActions.getAchievements(userId);
    const totalPoints = await this.achievementActions.getTotalPoints(userId);

    return {
      ...user,
      activeHabits: habits.filter((h) => !h.isPaused).length,
      totalAchievements: achievements.length,
      totalPoints,
    };
  }

  /**
   * Calculate and update user streaks
   */
  async updateUserStreaks(userId: number) {
    const habits = await this.habitActions.getActiveHabits(userId);
    let maxStreak = 0;

    for (const habit of habits) {
        let currentStreak = habit.currentStreak
        if(!currentStreak){
            continue
        }
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    }

    await this.userActions.updateStats(userId, {
      streakCurrent: maxStreak,
      streakLongest: Math.max(maxStreak, (await this.userActions.getUserById(userId)).streakLongest),
    });
  }

  /**
   * Get user leaderboard data (for future social features)
   */
  async getLeaderboardPosition(userId: number) {
    const user = await this.userActions.getUserById(userId);
    const totalPoints = await this.achievementActions.getTotalPoints(userId);

    return {
      userId,
      name: user.name,
      totalPoints,
      totalCompletions: user.totalCompletions,
      longestStreak: user.streakLongest,
    };
  }
}
export const userService = new UserService();

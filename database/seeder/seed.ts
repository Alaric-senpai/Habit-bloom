// @ts-ignore
// seed.ts
import { db } from '../calldb';
import { 
  habitsTable, 
  habitLogsTable, 
  moodsTable, 
  notificationsTable, 
  achievementsTable,
  userAnswersTable 
} from '../schema';
import { eq } from 'drizzle-orm';

/**
 * Seed database with comprehensive test data
 * @param userId - The ID of the user to seed data for
 */
export const seedDatabase = async (userId: number) => {
  try {
    console.log('🌱 Starting database seeding...');
    const database = db();

    // ============================================================================
    // 1. SEED USER ANSWERS (Onboarding data)
    // ============================================================================
    const userAnswers = [
      { userId, questionKey: 'primary_goal', answer: 'Build better daily routines' },
      { userId, questionKey: 'exercise_frequency', answer: '3-4 times per week' },
      { userId, questionKey: 'sleep_hours', answer: '6-7 hours' },
      { userId, questionKey: 'stress_level', answer: 'Moderate' },
      { userId, questionKey: 'focus_areas', answer: 'Health, Productivity, Mindfulness' },
      { userId, questionKey: 'morning_routine', answer: 'Yes, but inconsistent' },
      { userId, questionKey: 'biggest_challenge', answer: 'Staying consistent' },
    ];

    await database.insert(userAnswersTable).values(userAnswers);
    console.log('✅ User answers seeded');

    // ============================================================================
    // 2. SEED HABITS (Diverse categories, frequencies, and states)
    // ============================================================================
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const epochZero = new Date(0);

    const habits = [
      // Active daily habits
      {
        userId,
        title: 'Morning Meditation',
        description: '10 minutes of mindfulness to start the day',
        category: 'Mindfulness',
        frequency: 'daily' as const,
        startTime: '06:30',
        startDate: sixtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 45,
        currentStreak: 7,
        longestStreak: 15,
        lastCompletedAt: now,
        colorTag: '#A78BFA',
        icon: '🧘',
        difficulty: 'easy' as const,
        visibility: 'private' as const,
        inCalendar: 1,
        isArchived: 0,
        isPaused: 0,
      },
      {
        userId,
        title: 'Drink Water',
        description: 'Stay hydrated - 8 glasses daily',
        category: 'Health',
        frequency: 'daily' as const,
        startDate: thirtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 8,
        totalCompletions: 180,
        currentStreak: 12,
        longestStreak: 20,
        lastCompletedAt: now,
        colorTag: '#60A5FA',
        icon: '💧',
        difficulty: 'easy' as const,
        visibility: 'private' as const,
        inCalendar: 0,
        isArchived: 0,
        isPaused: 0,
      },
      {
        userId,
        title: 'Code Practice',
        description: 'Practice algorithms and data structures',
        category: 'Learning',
        frequency: 'daily' as const,
        startTime: '19:00',
        endTime: '21:00',
        startDate: sixtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 2,
        totalCompletions: 85,
        currentStreak: 5,
        longestStreak: 18,
        lastCompletedAt: sevenDaysAgo,
        colorTag: '#F59E0B',
        icon: '💻',
        difficulty: 'hard' as const,
        visibility: 'public' as const,
        locationTag: 'Home Office',
        inCalendar: 1,
        isArchived: 0,
        isPaused: 0,
      },
      {
        userId,
        title: 'Gym Workout',
        description: 'Strength training and cardio',
        category: 'Fitness',
        frequency: 'custom' as const,
        customFrequency: 'Mon, Wed, Fri',
        startTime: '06:00',
        startDate: thirtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 18,
        currentStreak: 2,
        longestStreak: 5,
        lastCompletedAt: sevenDaysAgo,
        colorTag: '#EF4444',
        icon: '💪',
        difficulty: 'medium' as const,
        visibility: 'friends' as const,
        locationTag: 'Gym',
        inCalendar: 1,
        isArchived: 0,
        isPaused: 0,
      },
      {
        userId,
        title: 'Read Book',
        description: 'Read for 30 minutes before bed',
        category: 'Learning',
        frequency: 'daily' as const,
        startTime: '21:30',
        startDate: sixtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 38,
        currentStreak: 8,
        longestStreak: 12,
        lastCompletedAt: now,
        colorTag: '#8B5CF6',
        icon: '📚',
        difficulty: 'easy' as const,
        visibility: 'private' as const,
        rewardTag: 'Knowledge is power',
        inCalendar: 1,
        isArchived: 0,
        isPaused: 0,
      },
      // Weekly habits
      {
        userId,
        title: 'Meal Prep Sunday',
        description: 'Prepare meals for the week',
        category: 'Health',
        frequency: 'weekly' as const,
        customFrequency: 'Sun',
        startTime: '10:00',
        startDate: thirtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 4,
        currentStreak: 2,
        longestStreak: 3,
        lastCompletedAt: sevenDaysAgo,
        colorTag: '#10B981',
        icon: '🍱',
        difficulty: 'medium' as const,
        visibility: 'private' as const,
        locationTag: 'Kitchen',
        inCalendar: 1,
        isArchived: 0,
        isPaused: 0,
      },
      {
        userId,
        title: 'Weekly Review',
        description: 'Review goals and plan next week',
        category: 'Productivity',
        frequency: 'weekly' as const,
        customFrequency: 'Fri',
        startTime: '18:00',
        startDate: thirtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 3,
        currentStreak: 1,
        longestStreak: 3,
        lastCompletedAt: sevenDaysAgo,
        colorTag: '#EC4899',
        icon: '📊',
        difficulty: 'medium' as const,
        visibility: 'private' as const,
        inCalendar: 1,
        isArchived: 0,
        isPaused: 0,
      },
      // Paused habit
      {
        userId,
        title: 'Morning Run',
        description: '5K run to start the day',
        category: 'Fitness',
        frequency: 'daily' as const,
        startTime: '05:30',
        startDate: sixtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 22,
        currentStreak: 0,
        longestStreak: 10,
        lastCompletedAt: fourteenDaysAgo,
        colorTag: '#F97316',
        icon: '🏃',
        difficulty: 'hard' as const,
        visibility: 'private' as const,
        locationTag: 'Park',
        inCalendar: 0,
        isArchived: 0,
        isPaused: 1,
      },
      // Archived habit
      {
        userId,
        title: 'Cold Shower',
        description: 'Take a cold shower for energy',
        category: 'Health',
        frequency: 'daily' as const,
        startDate: ninetyDaysAgo,
        endDate: thirtyDaysAgo,
        goalPerDay: 1,
        totalCompletions: 45,
        currentStreak: 0,
        longestStreak: 15,
        lastCompletedAt: thirtyDaysAgo,
        colorTag: '#06B6D4',
        icon: '🚿',
        difficulty: 'hard' as const,
        visibility: 'private' as const,
        inCalendar: 0,
        isArchived: 1,
        isPaused: 0,
      },
      // More diverse habits
      {
        userId,
        title: 'Gratitude Journal',
        description: 'Write 3 things I\'m grateful for',
        category: 'Mindfulness',
        frequency: 'daily' as const,
        startTime: '22:00',
        startDate: thirtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 25,
        currentStreak: 6,
        longestStreak: 11,
        lastCompletedAt: now,
        colorTag: '#F59E0B',
        icon: '✨',
        difficulty: 'easy' as const,
        visibility: 'private' as const,
        rewardTag: 'Cultivate positivity',
        inCalendar: 1,
        isArchived: 0,
        isPaused: 0,
      },
      {
        userId,
        title: 'No Social Media',
        description: 'Avoid social media before 9 AM',
        category: 'Digital Wellness',
        frequency: 'daily' as const,
        startDate: sevenDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 5,
        currentStreak: 3,
        longestStreak: 3,
        lastCompletedAt: now,
        colorTag: '#6366F1',
        icon: '📵',
        difficulty: 'medium' as const,
        visibility: 'private' as const,
        inCalendar: 0,
        isArchived: 0,
        isPaused: 0,
      },
      {
        userId,
        title: 'Team Standup',
        description: 'Daily team sync meeting',
        category: 'Work',
        frequency: 'custom' as const,
        customFrequency: 'Mon, Tue, Wed, Thu, Fri',
        startTime: '09:00',
        startDate: thirtyDaysAgo,
        endDate: epochZero,
        goalPerDay: 1,
        totalCompletions: 20,
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedAt: now,
        colorTag: '#14B8A6',
        icon: '👥',
        difficulty: 'easy' as const,
        visibility: 'private' as const,
        locationTag: 'Office',
        inCalendar: 1,
        isArchived: 0,
        isPaused: 0,
      },
    ];

    const insertedHabits = await database.insert(habitsTable).values(habits).returning();
    console.log(`✅ ${insertedHabits.length} habits seeded`);

    // ============================================================================
    // 3. SEED HABIT LOGS (Historical data for habits)
    // ============================================================================
    const habitLogs = [];
    
    // Generate logs for the last 30 days for active habits
    for (const habit of insertedHabits.filter(h => !h.isArchived && !h.isPaused)) {
      for (let i = 0; i < 30; i++) {
        const logDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        
        // Skip some days randomly to simulate real usage
        const shouldSkip = Math.random() > 0.7; // 30% chance to skip
        
        if (habit.frequency === 'daily') {
          habitLogs.push({
            habitId: habit.id,
            userId,
            status: shouldSkip ? 'missed' as const : 'completed' as const,
            logDate: logDate,
            note: shouldSkip ? '' : getRandomNote(),
            value: habit.goalPerDay,
            mood: shouldSkip ? '' : getRandomMood(),
            autoGenerated: shouldSkip ? 1 : 0,
          });
        } else if (habit.frequency === 'custom' && habit.customFrequency) {
          const dayOfWeek = logDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (habit.customFrequency.includes(dayOfWeek)) {
            habitLogs.push({
              habitId: habit.id,
              userId,
              status: shouldSkip ? 'missed' as const : 'completed' as const,
              logDate: logDate,
              note: shouldSkip ? '' : getRandomNote(),
              value: habit.goalPerDay,
              mood: shouldSkip ? '' : getRandomMood(),
              autoGenerated: shouldSkip ? 1 : 0,
            });
          }
        } else if (habit.frequency === 'weekly') {
          const dayOfWeek = logDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (habit.customFrequency?.includes(dayOfWeek)) {
            habitLogs.push({
              habitId: habit.id,
              userId,
              status: shouldSkip ? 'missed' as const : 'completed' as const,
              logDate: logDate,
              note: shouldSkip ? '' : getRandomNote(),
              value: habit.goalPerDay,
              mood: shouldSkip ? '' : getRandomMood(),
              autoGenerated: shouldSkip ? 1 : 0,
            });
          }
        }
      }
    }

    await database.insert(habitLogsTable).values(habitLogs);
    console.log(`✅ ${habitLogs.length} habit logs seeded`);

    // ============================================================================
    // 4. SEED MOOD ENTRIES (Last 30 days)
    // ============================================================================
    const moods = [];
    const moodLabels = [
      'Happy', 'Relaxed', 'Motivated', 'Focused', 'Grateful', 'Calm', 
      'Excited', 'Confident', 'Tired', 'Stressed', 'Neutral', 'Content'
    ];
    const emojis = ['😊', '😌', '🔥', '🎯', '🙏', '😴', '😰', '😐', '😄', '💪'];

    for (let i = 0; i < 30; i++) {
      const loggedAt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const moodLevel = Math.floor(Math.random() * 10) + 1;
      const energyLevel = Math.floor(Math.random() * 10) + 1;
      const stressLevel = Math.floor(Math.random() * 10) + 1;
      
      // Skip some days
      if (Math.random() > 0.3) {
        moods.push({
          userId,
          moodLevel,
          moodLabel: moodLabels[Math.floor(Math.random() * moodLabels.length)] as any,
          note: getRandomMoodNote(moodLevel),
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          energyLevel,
          stressLevel,
          loggedAt: loggedAt,
        });
      }
    }

    await database.insert(moodsTable).values(moods);
    console.log(`✅ ${moods.length} mood entries seeded`);

    // ============================================================================
    // 5. SEED NOTIFICATIONS
    // ============================================================================
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const onePointFiveHoursAgo = new Date(now.getTime() - 1.5 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    const notifications = [
      // Upcoming reminders
      {
        userId,
        habitId: insertedHabits[0].id,
        title: 'Time for Morning Meditation',
        message: 'Start your day with 10 minutes of mindfulness',
        type: 'reminder' as const,
        scheduledFor: oneHourFromNow,
        sentAt: epochZero,
        delivered: 0,
        read: 0,
        openedAt: epochZero,
        channel: 'local' as const,
      },
      {
        userId,
        habitId: insertedHabits[2].id,
        title: 'Code Practice Reminder',
        message: 'Time to work on algorithms!',
        type: 'reminder' as const,
        scheduledFor: fourHoursFromNow,
        sentAt: epochZero,
        delivered: 0,
        read: 0,
        openedAt: epochZero,
        channel: 'push' as const,
      },
      // Past notifications (delivered)
      {
        userId,
        habitId: insertedHabits[1].id,
        title: 'Hydration Check',
        message: 'Have you had your water today?',
        type: 'reminder' as const,
        scheduledFor: twoHoursAgo,
        sentAt: twoHoursAgo,
        delivered: 1,
        read: 1,
        openedAt: onePointFiveHoursAgo,
        channel: 'local' as const,
      },
      // Achievement notifications
      {
        userId,
        title: '🎉 7-Day Streak!',
        message: 'Congratulations! You\'ve maintained a 7-day streak on Morning Meditation',
        type: 'streak' as const,
        scheduledFor: sevenDaysAgo,
        sentAt: sevenDaysAgo,
        delivered: 1,
        read: 1,
        openedAt: sevenDaysAgo,
        channel: 'local' as const,
      },
      {
        userId,
        title: '🏆 New Achievement Unlocked',
        message: 'You\'ve earned the "Consistency Champion" badge!',
        type: 'achievement' as const,
        scheduledFor: sevenDaysAgo,
        sentAt: sevenDaysAgo,
        delivered: 1,
        read: 0,
        openedAt: epochZero,
        channel: 'push' as const,
      },
      // System notifications
      {
        userId,
        title: 'Weekly Progress Report Ready',
        message: 'Check out your weekly summary and insights',
        type: 'system' as const,
        scheduledFor: oneDayAgo,
        sentAt: oneDayAgo,
        delivered: 1,
        read: 0,
        openedAt: epochZero,
        channel: 'local' as const,
      },
    ];

    await database.insert(notificationsTable).values(notifications);
    console.log(`✅ ${notifications.length} notifications seeded`);

    // ============================================================================
    // 6. SEED ACHIEVEMENTS
    // ============================================================================
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const achievements = [
      {
        userId,
        key: 'FIRST_HABIT',
        title: 'Getting Started',
        description: 'Created your first habit',
        icon: '🌱',
        points: 10,
        achievedAt: sixtyDaysAgo,
        type: 'habit_count' as const,
        linkedHabitId: insertedHabits[0].id,
      },
      {
        userId,
        key: '7_DAY_STREAK',
        title: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        points: 50,
        achievedAt: sevenDaysAgo,
        type: 'streak' as const,
        linkedHabitId: insertedHabits[0].id,
      },
      {
        userId,
        key: '50_COMPLETIONS',
        title: 'Half Century',
        description: 'Completed 50 habit check-ins',
        icon: '💯',
        points: 100,
        achievedAt: tenDaysAgo,
        type: 'completion' as const,
      },
      {
        userId,
        key: '5_HABITS',
        title: 'Habit Builder',
        description: 'Created 5 different habits',
        icon: '🏗️',
        points: 30,
        achievedAt: thirtyDaysAgo,
        type: 'habit_count' as const,
      },
      {
        userId,
        key: 'MOOD_TRACKER',
        title: 'Emotional Intelligence',
        description: 'Logged mood for 7 consecutive days',
        icon: '😊',
        points: 40,
        achievedAt: fiveDaysAgo,
        type: 'mood' as const,
      },
      {
        userId,
        key: 'EARLY_BIRD',
        title: 'Early Bird',
        description: 'Completed 10 morning habits before 7 AM',
        icon: '🌅',
        points: 60,
        achievedAt: fifteenDaysAgo,
        type: 'completion' as const,
        linkedHabitId: insertedHabits[0].id,
      },
      {
        userId,
        key: 'CONSISTENCY',
        title: 'Consistency Champion',
        description: 'Maintained 3 active streaks simultaneously',
        icon: '🏆',
        points: 150,
        achievedAt: sevenDaysAgo,
        type: 'streak' as const,
      },
    ];

    await database.insert(achievementsTable).values(achievements);
    console.log(`✅ ${achievements.length} achievements seeded`);

    console.log('🎉 Database seeding completed successfully!');
    return {
      success: true,
      stats: {
        habits: insertedHabits.length,
        habitLogs: habitLogs.length,
        moods: moods.length,
        notifications: notifications.length,
        achievements: achievements.length,
        userAnswers: userAnswers.length,
      },
    };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

/**
 * Clear all seeded data for a user
 * @param userId - The ID of the user whose data should be cleared
 */
export const clearUserData = async (userId: number) => {
  try {
    console.log('🧹 Clearing user data...');
    const database = db();

    // Delete in reverse order of dependencies
    await database.delete(habitLogsTable).where(eq(habitLogsTable.userId, userId));
    await database.delete(notificationsTable).where(eq(notificationsTable.userId, userId));
    await database.delete(achievementsTable).where(eq(achievementsTable.userId, userId));
    await database.delete(moodsTable).where(eq(moodsTable.userId, userId));
    await database.delete(habitsTable).where(eq(habitsTable.userId, userId));
    await database.delete(userAnswersTable).where(eq(userAnswersTable.userId, userId));

    console.log('✅ User data cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to clear user data:', error);
    throw error;
  }
};

/**
 * Clear all data from all tables (use with caution!)
 */
export const clearAllData = async () => {
  try {
    console.log('🧹 Clearing all database data...');
    const database = db();

    await database.delete(habitLogsTable);
    await database.delete(notificationsTable);
    await database.delete(achievementsTable);
    await database.delete(moodsTable);
    await database.delete(habitsTable);
    await database.delete(userAnswersTable);

    console.log('✅ All data cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to clear all data:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getRandomNote = (): string => {
  const notes = [
    'Felt great today!',
    'Challenging but rewarding',
    'Easy session',
    'Really needed this',
    'Proud of myself',
    'Could do better tomorrow',
    'Perfect timing',
    'Almost skipped but glad I did it',
    'Best session in a while',
    'Quick but effective',
    '',
  ];
  return notes[Math.floor(Math.random() * notes.length)];
};

const getRandomMood = (): string => {
  const moods = [
    'Happy', 'Energized', 'Focused', 'Calm', 'Motivated', 
    'Tired', 'Neutral', 'Accomplished', 'Peaceful', ''
  ];
  return moods[Math.floor(Math.random() * moods.length)];
};

const getRandomMoodNote = (moodLevel: number): string => {
  if (moodLevel >= 8) {
    const highMoodNotes = [
      'Feeling fantastic today! Everything is going well.',
      'Had an amazing day, accomplished so much.',
      'Really happy with how things are progressing.',
      'In a great mood, feeling energized and positive.',
    ];
    return highMoodNotes[Math.floor(Math.random() * highMoodNotes.length)];
  } else if (moodLevel >= 5) {
    const mediumMoodNotes = [
      'Pretty good day overall.',
      'Feeling okay, nothing special.',
      'Balanced day with ups and downs.',
      'Neutral mood but getting things done.',
      '',
    ];
    return mediumMoodNotes[Math.floor(Math.random() * mediumMoodNotes.length)];
  } else {
    const lowMoodNotes = [
      'Struggling a bit today.',
      'Feeling tired and unmotivated.',
      'Had a challenging day.',
      'Need to take better care of myself.',
      'Hope tomorrow is better.',
    ];
    return lowMoodNotes[Math.floor(Math.random() * lowMoodNotes.length)];
  }
};

/**
 * Clear all seed data from the database
 * @param userId - The ID of the user to clear seed data for
 */
export const clearSeedData = async (userId: number) => {
  try {
    console.log('🧹 Clearing seed data...');
    const database = db();

    // Delete in reverse order to respect foreign key constraints
    await database.delete(notificationsTable).where(eq(notificationsTable.userId, userId));
    console.log('✅ Notifications cleared');

    await database.delete(achievementsTable).where(eq(achievementsTable.userId, userId));
    console.log('✅ Achievements cleared');

    await database.delete(moodsTable).where(eq(moodsTable.userId, userId));
    console.log('✅ Moods cleared');

    await database.delete(habitLogsTable).where(eq(habitLogsTable.userId, userId));
    console.log('✅ Habit logs cleared');

    await database.delete(habitsTable).where(eq(habitsTable.userId, userId));
    console.log('✅ Habits cleared');

    await database.delete(userAnswersTable).where(eq(userAnswersTable.userId, userId));
    console.log('✅ User answers cleared');

    console.log('🎉 All seed data cleared successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing seed data:', error);
    throw error;
  }
};
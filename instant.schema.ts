// schema.ts
import { i } from '@instantdb/react-native';

const _schema = i.schema({
  entities: {
    // ================= SYSTEM ENTITIES =================

    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),

    $streams: i.entity({
      abortReason: i.string().optional(),
      clientId: i.string().unique().indexed(),
      done: i.boolean().optional(),
      size: i.number().optional(),
    }),

    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),

    // ================= USER PROFILE =================

    userProfile: i.entity({
      displayName: i.string().optional(),
      avatarUrl: i.string().optional(),
      bio: i.string().optional(),

      primaryGoal: i.string().optional(),
      sleepTime: i.string().optional(),
      wakeTime: i.string().optional(),
      obstacles: i.json().optional(),

      themePreference: i.string(),
      weekStartsOn: i.number(),
      dailyReminderTime: i.string().optional(),
      remindersEnabled: i.boolean(),

      totalXp: i.number(),
      currentLevel: i.number(),
      longestStreak: i.number(),

      onboardingCompletedAt: i.number().optional(),
      lastActiveAt: i.number().indexed(),
      createdAt: i.number().indexed(),
      updatedAt: i.number(),
    }),

    // ================= HABITS =================

    habit: i.entity({
      name: i.string().indexed(),
      description: i.string().optional(),
      icon: i.string().optional(),
      color: i.string().optional(),

      frequency: i.string(),
      daysOfWeek: i.json().optional(),
      specificDates: i.json().optional(),

      hasNumericTarget: i.boolean(),
      targetValue: i.number().optional(),
      targetUnit: i.string().optional(),

      reminderTime: i.string().optional(),
      reminderDays: i.json().optional(),
      reminderEnabled: i.boolean(),

      isArchived: i.boolean().indexed(),
      isDeleted: i.boolean().indexed(),
      sortOrder: i.number().optional(),

      createdAt: i.number().indexed(),
      updatedAt: i.number(),
      archivedAt: i.number().optional(),
    }),

    // ================= HABIT LOGS =================

    habitLog: i.entity({

      date: i.string().indexed(),
      dateTimestamp: i.number().indexed(),

      status: i.string().indexed(),

      currentValue: i.number().optional(),
      targetValue: i.number().optional(),
      percentageComplete: i.number().optional(),

      note: i.string().optional(),

      completedAt: i.number().optional().indexed(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // ================= HABIT STATS =================

    habitStats: i.entity({
      periodType: i.string().indexed(),
      periodStart: i.string().indexed(),

      totalLogs: i.number(),
      completedLogs: i.number(),
      partialLogs: i.number(),
      missedLogs: i.number(),
      completionRate: i.number(),

      currentStreak: i.number(),
      longestStreak: i.number(),
      streakStartDate: i.string().optional(),

      totalValue: i.number().optional(),
      averageValue: i.number().optional(),
      bestValue: i.number().optional(),

      calculatedAt: i.number(),
    }),

    // ================= MOOD LOGS =================

    moodLog: i.entity({
      date: i.string().indexed(),
      dateTimestamp: i.number().indexed(),
      timeOfDay: i.string().optional(),

      moodLevel: i.number().indexed(),
      moodLabel: i.string(),

      factors: i.json().optional(),
      note: i.string().optional(),
      habitDaySummary: i.string().optional(),

      createdAt: i.number().indexed(),
      updatedAt: i.number(),
    }),

    // ================= MOOD STATS =================

    moodStats: i.entity({
      periodType: i.string().indexed(),
      periodStart: i.string().indexed(),

      totalEntries: i.number(),
      awfulCount: i.number(),
      badCount: i.number(),
      mehCount: i.number(),
      goodCount: i.number(),
      greatCount: i.number(),

      averageMood: i.number(),
      dominantMood: i.string(),

      trendDirection: i.string(),
      trendPercentage: i.number(),

      topPositiveFactors: i.json().optional(),
      topNegativeFactors: i.json().optional(),

      calculatedAt: i.number(),
    }),

    // ================= ACHIEVEMENTS =================

    achievement: i.entity({
      key: i.string().unique().indexed(),
      name: i.string(),
      description: i.string(),
      icon: i.string(),
      color: i.string(),
      xpReward: i.number(),

      requirementType: i.string(),
      requirementValue: i.number(),

      category: i.string(),
    }),

    userAchievement: i.entity({
      unlockedAt: i.number().indexed(),
      viewed: i.boolean(),
      progressAtUnlock: i.number().optional(),
    }),

    // ================= NOTIFICATIONS =================

    notification: i.entity({
      type: i.string().indexed(),
      title: i.string(),
      body: i.string(),

      habitId: i.string().optional().indexed(),

      scheduledFor: i.number().indexed(),
      sentAt: i.number().optional(),
      readAt: i.number().optional(),

      status: i.string().indexed(),
      payload: i.json().optional(),

      createdAt: i.number(),
    }),

    // ================= DAILY SNAPSHOT =================

    dailySnapshot: i.entity({
      date: i.string().unique().indexed(),
      dateTimestamp: i.number().indexed(),

      totalHabits: i.number(),
      completedHabits: i.number(),
      completionPercentage: i.number(),

      hasMoodLog: i.boolean(),
      moodLevel: i.number().optional(),

      dailyQuote: i.string().optional(),
      insight: i.string().optional(),

      xpEarned: i.number(),
      createdAt: i.number(),
    }),
  },

  // ================= LINKS =================

  links: {
    $streams$files: {
      forward: {
        on: '$streams',
        has: 'many',
        label: '$files',
      },
      reverse: {
        on: '$files',
        has: 'one',
        label: '$stream',
        onDelete: 'cascade',
      },
    },

    $usersLinkedPrimaryUser: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'linkedPrimaryUser',
        onDelete: 'cascade',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'linkedGuestUsers',
      },
    },

    userProfile: {
      forward: { on: '$users', has: 'one', label: 'profile' },
      reverse: { on: 'userProfile', has: 'one', label: 'user' },
    },

    userHabits: {
      forward: { on: '$users', has: 'many', label: 'habits' },
      reverse: { on: 'habit', has: 'one', label: 'owner' },
    },

    habitLogs: {
      forward: { on: 'habit', has: 'many', label: 'logs' },
      reverse: { on: 'habitLog', has: 'one', label: 'habit' },
    },

    habitStats: {
      forward: { on: 'habit', has: 'many', label: 'stats' },
      reverse: { on: 'habitStats', has: 'one', label: 'habit' },
    },

    userMoodLogs: {
      forward: { on: '$users', has: 'many', label: 'moodLogs' },
      reverse: { on: 'moodLog', has: 'one', label: 'owner' },
    },

    userMoodStats: {
      forward: { on: '$users', has: 'many', label: 'moodStats' },
      reverse: { on: 'moodStats', has: 'one', label: 'owner' },
    },

    userAchievements: {
      forward: { on: '$users', has: 'many', label: 'userAchievements' },
      reverse: { on: 'userAchievement', has: 'one', label: 'user' },
    },

    achievementUnlocks: {
      forward: { on: 'achievement', has: 'many', label: 'unlocks' },
      reverse: { on: 'userAchievement', has: 'one', label: 'achievement' },
    },

    userNotifications: {
      forward: { on: '$users', has: 'many', label: 'notifications' },
      reverse: { on: 'notification', has: 'one', label: 'user' },
    },

    notificationHabit: {
      forward: { on: 'notification', has: 'one', label: 'habit' },
      reverse: { on: 'habit', has: 'many', label: 'notifications' },
    },

    userDailySnapshots: {
      forward: { on: '$users', has: 'many', label: 'dailySnapshots' },
      reverse: { on: 'dailySnapshot', has: 'one', label: 'user' },
    },
  },

  rooms: {
    habitBuddy: {
      presence: i.entity({
        peerId: i.string(),
        x: i.number(),
        y: i.number(),
        color: i.string(),
      }),
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type Ics = AppSchema['entities']


export type { AppSchema };
export default schema;
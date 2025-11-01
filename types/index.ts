import { z } from "zod";

// ============================================================================
// Base Fields Schema
// ============================================================================
export const baseFieldsSchema = {
  id: z.number().int().positive().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
};

// ============================================================================
// USER SCHEMAS
// ============================================================================
export const userSchema = z.object({
  ...baseFieldsSchema,
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
  avatarUrl: z.url().optional().default(""),
  bio: z.string().max(500).optional().default(""),
  timezone: z.string().default("UTC"),
  joinedAt: z.date().default(() => new Date()),

  totalHabitsCreated: z.number().int().min(0).default(0),
  totalCompletions: z.number().int().min(0).default(0),
  streakLongest: z.number().int().min(0).default(0),
  streakCurrent: z.number().int().min(0).default(0),

  theme: z.enum(["light", "dark"]).default("light"),
  notificationsEnabled: z.boolean().default(true),
});



export const loginSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required").trim(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
  timezone: z.string().optional().default("UTC"),
});

export const updateUserSchema = userSchema.partial().omit({ 
  id: true, 
  createdAt: true,
  password: true, // Use separate schema for password changes
});

export const sanitizedUserSchema  =userSchema.partial().omit({
  password: true
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UserSchemaType = z.infer<typeof userSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type sanitizedUserSchemaType = z.infer<typeof sanitizedUserSchema >
// ============================================================================
// HABIT SCHEMAS
// ============================================================================
export const habitSchema = z.object({
  ...baseFieldsSchema,
  userId: z.number().int().positive(),
  
  // Core habit data
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).default(""),
  category: z.string().max(50).default("general"),

  // Scheduling
  frequency: z.enum(["daily", "hourly", "weekly", "custom", "monthly", "once"]).default("daily"),
  customFrequency: z.string().max(100).default(""), // e.g., "Mon, Wed, Fri"
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().default(""), // HH:mm format
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().default(""),
  startDate: z.date().default(() => new Date()),
  endDate: z.date().optional(),

  inCalendar: z.boolean().default(false),

  // Goals and tracking
  goalPerDay: z.number().int().min(1).default(1),
  totalCompletions: z.number().int().min(0).default(0),
  currentStreak: z.number().int().min(0).default(0),
  longestStreak: z.number().int().min(0).default(0),
  lastCompletedAt: z.date().optional(),

  // Customization
  colorTag: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#A78BFA"),
  icon: z.string().max(10).default("✨"),
  visibility: z.enum(["private", "friends", "public"]).default("private"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  rewardTag: z.string().max(100).default(""),
  locationTag: z.string().max(100).default(""),

  // State
  isArchived: z.boolean().default(false),
  isPaused: z.boolean().default(false),
});

export const createHabitSchema = habitSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  totalCompletions: true,
  currentStreak: true,
  longestStreak: true,
  lastCompletedAt: true,
});

export const updateHabitSchema = habitSchema.partial().omit({ 
  id: true, 
  userId: true,
  createdAt: true,
});

export type HabitSchemaType = z.infer<typeof habitSchema>;
export type CreateHabitSchemaType = z.infer<typeof createHabitSchema>;
export type UpdateHabitSchemaType = z.infer<typeof updateHabitSchema>;

// ============================================================================
// HABIT LOG SCHEMAS
// ============================================================================
export const habitLogSchema = z.object({
  ...baseFieldsSchema,
  habitId: z.number().int().positive(),
  userId: z.number().int().positive(),

  status: z.enum(["completed", "pending", "missed", "dropped", "deleted"]).default("pending"),
  logDate: z.date(), // actual day being logged
  note: z.string().max(500).default(""),
  value: z.number().int().min(0).default(1), // intensity or count
  mood: z.string().max(50).default(""),
  autoGenerated: z.boolean().default(false).optional(),
});

export const createHabitLogSchema = habitLogSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true
});

export const updateHabitLogSchema = habitLogSchema.partial().omit({ 
  id: true, 
  habitId: true,
  userId: true,
  createdAt: true,
});

export type HabitLogSchemaType = z.infer<typeof habitLogSchema>;
export type CreateHabitLogSchemaType = z.infer<typeof createHabitLogSchema>;
export type UpdateHabitLogSchemaType = z.infer<typeof updateHabitLogSchema>;

// ============================================================================
// MOOD SCHEMAS
// ============================================================================
export const moodSchema = z.object({
  ...baseFieldsSchema,
  userId: z.number().int().positive(),

  moodLevel: z.number().int().min(1).max(10),
  moodLabel: z.enum([
    // Positive / Energized
    "Happy", "Relaxed", "Motivated", "Focused", "Grateful", "Calm", 
    "Excited", "Confident", "Proud", "Content", "Inspired", "Optimistic", "Loved",
    // Neutral / Mixed
    "Neutral", "Reflective", "Bored", "Indifferent",
    // Negative / Low energy
    "Tired", "Sad", "Anxious", "Angry", "Stressed", "Overwhelmed", 
    "Lonely", "Frustrated", "Disappointed", "Guilty", "Worried",
  ]).default("Neutral"),

  note: z.string().max(1000).default(""),
  emoji: z.string().max(10).default(""),

  energyLevel: z.number().int().min(1).max(10).default(5),
  stressLevel: z.number().int().min(1).max(10).default(5),

  loggedAt: z.date().default(() => new Date()),
});

export const createMoodSchema = moodSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
});

export const updateMoodSchema = moodSchema.partial().omit({ 
  id: true, 
  userId: true,
  createdAt: true,
});

export type MoodSchemaType = z.infer<typeof moodSchema>;
export type CreateMoodSchemaType = z.infer<typeof createMoodSchema>;
export type UpdateMoodSchemaType = z.infer<typeof updateMoodSchema>;

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================
export const notificationSchema = z.object({
  ...baseFieldsSchema,
  userId: z.number().int().positive(),
  habitId: z.number().int().positive().optional(),

  title: z.string().min(1, "Title is required").max(100),
  message: z.string().max(500).default(""),
  type: z.enum(["reminder", "achievement", "system", "streak", "custom"]).default("reminder"),

  scheduledFor: z.date(),
  sentAt: z.date().optional(),
  delivered: z.boolean().default(false),
  read: z.boolean().default(false),
  openedAt: z.date().optional(),

  channel: z.enum(["local", "push", "email"]).default("local"),
});

export const createNotificationSchema = notificationSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  sentAt: true,
  delivered: true,
  read: true,
  openedAt: true,
});

export const updateNotificationSchema = notificationSchema.partial().omit({ 
  id: true, 
  userId: true,
  createdAt: true,
});

export type NotificationSchemaType = z.infer<typeof notificationSchema>;
export type CreateNotificationSchemaType = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationSchemaType = z.infer<typeof updateNotificationSchema>;

// ============================================================================
// ACHIEVEMENT SCHEMAS
// ============================================================================
export const achievementSchema = z.object({
  ...baseFieldsSchema,
  userId: z.number().int().positive(),

  key: z.string().min(2).max(50).toUpperCase(), // e.g., "7_DAY_STREAK"
  title: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  icon: z.string().max(10).default("🏆"),
  points: z.number().int().min(0).default(10),

  achievedAt: z.date().default(() => new Date()),
  type: z.enum(["streak", "completion", "habit_count", "mood", "misc"]).default("misc"),
  linkedHabitId: z.number().int().positive().optional(),
});

export const createAchievementSchema = achievementSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
});

export type AchievementSchemaType = z.infer<typeof achievementSchema>;
export type CreateAchievementSchemaType = z.infer<typeof createAchievementSchema>;

// ============================================================================
// USER ANSWERS SCHEMAS (for onboarding)
// ============================================================================
export const userAnswerSchema = z.object({
  ...baseFieldsSchema,
  userId: z.number().int().positive(),
  questionKey: z.string().min(1).max(100).trim(),
  answer: z.string().min(1).max(1000).trim(),
});

export const createUserAnswerSchema = userAnswerSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
});

export type UserAnswerSchemaType = z.infer<typeof userAnswerSchema>;
export type CreateUserAnswerSchemaType = z.infer<typeof createUserAnswerSchema>;
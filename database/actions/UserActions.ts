import { eq } from "drizzle-orm";
import { db, schema } from "@/database/calldb";
import {
  userSchema,
  loginSchema,
  registerSchema,
  updateUserSchema,
  changePasswordSchema,
  type LoginSchemaType,
  type RegisterSchemaType,
  type UpdateUserSchemaType,
  type ChangePasswordSchemaType,
  sanitizedUserSchemaType,
  UserSchemaType,
} from "@/types";
import argon2 from "argon2";
import storage from "@/lib/storage/mmkv";

export class UserActions {
  /**
   * Create new user account
   */
  async createAccount(data: RegisterSchemaType) {
    const parsed = registerSchema.parse(data);
    
    // Check if email already exists
    const existing = await db()
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.email, parsed.email))
      .get();

    if (existing) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await argon2.hash(parsed.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB
      timeCost: 3,
      parallelism: 1,
    });

    // Create user
    const [user] = await db()
      .insert(schema.usersTable)
      .values({
        name: parsed.name,
        email: parsed.email,
        password: hashedPassword,
        timezone: parsed.timezone || "UTC",
      })
      .returning();

    return this.sanitizeUser(user);
  }

  /**
   * Login existing user
   */
  async login(credentials: LoginSchemaType) {
    const parsed = loginSchema.parse(credentials);

    const user = await db()
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.email, parsed.email))
      .get();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await argon2.verify(user.password, parsed.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }
    storage.set('activeUserID', user.id)
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile details
   */
  async updateAccount(userId: number, data: UpdateUserSchemaType) {
    const parsed = updateUserSchema.parse(data);

    await db()
      .update(schema.usersTable)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(schema.usersTable.id, userId));

    const updated = await db()
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, userId))
      .get();

    if (!updated) {
      throw new Error("User not found");
    }

    return this.sanitizeUser(updated);
  }

  /**
   * Change password
   */
  async changePassword(userId: number, data: ChangePasswordSchemaType) {
    const parsed = changePasswordSchema.parse(data);

    const user = await db()
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, userId))
      .get();

    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await argon2.verify(user.password, parsed.currentPassword);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await argon2.hash(parsed.newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    await db()
      .update(schema.usersTable)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(schema.usersTable.id, userId));

    return { success: true };
  }

  /**
   * Delete account permanently
   */
  async deleteAccount(userId: number) {
    await db()
      .delete(schema.usersTable)
      .where(eq(schema.usersTable.id, userId));

    return { success: true };
  }

  /**
   * Retrieve user by ID
   */
  async getUserById(userId: number) {
    const user = await db()
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, userId))
      .get();

    if (!user) {
      throw new Error("User not found");
    }

    return this.sanitizeUser(user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const user = await db()
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.email, email))
      .get();

    if (!user) {
      throw new Error("User not found");
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user stats
   */
  async updateStats(
    userId: number,
    stats: {
      totalHabitsCreated?: number;
      totalCompletions?: number;
      streakCurrent?: number;
      streakLongest?: number;
    }
  ) {
    await db()
      .update(schema.usersTable)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(schema.usersTable.id, userId));

    return { success: true };
  }

  /**
   * Helper — remove sensitive info
   */
  private sanitizeUser(user: any) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
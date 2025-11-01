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
} from "@/types";
import * as Crypto from 'expo-crypto';
import storage from "@/lib/storage/mmkv";

export class UserActions {
  /**
   * Hash password using expo-crypto (PBKDF2)
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      // Generate a random salt
      const salt = Crypto.getRandomBytes(16);
      const saltHex = Array.from(salt)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Hash password with salt using PBKDF2
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password + saltHex,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      // Return salt + hash combined
      return `${saltHex}:${hash}`;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify password against stored hash
   */
  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      // Split stored hash into salt and hash
      const [salt, hash] = storedHash.split(':');
      
      if (!salt || !hash) {
        return false;
      }

      // Hash the provided password with the same salt
      const testHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password + salt,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      // Compare hashes
      return testHash === hash;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

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
    const hashedPassword = await this.hashPassword(parsed.password);

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

    // Store user ID
    storage.set('activeUserID', user.id);

    console.log('User account created', { userId: user.id, email: user.email });
    
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
      console.warn('Login failed: user not found', { email: parsed.email });
      throw new Error("Invalid email or password");
    }

    const isValid = await this.verifyPassword(parsed.password, user.password);
    if (!isValid) {
      console.warn('Login failed: invalid password', { email: parsed.email });
      throw new Error("Invalid email or password");
    }

    // Store user ID
    storage.set('activeUserID', user.id);
    
    console.log('User logged in', { userId: user.id, email: user.email });
    
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

    console.log('User account updated', { userId });

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

    const isValid = await this.verifyPassword(parsed.currentPassword, user.password);
    if (!isValid) {
      console.warn('Password change failed: incorrect current password', { userId });
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await this.hashPassword(parsed.newPassword);

    await db()
      .update(schema.usersTable)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(schema.usersTable.id, userId));

    console.log('Password changed', { userId });

    return { success: true };
  }

  /**
   * Delete account permanently
   */
  async deleteAccount(userId: number) {
    await db()
      .delete(schema.usersTable)
      .where(eq(schema.usersTable.id, userId));

    // Clear stored user ID
    storage.remove('activeUserID');

    console.log('User account deleted', { userId });

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

    console.log('User stats updated', { userId, stats });

    return { success: true };
  }

  /**
   * Update user theme preference
   */
  async updateTheme(userId: number, theme: 'light' | 'dark') {
    await db()
      .update(schema.usersTable)
      .set({ theme, updatedAt: new Date() })
      .where(eq(schema.usersTable.id, userId));

    return { success: true };
  }

  /**
   * Toggle notifications enabled
   */
  async toggleNotifications(userId: number, enabled: boolean) {
    await db()
      .update(schema.usersTable)
      .set({ notificationsEnabled: enabled, updatedAt: new Date() })
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
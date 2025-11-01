import { eq, and, desc, lte } from "drizzle-orm";
import { db, schema } from "@/database/calldb";
import {
  createNotificationSchema,
  updateNotificationSchema,
  type CreateNotificationSchemaType,
  type UpdateNotificationSchemaType,
} from "@/types";
import { NotificationService } from "@/lib/services";

export class NotificationActions {

    private notifications = new NotificationService()

  /**
   * Create notification
   */
  async createNotification(data: CreateNotificationSchemaType) {
    const parsed = createNotificationSchema.parse(data);

    const [notification] = await db()
      .insert(schema.notificationsTable)
      .values(parsed)
      .returning();

    if(parsed.channel !== 'email'){
        await this.notifications.scheduleNotificationAsync({
            title: parsed.title,
            body: parsed.message,
            channelId: parsed.type === 'system' ? 'default': 'habit-reminders',
            date: notification.scheduledFor || parsed.scheduledFor || null,
            data: notification
        })
    }    

    return notification;
  }

  /**
   * Get user notifications
   */
  async getNotifications(userId: number, limit: number = 50) {
    return await db()
      .select()
      .from(schema.notificationsTable)
      .where(eq(schema.notificationsTable.userId, userId))
      .orderBy(desc(schema.notificationsTable.scheduledFor))
      .limit(limit)
      .all();
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: number, userId: number) {
    const notification = await db()
      .select()
      .from(schema.notificationsTable)
      .where(
        and(
          eq(schema.notificationsTable.id, notificationId),
          eq(schema.notificationsTable.userId, userId)
        )
      )
      .get();

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(userId: number) {
    return await db()
      .select()
      .from(schema.notificationsTable)
      .where(
        and(
          eq(schema.notificationsTable.userId, userId),
          eq(schema.notificationsTable.read, false)
        )
      )
      .orderBy(desc(schema.notificationsTable.scheduledFor))
      .all();
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: number): Promise<number> {
    const unread = await this.getUnreadNotifications(userId);
    return unread.length;
  }

  /**
   * Mark as read
   */
  async markAsRead(notificationId: number, userId: number) {
    await db()
      .update(schema.notificationsTable)
      .set({ 
        read: true, 
        openedAt: new Date(), 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(schema.notificationsTable.id, notificationId),
          eq(schema.notificationsTable.userId, userId)
        )
      );

    return { success: true };
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: number) {
    await db()
      .update(schema.notificationsTable)
      .set({ read: true, updatedAt: new Date() })
      .where(eq(schema.notificationsTable.userId, userId));

    return { success: true };
  }

  /**
   * Mark as delivered
   */
  async markAsDelivered(notificationId: number, userId: number) {
    await db()
      .update(schema.notificationsTable)
      .set({ 
        delivered: true, 
        sentAt: new Date(), 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(schema.notificationsTable.id, notificationId),
          eq(schema.notificationsTable.userId, userId)
        )
      );

    return { success: true };
  }

  /**
   * Update notification
   */
  async updateNotification(
    notificationId: number, 
    userId: number, 
    data: UpdateNotificationSchemaType
  ) {
    const parsed = updateNotificationSchema.parse(data);

    await db()
      .update(schema.notificationsTable)
      .set({ ...parsed, updatedAt: new Date() })
      .where(
        and(
          eq(schema.notificationsTable.id, notificationId),
          eq(schema.notificationsTable.userId, userId)
        )
      );

    return await this.getNotificationById(notificationId, userId);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number, userId: number) {
    await db()
      .delete(schema.notificationsTable)
      .where(
        and(
          eq(schema.notificationsTable.id, notificationId),
          eq(schema.notificationsTable.userId, userId)
        )
      );

    return { success: true };
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(userId: number) {
    await db()
      .delete(schema.notificationsTable)
      .where(eq(schema.notificationsTable.userId, userId));

    return { success: true };
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(
    userId: number, 
    type: "reminder" | "achievement" | "system" | "streak" | "custom"
  ) {
    return await db()
      .select()
      .from(schema.notificationsTable)
      .where(
        and(
          eq(schema.notificationsTable.userId, userId),
          eq(schema.notificationsTable.type, type)
        )
      )
      .orderBy(desc(schema.notificationsTable.scheduledFor))
      .all();
  }

  /**
   * Get notifications by habit
   */
  async getNotificationsByHabit(userId: number, habitId: number) {
    return await db()
      .select()
      .from(schema.notificationsTable)
      .where(
        and(
          eq(schema.notificationsTable.userId, userId),
          eq(schema.notificationsTable.habitId, habitId)
        )
      )
      .orderBy(desc(schema.notificationsTable.scheduledFor))
      .all();
  }

  /**
   * Get pending notifications (scheduled but not delivered)
   */
  async getPendingNotifications(userId: number) {
    return await db()
      .select()
      .from(schema.notificationsTable)
      .where(
        and(
          eq(schema.notificationsTable.userId, userId),
          eq(schema.notificationsTable.delivered, false),
          lte(schema.notificationsTable.scheduledFor, new Date())
        )
      )
      .orderBy(desc(schema.notificationsTable.scheduledFor))
      .all();
  }

  /**
   * Get upcoming notifications
   */
  async getUpcomingNotifications(userId: number, limit: number = 10) {
    return await db()
      .select()
      .from(schema.notificationsTable)
      .where(
        and(
          eq(schema.notificationsTable.userId, userId),
          eq(schema.notificationsTable.delivered, false)
        )
      )
      .orderBy(desc(schema.notificationsTable.scheduledFor))
      .limit(limit)
      .all();
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: number, userId: number) {
    return await this.deleteNotification(notificationId, userId);
  }

  /**
   * Reschedule notification
   */
  async rescheduleNotification(
    notificationId: number, 
    userId: number, 
    newScheduledFor: Date
  ) {
    await db()
      .update(schema.notificationsTable)
      .set({ 
        scheduledFor: newScheduledFor, 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(schema.notificationsTable.id, notificationId),
          eq(schema.notificationsTable.userId, userId)
        )
      );

    return await this.getNotificationById(notificationId, userId);
  }

  /**
   * Bulk create notifications
   */
  async bulkCreateNotifications(notifications: CreateNotificationSchemaType[]) {
    const parsed = notifications.map(n => createNotificationSchema.parse(n));

    const created = await db()
      .insert(schema.notificationsTable)
      .values(parsed)
      .returning();

    return created;
  }

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOldNotifications(userId: number, daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await db()
      .delete(schema.notificationsTable)
      .where(
        and(
          eq(schema.notificationsTable.userId, userId),
          eq(schema.notificationsTable.read, true),
          lte(schema.notificationsTable.scheduledFor, cutoffDate)
        )
      );

    return { success: true };
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: number) {
    const all = await this.getNotifications(userId, 1000);
    const unread = all.filter(n => !n.read);
    const delivered = all.filter(n => n.delivered);
    const pending = all.filter(n => !n.delivered);

    const byType = {
      reminder: all.filter(n => n.type === 'reminder').length,
      achievement: all.filter(n => n.type === 'achievement').length,
      system: all.filter(n => n.type === 'system').length,
      streak: all.filter(n => n.type === 'streak').length,
      custom: all.filter(n => n.type === 'custom').length,
    };

    return {
      total: all.length,
      unread: unread.length,
      delivered: delivered.length,
      pending: pending.length,
      byType,
    };
  }
}
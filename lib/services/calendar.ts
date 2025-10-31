import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export class CalendarService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  }

  private async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking calendar permissions:', error);
      return false;
    }
  }

  constructor() {}

  async getDefaultCalendarAsync(): Promise<Calendar.Calendar | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permissions not granted');
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Try to find a writable calendar first
      const writable = calendars.find(
        (c) => 
          c.allowsModifications && 
          (c.accessLevel === Calendar.CalendarAccessLevel.OWNER || 
           c.accessLevel === Calendar.CalendarAccessLevel.CONTRIBUTOR)
      );
      
      return writable ?? (calendars.length ? calendars[0] : null);
    } catch (error) {
      console.error('Error getting default calendar:', error);
      return null;
    }
  }

  private async createHabitBloomCalendar(): Promise<string | null> {
    try {
      // Get the default calendar source
      const defaultCalendarSource = await Calendar.getDefaultCalendarAsync()

      const newCalendarID = await Calendar.createCalendarAsync({
        title: 'HabitBloom',
        color: '#2196F3',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource.source,
        name: 'HabitBloom Calendar',
        ownerAccount: Platform.OS === 'android' ? 'HabitBloom' : undefined,
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return newCalendarID;
    } catch (error) {
      console.error('Error creating HabitBloom calendar:', error);
      return null;
    }
  }

  async createEventAsync({
    title,
    startDate,
    endDate,
    notes,
    timeZone,
  }: {
    title: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
    timeZone?: string;
  }): Promise<string> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permissions not granted');
      }

      let calendar = await this.getDefaultCalendarAsync();
      
      if (!calendar) {
        // Create a new calendar when none exists
        const newCalId = await this.createHabitBloomCalendar();
        if (!newCalId) {
          throw new Error('Failed to create calendar');
        }
        
        return await Calendar.createEventAsync(newCalId, {
          title,
          startDate,
          endDate,
          timeZone: timeZone ?? 'GMT',
          notes,
        });
      }

      return await Calendar.createEventAsync(calendar.id, {
        title,
        startDate,
        endDate,
        timeZone: timeZone ?? 'GMT',
        notes,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async deleteEventAsync(eventId: string): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permissions not granted');
      }

      await Calendar.deleteEventAsync(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async updateEventAsync(
    eventId: string,
    details: {
      title?: string;
      startDate?: Date;
      endDate?: Date;
      notes?: string;
      timeZone?: string;
    }
  ): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permissions not granted');
      }

      await Calendar.updateEventAsync(eventId, details);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }
}

export const calendarService = new CalendarService();
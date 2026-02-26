import { id } from '@instantdb/react-native';
import db, { tx } from '@/lib/db'; // Ensure you're importing tx correctly

// Habit creation helper - Pass userId as an argument
export function createHabit(
  userId: string, // Accept userId here
  habitData: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    frequency?: string;
    daysOfWeek?: number[];
    hasNumericTarget?: boolean;
    targetValue?: number;
    targetUnit?: string;
    reminderTime?: string;
  }
) {
  
  try {
    
    const habitId = id();
    db.transact(
      db.tx.habit[habitId]
       .update({
         ...habitData,
         isArchived: false,
         isDeleted: false,
         sortOrder: 0,
         createdAt: Date.now(),
         updatedAt: Date.now(),
       })
       .link({ owner: userId })

    )
    
  } catch (error) {
    console.error(error)
  }
}
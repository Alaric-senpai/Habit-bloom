// lib/instant/habits.ts
import { id,  } from '@instantdb/react-native';
import db,{ tx} from '@/lib/db';

// Habit creation helper
export function createHabit(habitData: {
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
}) {
  const habitId = id();
  
  return tx.habit[habitId].update({
    ...habitData,
    isArchived: false,
    isDeleted: false,
    sortOrder: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }).link({ owner: db.useUser().id });
}

// Log habit completion
export function logHabitCompletion(
  habitId: string,
  date: string,
  data: {
    status: 'completed' | 'partial' | 'missed';
    currentValue?: number;
    targetValue?: number;
    percentageComplete?: number;
    note?: string;
  }
) {
  const logId = id();
  
  return tx.habitLog[logId].update({
    ...data,
    date,
    dateTimestamp: new Date(date).getTime(),
    completedAt: data.status === 'completed' ? Date.now() : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }).link({ habit: habitId });
}

// Get habits for today
export function useTodayHabits() {
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay();
  
  return db.useQuery({
    habit: {
        $: {
            where: {
                
                isArchived: false,
                isDeleted: false,
                daysOfWeek: {$contains: dayOfWeek},
                   
            }
            
        }
    },
    habitLog: {
        $: {
            where: {
                date: today
            }
        }
    }
  });
}


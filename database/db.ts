import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';
import migrations from '../drizzle/migrations';
import { log } from '@/lib/utils';

let database: ReturnType<typeof drizzle> | null = null;

export const initializeDatabase = async () => {
  try {
    if (database) {
      return database; // Already initialized
    }

    log('Initialising database...', 'info')
    
    const expo = SQLite.openDatabaseSync('habitbloom.db');
    database = drizzle(expo);
    
    // Run migrations
    log('Running Migrations...', 'info')
    await migrate(database, migrations);
    
    log('✅ Database initialized and migrations completed', 'success');
    return database;
  } catch (error) {
    log('❌ Database initialization failed:', 'error' ,error);
    
    throw error;
  }
};

export const getDatabase = () => {
  if (!database) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return database;
};
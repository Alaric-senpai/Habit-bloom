import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';
import migrations from '../drizzle/migrations';

let database: ReturnType<typeof drizzle> | null = null;

export const initializeDatabase = async () => {
  try {
    if (database) {
      return database; // Already initialized
    }

    console.log('🔄 Initializing database...');
    
    const expo = SQLite.openDatabaseSync('habitbloom.db');
    database = drizzle(expo);
    
    // Run migrations
    console.log('🔄 Running migrations...');
    await migrate(database, migrations);
    
    console.log('✅ Database initialized and migrations completed');
    return database;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    throw error;
  }
};

export const getDatabase = () => {
  if (!database) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return database;
};
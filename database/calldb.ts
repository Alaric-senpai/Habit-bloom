import { getDatabase } from './db';
import * as schema from './schema';

// Export a function that returns the initialized database with schema
export const db = () => getDatabase();

// Export schema for easy access
export { schema };

// Default export for backward compatibility
export default db;
/**
 * Utility functions to help with build-time vs runtime behavior
 */
import { config } from './config';

/**
 * Wraps a database function to skip execution during build time
 * @param dbFn The database function to execute
 * @param fallbackValue The value to return during build time
 * @returns The result of the database function or the fallback value
 */
export async function safeDbCall<T>(dbFn: () => Promise<T>, fallbackValue: T): Promise<T> {
  // Skip database calls during build time
  if (config.db.skipDatabaseCalls) {
    console.log('Skipping database call during build time');
    return fallbackValue;
  }
  
  try {
    return await dbFn();
  } catch (error) {
    console.error('Database error:', error);
    return fallbackValue;
  }
}

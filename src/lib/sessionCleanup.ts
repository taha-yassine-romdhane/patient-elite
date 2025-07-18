/**
 * Session Cleanup Utilities
 * Handles automatic cleanup of expired sessions
 */

import { cleanupExpiredSessions } from './sessionAuth';

/**
 * Run session cleanup (can be called periodically)
 */
export async function runSessionCleanup(): Promise<void> {
  try {
    console.log('Starting session cleanup...');
    await cleanupExpiredSessions();
    console.log('Session cleanup completed successfully');
  } catch (error) {
    console.error('Error during session cleanup:', error);
  }
}

/**
 * Schedule periodic session cleanup
 * Call this when your app starts
 */
export function scheduleSessionCleanup(): void {
  // Run cleanup every hour
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  // Run initial cleanup
  runSessionCleanup();

  // Schedule periodic cleanup
  setInterval(() => {
    runSessionCleanup();
  }, CLEANUP_INTERVAL);

  console.log('Session cleanup scheduled to run every hour');
}

/**
 * API route for manual session cleanup (admin only)
 */
export async function handleCleanupRequest(request: Request): Promise<Response> {
  try {
    await runSessionCleanup();
    return new Response(
      JSON.stringify({ message: 'Session cleanup completed successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in cleanup request:', error);
    return new Response(
      JSON.stringify({ message: 'Error during session cleanup' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

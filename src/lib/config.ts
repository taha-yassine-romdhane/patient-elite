/**
 * Application configuration
 * This file provides configuration values that can change between environments
 */

// Determine if we're in build/SSG mode
export const isBuildTime = process.env.NEXT_PUBLIC_SKIP_DB_CALLS === 'true';

// Configuration object
export const config = {
  // Database settings
  db: {
    skipDatabaseCalls: isBuildTime,
  },
  // API settings
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  },
  // Auth settings
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
    tokenExpiry: '1d',
  },
};

export default config;

-- Add sessions table for database-based authentication
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Create unique index on token for fast lookups
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- Create index on userId for user session management
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- Create index on expiresAt for cleanup queries
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- Add foreign key constraint to technician table
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Technician"("id") ON DELETE CASCADE ON UPDATE CASCADE;

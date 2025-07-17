# Dockerfile for Next.js

# Stage 1: Base image with Node.js
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps

# Copy package files and lockfile
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Stage 3: Build the application
FROM base AS build

# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules /app/node_modules

# Copy the rest of the application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Stage 4: Production image
FROM base AS runner

# Set the environment to production
ENV NODE_ENV=production

# Copy the built application from the 'build' stage
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./

# Copy the standalone output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# The command to start the application
CMD ["node", ".next/standalone/server.js"]

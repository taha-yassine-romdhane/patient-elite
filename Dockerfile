# Stage 1: Base
FROM node:18-alpine AS base

# Stage 2: Dependencies
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache build-base gcc autoconf automake libtool nasm vips-dev python3 make g++
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Set environment variable to ignore Prisma checksum errors
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npm install --legacy-peer-deps


# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Temporarily disable database access during build to prevent connection attempts
# This is only for build time - the real DATABASE_URL will be used at runtime from .env
ENV NEXT_PUBLIC_SKIP_DB_CALLS=true
ENV SKIP_ENV_VALIDATION=1
ENV NEXT_TELEMETRY_DISABLED=1
# Skip TypeScript type checking during build
ENV NEXT_TYPESCRIPT_CHECK=0
# Force dynamic rendering for all pages
ENV NEXT_RUNTIME=nodejs
# Increase build timeout
ENV NEXT_STATIC_PAGE_GENERATION_TIMEOUT=180
# Completely disable static generation
# Set environment variable to ignore Prisma checksum errors in offline/restricted environments
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate --schema=./prisma/schema.prisma
# Build with no static generation
RUN npm run build

# Stage 4: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN apk add --no-cache vips-dev
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3002
ENV PORT 3002
ENV HOSTNAME "0.0.0.0"

# Command to run the application
CMD ["node", "server.js"]
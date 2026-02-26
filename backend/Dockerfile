# --- Builder stage ---
FROM node:22-alpine AS builder
WORKDIR /app
# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
# Copy workspace packages
COPY shared/ ./shared/
COPY backend/ ./backend/
# Install all dependencies (including devDependencies for build)
RUN npm ci
# Generate Prisma client
WORKDIR /app/backend
RUN npx prisma generate
# Compile TypeScript (rootDir=.. so output is dist/backend/src/ and dist/backend/prisma/)
RUN npx tsc --project tsconfig.docker.json
# --- Production stage ---
FROM node:22-alpine AS production
WORKDIR /app
# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY shared/ ./shared/
COPY backend/package.json ./backend/
# Install production dependencies only
RUN npm ci --omit=dev
# Copy compiled output (dist/backend/src/ + dist/backend/prisma/)
COPY --from=builder /app/backend/dist ./backend/dist
# Copy Prisma schema and migrations (needed for prisma migrate deploy)
COPY --from=builder /app/backend/prisma ./backend/prisma
# Copy generated Prisma client (needed at runtime)
COPY --from=builder /app/backend/src/generated ./backend/src/generated
# Copy entrypoint
COPY backend/entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x ./backend/entrypoint.sh
WORKDIR /app/backend
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]

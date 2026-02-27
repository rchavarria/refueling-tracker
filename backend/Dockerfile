FROM node:22-alpine

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
# Install dependencies
RUN npm ci

# copy source code (.ts files)
COPY shared/ ./shared/
COPY backend/ ./backend/

# Copy entrypoint
COPY backend/entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x ./backend/entrypoint.sh

WORKDIR /app/backend
RUN npx prisma generate

RUN npm run db:seed

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]

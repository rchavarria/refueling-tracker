FROM node:24-alpine

EXPOSE 3000

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
# Install dependencies
RUN npm clean-install

# Copy entrypoint
COPY backend/entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x ./backend/entrypoint.sh

WORKDIR /app/backend

ENTRYPOINT ["./entrypoint.sh"]

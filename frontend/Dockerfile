# --- Builder stage ---
FROM node:22-alpine AS builder
WORKDIR /app
# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
# Copy workspace packages
COPY shared/ ./shared/
COPY frontend/ ./frontend/
# Install all dependencies
RUN npm ci
# Build arg for API URL (baked into the static bundle at build time)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app/frontend
# Build the frontend
RUN npm run build
# --- Production stage ---
FROM nginx:1.27-alpine AS production
# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*
# Copy built assets
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

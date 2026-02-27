FROM node:24-alpine

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
# Copy workspace packages
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Install all dependencies
RUN npm clean-install

# Build arg for API URL (baked into the static bundle at build time)
#ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=http://localhost:3000

# Build the frontend
RUN npm run build --workspace=shared
RUN npm run build --workspace=frontend

WORKDIR /app/frontend

ENTRYPOINT ["npm", "run", "dev"]

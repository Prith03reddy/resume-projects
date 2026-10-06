# Multi-stage Dockerfile for Chaukanna Bharat API
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package manifests
COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared library and api
RUN npm run build -w packages/shared
RUN npm run build -w apps/api

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/dist ./packages/shared/dist
COPY apps/api/package.json ./apps/api/
COPY apps/api/dist ./apps/api/dist

RUN npm install --omit=dev --workspace=packages/shared --workspace=apps/api

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]

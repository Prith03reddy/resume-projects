# Multi-stage Dockerfile for Chaukanna Bharat Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests
COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/vite.config.ts ./apps/web/
COPY apps/web/tailwind.config.js ./apps/web/
COPY apps/web/postcss.config.js ./apps/web/
COPY apps/web/index.html ./apps/web/

# Install dependencies
RUN npm install

# Copy source
COPY packages/shared ./packages/shared
COPY apps/web/src ./apps/web/src

# Build shared library and web
RUN npm run build -w packages/shared
RUN npm run build -w apps/web

# Nginx static server
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

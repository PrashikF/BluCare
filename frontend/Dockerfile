# Multi-stage Dockerfile for BluCare+ React/Vite Frontend
FROM node:20-alpine AS build

WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code and build Vite static bundle
COPY . .
RUN npm run build

# Production serving stage using Nginx
FROM nginx:alpine

# Copy custom Nginx SPA configuration and built static assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Container Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1
# Launch Nginx
CMD ["nginx", "-g", "daemon off;"]

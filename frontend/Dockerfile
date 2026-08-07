# Multi-stage Dockerfile for BluCare+ React/Vite Frontend
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code and build Vite static bundle
COPY . .
RUN npm run build

# Production serving stage using Nginx
FROM nginx:alpine

# Copy custom Nginx SPA configuration
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Launch Nginx
CMD ["nginx", "-g", "daemon off;"]

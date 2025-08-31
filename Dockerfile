# 1. Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Build Vite frontend
RUN npm run build

# ------------------------
# Production stage
# ------------------------
FROM node:20-slim

WORKDIR /app

# Copy backend files
COPY server.js ./
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 6969

# Start server
CMD ["node", "server.js"]
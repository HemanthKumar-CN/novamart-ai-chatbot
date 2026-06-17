FROM node:20-alpine

# Set working directory
WORKDIR /app

# wget is needed for HEALTHCHECK; not in alpine by default since 3.18
RUN apk add --no-cache wget

# Install deps separately for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy source
COPY . .

# Expose port (matches docker-compose PORT env var)
EXPOSE 5050

# Healthcheck — server runs on 5050 (set in docker-compose)
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5050/health || exit 1

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Start the app
CMD ["node", "src/index.js"]

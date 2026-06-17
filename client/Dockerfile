# ====================================
# Stage 1: Build the React app with Vite
# ====================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build-time env: in docker we use relative path (same-origin via nginx)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ====================================
# Stage 2: Serve with nginx
# ====================================
FROM nginx:1.27-alpine

# wget is needed for HEALTHCHECK; not in alpine by default since 3.18
RUN apk add --no-cache wget

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built assets — ensure the default `nginx` user can read them
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

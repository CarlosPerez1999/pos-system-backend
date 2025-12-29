FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm build

### Final image with Postgres and app
FROM node:22-alpine

RUN apk add --no-cache bash su-exec shadow postgresql postgresql-client postgresql-contrib openssl ca-certificates \
	&& (addgroup -S postgres || true) \
	&& (adduser -S -G postgres postgres || true)

WORKDIR /app

# Create directories
RUN mkdir -p /var/lib/postgresql/data /app/dist /app/node_modules

# Copy built app and production deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy entrypoint
COPY docker-entrypoint-multi.sh /usr/local/bin/docker-entrypoint-multi.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-multi.sh

# Expose port used by Nest
EXPOSE 3000

VOLUME ["/var/lib/postgresql/data"]

USER root

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-multi.sh"]

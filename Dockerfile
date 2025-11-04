FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Install OS deps needed by Prisma engines and Next.js build
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy manifests and Prisma schema BEFORE install so postinstall can find it
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies (postinstall will run prisma generate successfully now)
RUN npm ci || npm install

# Ensure Prisma client is generated (idempotent)
RUN npx prisma generate

# Copy the rest of the source
COPY . .

# Build Next.js app
RUN npm run build


FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install minimal runtime deps for Prisma engines
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy production node_modules, build output, public assets, prisma schema
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Health check endpoint (optional, handled via app /health)

# Expose app port
EXPOSE 3000

# Entrypoint runs Prisma schema sync for SQLite, then starts the app
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]
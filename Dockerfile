FROM node:20-slim AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm install

FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm run backend:build

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy built files
COPY --from=builder --chown=node:node /app/build ./frontend/build
COPY --from=builder --chown=node:node /app/backend/dist ./backend/dist
COPY --from=builder --chown=node:node /app/backend/migrations ./backend/migrations
COPY --from=builder --chown=node:node /app/backend/scripts ./backend/scripts
COPY --from=builder --chown=node:node /app/.env.example ./.env.example

# Create entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "backend/dist/index.js"]

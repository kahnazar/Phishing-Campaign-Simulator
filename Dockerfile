FROM node:20-slim AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder --chown=node:node /app/server ./server
COPY --from=builder --chown=node:node /app/.env.example ./
COPY --from=builder --chown=node:node /app/index.html ./
USER node
EXPOSE 4000
CMD ["npm", "start"]

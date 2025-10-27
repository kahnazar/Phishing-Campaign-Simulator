FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies for building the client bundle
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source and build the client
COPY . .
RUN npm run build


FROM node:20-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies for the server
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy built client assets and server files
COPY --from=builder /app/build ./build
COPY --chown=node:node server ./server

# Run the API + static file server
USER node
EXPOSE 4000
CMD ["node", "server/index.js"]

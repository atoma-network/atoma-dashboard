# Build stage
FROM node:18-slim AS builder

WORKDIR /app

COPY package*.json ./

# Install dependencies with legacy-peer-deps
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim

# Add node user for security
RUN groupadd -r nodejs && \
    useradd -r -g nodejs nodejs

WORKDIR /app

ARG NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER nodejs

EXPOSE 3000

CMD ["npm", "run", "start"]

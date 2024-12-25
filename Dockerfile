# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy only the necessary files to install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the entire project and build the app
COPY . .
RUN yarn build

# Production Stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .

EXPOSE 3000
CMD ["yarn", "start"]

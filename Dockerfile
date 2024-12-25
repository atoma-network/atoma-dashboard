# Build stage
FROM node:18-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN npx next build

# Production stage
FROM node:18-slim

# Add a non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set the working directory for the production container
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ARG NODE_ENV

# Use the non-root user
USER appuser

# Expose the port your app runs on
EXPOSE 3000

# Start the Next.js server
CMD ["npx", "next", "start"]

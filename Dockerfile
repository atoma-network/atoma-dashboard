FROM node:18-alpine
WORKDIR /app

# Copy the entire project
COPY . .

CMD ["npm", "run", "dev"]
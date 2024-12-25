FROM node:18-alpine
WORKDIR /app

# Copy the entire project
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
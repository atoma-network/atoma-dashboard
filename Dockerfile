FROM node:18-alpine
WORKDIR /app

COPY package*.json ./

RUN npm install --force

# Copy the entire project
COPY . .

# Accept build arguments and set environment variables
ARG NEXT_PUBLIC_PROXY_URL
ARG NEXT_PUBLIC_PROXY_WALLET
ARG NEXT_PUBLIC_USDC_TYPE
ENV NEXT_PUBLIC_PROXY_URL=$NEXT_PUBLIC_PROXY_URL
ENV NEXT_PUBLIC_PROXY_WALLET=$NEXT_PUBLIC_PROXY_WALLET
ENV NEXT_PUBLIC_USDC_TYPE=$NEXT_PUBLIC_USDC_TYPE

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]

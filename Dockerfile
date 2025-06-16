# Build stage
#FROM node:18-alpine AS builder
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#RUN npm run build
#EXPOSE 3000
#CMD ["npm", "run", "start"]
#Build npm
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
#COPY /node_modules ./node_modules
COPY . .
RUN npm run build

# Serve
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV PORT=3000
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"] 
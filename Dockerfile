# Base image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]

# Use Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from the frontend directory
COPY src/frontend/get-to-know-game/package*.json ./

# Install dependencies
RUN npm install

# Copy source code from the frontend directory
COPY src/frontend/get-to-know-game/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 80

# Start the application in production mode
CMD ["node", "build"]
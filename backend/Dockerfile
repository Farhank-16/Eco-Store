# ============================================
# Backend: Node.js Express API
# ============================================
FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only (nodemon is not needed in Docker)
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# Expose the backend port
EXPOSE 3000

# Start the server with Node directly (not nodemon)
CMD ["node", "index.js"]

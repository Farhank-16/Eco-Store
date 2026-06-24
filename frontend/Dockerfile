# ============================================
# Stage 1: Build the React (Vite) application
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Set the backend API URL for the production build.
# In production, Nginx proxies /api/* to the backend container,
# so the frontend just needs to hit the same origin.
ARG VITE_BASE_URL=/api
ENV VITE_BASE_URL=$VITE_BASE_URL

# Build the production bundle → outputs to /app/dist
RUN npm run build


# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:1.27-alpine AS production

# Remove the default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]

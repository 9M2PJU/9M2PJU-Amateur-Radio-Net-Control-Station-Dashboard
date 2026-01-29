# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
# We need to pass the VITE_ variables at build time if we want them baked in,
# BUT for a docker setup, it's often better to load them at runtime or expect them in .env
# For this setup, we'll assume they are provided in .env.local or via build args if needed.
# Since we are moving to a local Docker stack, the URL will be localhost.
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

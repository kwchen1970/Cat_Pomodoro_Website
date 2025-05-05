# Use Nginx base image
FROM nginx:stable-alpine

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Install pnpm globally
RUN npm install -g pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Clean old installs, install fresh deps, build all packages
RUN rm -rf node_modules **/node_modules
RUN pnpm install
RUN pnpm run build

# Copy frontend output to Nginx public directory
RUN cp -r ./frontend/dist/* /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Install PM2 for running the backend server
RUN npm install -g pm2

# Copy backend output (after build) to ensure it's available
# Your build step must emit backend dist to /app/backend/dist
# If not, make sure it does!
RUN test -f /app/backend/dist/backend/server.js

# Add and make start script executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose frontend and backend ports (if backend is reverse-proxied, 80 is enough)
EXPOSE 80

# Start Nginx and backend server
ENTRYPOINT ["/start.sh"]

#!/bin/sh

# Start the backend in the background
node /app/backend/dist/backend/server.js &

# Start nginx in foreground
exec nginx -g "daemon off;"
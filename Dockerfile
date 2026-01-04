# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_FOOTBALL_API_KEY
ENV VITE_FOOTBALL_API_KEY=$VITE_FOOTBALL_API_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config as template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Railway sets PORT dynamically, default to 80 for local development
ENV PORT=80
EXPOSE $PORT

# Use envsubst to replace ${PORT} in nginx config, then start nginx
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"

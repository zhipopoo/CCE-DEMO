# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files and set correct permissions
COPY --from=build /app/build /usr/share/nginx/html

# Fix permissions for nginx
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# Note: nginx.conf is now managed via Kubernetes ConfigMap
# Do not copy nginx.conf here as it will be mounted via ConfigMap

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

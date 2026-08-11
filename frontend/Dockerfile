# ── Stage 1: Build React app ──
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Inject API Gateway URL at build time
ARG REACT_APP_API_GATEWAY_URL=http://localhost:3000/api
ENV REACT_APP_API_GATEWAY_URL=$REACT_APP_API_GATEWAY_URL

RUN CI=false npm run build

# ── Stage 2: Serve with nginx ──
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx config to handle React Router (SPA routing)
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
  location /api { \
    proxy_pass http://api-gateway:3000; \
    proxy_http_version 1.1; \
    proxy_set_header Upgrade $http_upgrade; \
    proxy_set_header Connection "upgrade"; \
    proxy_set_header Host $host; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

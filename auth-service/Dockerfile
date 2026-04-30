FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# serviceAccountKey.json must be present (copied by docker-compose or mounted)
# It is expected at: /app/serviceAccountKey.json

EXPOSE 3001

CMD ["node", "server.js"]

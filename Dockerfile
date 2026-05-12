FROM node:18-slim

# Create app directory
WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm i 

# Copy application source
COPY . .

# Default environment
ENV NODE_ENV=production

# Port (Render sets PORT via env; default fallback 3000)
EXPOSE 3001

# Start the app
CMD ["npm", "start"]

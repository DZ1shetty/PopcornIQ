FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

EXPOSE 5173

# Run Vite dev server, bound to all interfaces so it is accessible from the host
CMD ["npm", "run", "dev", "--", "--host"]

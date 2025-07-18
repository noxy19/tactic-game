FROM node:20-alpine

WORKDIR /app

# Copy manifests
COPY package*.json tsconfig.base.json ./
COPY frontend/package*.json frontend/tsconfig.json ./frontend/

RUN npm install

COPY . .

WORKDIR /app/frontend

# Expose Vite dev port
EXPOSE 5173

# Run Vite dev server binding to 0.0.0.0 so it's reachable outside the container
CMD ["sh", "-c", "npm run dev -- --host"] 
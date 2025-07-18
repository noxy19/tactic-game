FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy root manifests and backend manifest for workspaces
COPY package*.json tsconfig.base.json ./
COPY backend/package*.json backend/tsconfig.json ./backend/


# Copy the remaining source code
COPY . .

# Switch to backend package directory
WORKDIR /app/backend

# Install all workspace dependencies
RUN npm install

# make root workspace binaries visible everywhere
ENV PATH="/app/node_modules/.bin:${PATH}"

# Expose backend port
EXPOSE 3001

# Run in development mode with hot-reload
CMD ["npm", "run", "dev"] 
# ==========================================
# Stage 1: Build Frontend (Vite + React)
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install dependencies needed for node-gyp / sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

# Copy source code and build frontend bundle
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production Server (Node.js + Express)
# ==========================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install native compilation dependencies for SQLite runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies & compile native addons from source
COPY package*.json ./
RUN npm install --omit=dev && npm rebuild sqlite3 --build-from-source

# Remove build tools after compiling to keep image small
RUN apt-get purge -y --auto-remove python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy backend files and application assets
COPY server/ ./server/
COPY data/ ./data/
COPY uploads/ ./uploads/
COPY public/ ./public/

# Copy compiled frontend from builder stage
COPY --from=builder /app/dist ./dist

# Create necessary persistent runtime folders
RUN mkdir -p /app/data /app/uploads

# Expose backend / application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the Node.js application
CMD ["node", "server/server.js"]

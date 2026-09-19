# Zero-Cost Production Dockerfile for CyberPathway RAG
# Pure JavaScript (Node.js 22 LTS ESM runtime)

FROM node:22-slim AS base

# Install security updates
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create unprivileged user for security
RUN groupadd -r cyberapp && useradd -r -g cyberapp -d /app -s /sbin/nologin cyberapp

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY --chown=cyberapp:cyberapp . .

# Ensure data directory exists and is writable by cyberapp
RUN mkdir -p /app/data && chown -R cyberapp:cyberapp /app/data

# Switch to non-root user
USER cyberapp

# Expose standard application port
EXPOSE 3000

# Environment defaults (100% zero-cost local defaults)
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    LLM_PROVIDER=local

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Start application server with experimental SQLite enabled
CMD ["node", "--experimental-sqlite", "src/server.js"]

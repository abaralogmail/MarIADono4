# Multi-stage build for WhatsApp Bot System
FROM node:20-alpine as base

# Install system dependencies for SQLite, FFmpeg, and native modules
RUN apk add --no-cache \
    sqlite \
    sqlite-dev \
    ffmpeg \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p \
    bot_sessions \
    BotAdministracionSalta_sessions \
    BotAugustoTucuman_sessions \
    BotConsultasWeb_sessions \
    BotConsultasWebTucuman_sessions \
    BotCursosSalta_sessions \
    BotJujuy_sessions \
    BotOfertasSalta_sessions \
    BotOfertasTucuman_sessions \
    "BotRamiro()_sessions" \
    BD_Clientes \
    Logs \
    tmp \
    mensajes \
    && chown -R app:nodejs /app

# Switch to app user
USER app

# Environment variables (will be overridden by docker-compose or runtime)
ENV NODE_ENV=production
ENV OPENAI_API_KEY=""
ENV ASSISTANT_ID=""
ENV ASSISTANT_ID_2=""
ENV NOTION_API_KEY=""
ENV N8N_WEBHOOK_TOKEN=""
ENV N8N_WEBHOOK_USERNAME=""
ENV N8N_WEBHOOK_PASSWORD=""
ENV ANYTHINGLLM_API_KEY=""
ENV SQLITE_DB_PATH="/app/db.json"
ENV DB_HOST=""
ENV DB_PORT="5432"
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWORD=""
ENV DB_SSL="false"

# Expose all required ports
# Main bot portal
EXPOSE 3000
# Multiple bot portals (6001-6009)
EXPOSE 6001 6002 6003 6004 6005 6006 6007 6008 6009
# Dashboard port
EXPOSE 4152

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "process.exit(0)"

# Start command
CMD ["npm", "start"]

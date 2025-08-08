# GitHub MCP Server - Docker Build
# This Dockerfile creates an optimized container for the GitHub MCP Server
# using the published npm package for easy deployment

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies and Git
RUN apk add --no-cache \
    git \
    openssh-client \
    ca-certificates \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Install the published npm package globally
RUN npm install -g @0xshariq/github-mcp-server@2.0.1

# Create data directory for repositories
RUN mkdir -p /app/data && \
    chown mcp:nodejs /app/data

# Set Git global configuration for container
RUN git config --global user.name "MCP Server" && \
    git config --global user.email "mcp@container.local" && \
    git config --global init.defaultBranch main && \
    git config --global safe.directory '*'

# Expose port for potential HTTP interface
EXPOSE 3000

# Switch to non-root user
USER mcp

# Security settings
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD github-mcp-server --version || exit 1

# Set default command to start MCP server
CMD ["github-mcp-server"]

# Metadata labels
LABEL \
    org.opencontainers.image.title="GitHub MCP Server" \
    org.opencontainers.image.description="Enhanced Git workflow management through MCP with 29 Git operations, CLI aliases, and MCP integration" \
    org.opencontainers.image.version="2.0.1" \
    org.opencontainers.image.authors="Sharique Chaudhary" \
    org.opencontainers.image.source="https://github.com/0xshariq/github-mcp-server" \
    org.opencontainers.image.licenses="ISC" \
    org.opencontainers.image.documentation="https://github.com/0xshariq/github-mcp-server/blob/main/README.md" \
    org.opencontainers.image.url="https://www.npmjs.com/package/@0xshariq/github-mcp-server"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('GitHub MCP Server is healthy')" || exit 1

# Set default command
CMD ["node", "dist/index.js"]

# Metadata labels
LABEL \
    org.opencontainers.image.title="GitHub MCP Server" \
    org.opencontainers.image.description="Enhanced Git workflow management through MCP with 15 basic operations, 14 advanced workflows, and comprehensive remote management" \
    org.opencontainers.image.version="2.0.1" \
    org.opencontainers.image.authors="Sharique Chaudhary" \
    org.opencontainers.image.source="https://github.com/0xshariq/github-mcp-server" \
    org.opencontainers.image.licenses="ISC" \
    org.opencontainers.image.documentation="https://github.com/0xshariq/github-mcp-server/blob/main/README.md"

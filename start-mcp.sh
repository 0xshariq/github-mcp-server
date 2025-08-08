#!/bin/bash

##############################################################################
# Universal MCP Server Startup Script for GitHub MCP Server
# 
# Compatible with:
# - Claude Desktop (Anthropic)
# - Cursor IDE
# - Continue (VS Code Extension)
# - Open WebUI
# - Any MCP-compatible client
#
# This script provides a universal interface for starting the GitHub MCP Server
# with proper Node.js environment setup regardless of the calling client.
##############################################################################

# Set script options for better error handling
set -euo pipefail

# === CONFIGURATION ===
PROJECT_DIR="/home/simplysabir/desktop/shariq-projects/github-mcp-server"
NODE_VERSION="24.4.1"
SERVER_FILE="dist/index.js"

# === LOGGING FUNCTIONS ===
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2
}

error() {
    log "ERROR: $*"
    exit 1
}

# === ENVIRONMENT SETUP ===
setup_fnm_environment() {
    log "Setting up fnm environment..."
    
    export FNM_PATH="$HOME/.local/share/fnm"
    
    if [ ! -d "$FNM_PATH" ]; then
        error "fnm not found at $FNM_PATH"
    fi
    
    export PATH="$FNM_PATH:$PATH"
    eval "$(fnm env --use-on-cd)"
    
    # Use specific Node.js version
    if ! fnm use "$NODE_VERSION" 2>/dev/null; then
        error "Node.js v$NODE_VERSION not found. Available versions: $(fnm list)"
    fi
    
    log "Using Node.js $(node --version)"
}

# === VALIDATION ===
validate_environment() {
    log "Validating environment..."
    
    # Check if we're in the correct directory
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Project directory not found: $PROJECT_DIR"
    fi
    
    cd "$PROJECT_DIR" || error "Cannot change to project directory"
    
    # Check if Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js not found in PATH"
    fi
    
    # Check if server file exists
    if [ ! -f "$SERVER_FILE" ]; then
        error "MCP server file not found: $SERVER_FILE"
    fi
    
    log "Environment validation completed"
}

# === MCP SERVER STARTUP ===
start_mcp_server() {
    log "Starting GitHub MCP Server..."
    log "Working directory: $(pwd)"
    log "Node.js version: $(node --version)"
    log "npm version: $(npm --version)"
    
    # Set environment variables for MCP
    export NODE_ENV=production
    export MCP_SERVER_NAME="github-mcp-server"
    export MCP_SERVER_VERSION="1.8.3"
    
    # Start the MCP server
    log "Executing: node $SERVER_FILE"
    exec node "$SERVER_FILE"
}

# === MAIN EXECUTION ===
main() {
    log "=== GitHub MCP Server Universal Startup ==="
    log "Compatible with Claude Desktop, Continue, Open WebUI, and other MCP clients"
    
    setup_fnm_environment
    validate_environment
    start_mcp_server
}

# Run main function
main "$@"
#!/bin/bash

##############################################################################
# Universal MCP Server Startup Script for GitHub MCP Server v2.0.1
# 
# Compatible with:
# - Claude Desktop (Anthropic)
# - Cursor IDE
# - Continue (VS Code Extension)
# - Open WebUI
# - Any MCP-compatible client
#
# This enhanced script provides a beautiful, universal interface for starting 
# the GitHub MCP Server with proper Node.js environment setup and improved 
# user experience with colored output.
##############################################################################

# Set script options for better error handling
set -euo pipefail

# === CONFIGURATION ===
PROJECT_DIR="/home/simplysabir/desktop/shariq-projects/github-mcp-server"
NODE_VERSION="20.0.0"
SERVER_FILE="dist/index.js"
SERVER_VERSION="2.0.1"
SERVER_NAME="@0xshariq/github-mcp-server"

# === COLORS AND STYLING ===
# ANSI color codes for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# Unicode symbols for better visual appeal
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"
FOLDER="📁"
ARROW="→"
STAR="⭐"

# === ENHANCED LOGGING FUNCTIONS ===
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GRAY}[${timestamp}]${RESET} ${INFO} $*" >&2
}

success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GRAY}[${timestamp}]${RESET} ${SUCCESS} ${GREEN}$*${RESET}" >&2
}

error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GRAY}[${timestamp}]${RESET} ${ERROR} ${RED}$*${RESET}" >&2
    exit 1
}

warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GRAY}[${timestamp}]${RESET} ${WARNING} ${YELLOW}$*${RESET}" >&2
}

info() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GRAY}[${timestamp}]${RESET} ${INFO} ${BLUE}$*${RESET}" >&2
}

header() {
    echo -e "${CYAN}${BOLD}$*${RESET}" >&2
}

# Show startup banner
show_banner() {
    echo ""
    echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${CYAN}${BOLD}║${RESET}  ${ROCKET} ${MAGENTA}${BOLD}GitHub MCP Server Universal Startup${RESET}          ${CYAN}${BOLD}║${RESET}"
    echo -e "${CYAN}${BOLD}║${RESET}  ${STAR} ${BLUE}Version: ${SERVER_VERSION}${RESET}                                   ${CYAN}${BOLD}║${RESET}"
    echo -e "${CYAN}${BOLD}║${RESET}  ${GEAR} ${DIM}Compatible with all MCP clients${RESET}                    ${CYAN}${BOLD}║${RESET}"
    echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

# === ENVIRONMENT SETUP ===
setup_fnm_environment() {
    info "Setting up fnm environment..."
    
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
    
    success "Using Node.js $(node --version)"
}

# === VALIDATION ===
validate_environment() {
    info "Validating environment..."
    
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
    
    success "Environment validation completed"
}

# === MCP SERVER STARTUP ===
start_mcp_server() {
    info "Starting GitHub MCP Server..."
    
    # Display environment information
    echo ""
    header "${FOLDER} Environment Information:"
    echo -e "  ${ARROW} ${BLUE}Working Directory:${RESET} ${CYAN}$(pwd)${RESET}"
    echo -e "  ${ARROW} ${BLUE}Node.js Version:${RESET} ${GREEN}$(node --version)${RESET}"
    echo -e "  ${ARROW} ${BLUE}npm Version:${RESET} ${GREEN}$(npm --version)${RESET}"
    echo -e "  ${ARROW} ${BLUE}Server Package:${RESET} ${MAGENTA}${SERVER_NAME}${RESET}"
    echo -e "  ${ARROW} ${BLUE}Server Version:${RESET} ${CYAN}v${SERVER_VERSION}${RESET}"
    echo ""
    
    # Set environment variables for MCP
    export NODE_ENV=production
    export MCP_SERVER_NAME="github-mcp-server"
    export MCP_SERVER_VERSION="$SERVER_VERSION"
    
    # Start the MCP server
    header "${ROCKET} Launching GitHub MCP Server..."
    info "Executing: ${WHITE}node $SERVER_FILE${RESET}"
    echo ""
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo ""
    
    exec node "$SERVER_FILE"
}

# === MAIN EXECUTION ===
main() {
    show_banner
    header "Compatible with Claude Desktop, Continue, Open WebUI, and other MCP clients"
    echo ""
    
    setup_fnm_environment
    validate_environment
    start_mcp_server
}

# Run main function
main "$@"
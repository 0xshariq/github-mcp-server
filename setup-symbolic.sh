#!/bin/bash

##############################################################################
# GitHub MCP Server - Symbolic Link Setup Script
# 
# This script creates symbolic links for all git aliases to make them available
# globally without needing npm link or pnpm global installation.
# 
# Compatible with:
# - Linux (Ubuntu, Debian, CentOS, Fedora, Arch, etc.)
# - macOS (Intel and Apple Silicon)
# - Windows WSL/WSL2
# - Windows Git Bash/MSYS2
# - FreeBSD, OpenBSD, NetBSD
# - Any POSIX-compliant system
#
# Usage:
#   ./setup-symbolic.sh           # Create links in /usr/local/bin (requires sudo)
#   ./setup-symbolic.sh ~/bin     # Create links in custom directory
#   ./setup-symbolic.sh --user    # Create links in ~/.local/bin
#   ./setup-symbolic.sh --remove  # Remove existing symbolic links
#   ./setup-symbolic.sh --help    # Show help information
##############################################################################

set -euo pipefail

# === CONFIGURATION ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
MCP_CLI_PATH="$PROJECT_DIR/mcp-cli.js"
VERSION="2.4.1"

# === COLORS AND STYLING ===
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

# === ICONS ===
CHECKMARK="✅"
CROSS="❌"
ARROW="➤"
ROCKET="🚀"
GEAR="⚙️"
LINK="🔗"
TRASH="🗑️"
FOLDER="📁"
STAR="⭐"

# === GIT ALIASES TO CREATE ===
declare -a GIT_ALIASES=(
    # Basic Git Operations
    "gadd"
    "gcommit" 
    "ginit"
    "gstatus"
    "gpush"
    "gpull"
    "gbranch"
    "gcheckout"
    "gclone"
    "gdiff"
    "glog"
    "gremote"
    "greset"
    "gstash"
    "gpop"
    
    # Advanced Git Operations  
    "gflow"
    "gquick"
    "gsync"
    "gdev"
    "gworkflow"
    "gfix"
    "gfresh"
    "gbackup"
    "gclean"
    "gsave"
    "glist"
    "grelease"
)

# === PLATFORM DETECTION ===
detect_platform() {
    local os_type=""
    local shell_type=""
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        os_type="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        os_type="macos"
    elif [[ "$OSTYPE" == "cygwin" ]]; then
        os_type="windows-cygwin"
    elif [[ "$OSTYPE" == "msys" ]]; then
        os_type="windows-msys"
    elif [[ "$OSTYPE" == "freebsd"* ]]; then
        os_type="freebsd"
    else
        os_type="unknown"
    fi
    
    # Detect if running in WSL
    if [[ -f /proc/version ]] && grep -q Microsoft /proc/version 2>/dev/null; then
        os_type="windows-wsl"
    fi
    
    echo "$os_type"
}

# === UTILITY FUNCTIONS ===
log() {
    # Use printf for better cross-platform compatibility
    if command -v printf >/dev/null 2>&1; then
        printf "${1}\n" >&2
    else
        echo -e "${1}" >&2
    fi
}

info() {
    log "${BLUE}${ARROW}${RESET} ${1}"
}

success() {
    log "${GREEN}${CHECKMARK}${RESET} ${1}"
}

error() {
    log "${RED}${CROSS}${RESET} ${1}"
}

warning() {
    log "${YELLOW}⚠️${RESET} ${1}"
}

header() {
    log "${CYAN}${BOLD}${1}${RESET}"
}

# === BANNER ===
show_banner() {
    echo ""
    log "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
    log "${CYAN}${BOLD}║${RESET}  ${LINK} ${MAGENTA}${BOLD}GitHub MCP Server - Symbolic Link Setup${RESET}           ${CYAN}${BOLD}║${RESET}"
    log "${CYAN}${BOLD}║${RESET}  ${STAR} ${BLUE}Version: ${VERSION}${RESET}                                   ${CYAN}${BOLD}║${RESET}"
    log "${CYAN}${BOLD}║${RESET}  ${GEAR} ${DIM}Creates global git aliases via symbolic links${RESET}        ${CYAN}${BOLD}║${RESET}"
    log "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

# === HELP FUNCTION ===
show_help() {
    cat << EOF
${CYAN}${BOLD}GitHub MCP Server - Symbolic Link Setup${RESET}

${YELLOW}DESCRIPTION:${RESET}
    This script creates symbolic links for all git aliases (gadd, gcommit, gflow, etc.)
    to make them available globally without npm/pnpm installation.

${YELLOW}USAGE:${RESET}
    ${GREEN}./setup-symbolic.sh${RESET}              # Install to /usr/local/bin (requires sudo)
    ${GREEN}./setup-symbolic.sh ~/bin${RESET}        # Install to custom directory  
    ${GREEN}./setup-symbolic.sh --user${RESET}       # Install to ~/.local/bin
    ${GREEN}./setup-symbolic.sh --remove${RESET}     # Remove existing symbolic links
    ${GREEN}./setup-symbolic.sh --help${RESET}       # Show this help

${YELLOW}EXAMPLES:${RESET}
    ${GRAY}# System-wide installation (recommended)${RESET}
    ${BLUE}sudo ./setup-symbolic.sh${RESET}

    ${GRAY}# User-only installation${RESET}
    ${BLUE}./setup-symbolic.sh --user${RESET}

    ${GRAY}# Custom directory${RESET}
    ${BLUE}./setup-symbolic.sh /opt/local/bin${RESET}

    ${GRAY}# Remove all links${RESET}
    ${BLUE}./setup-symbolic.sh --remove${RESET}

${YELLOW}ALIASES CREATED:${RESET}
    ${GREEN}Basic Git:${RESET} gadd, gcommit, ginit, gstatus, gpush, gpull, gbranch, 
               gcheckout, gclone, gdiff, glog, gremote, greset, gstash, gpop

    ${GREEN}Advanced:${RESET}  gflow, gquick, gsync, gdev, gworkflow, gfix, gfresh,
               gbackup, gclean, gsave, glist, grelease

${YELLOW}REQUIREMENTS:${RESET}
    - Node.js installed and in PATH
    - Built project (npm run build)
    - Write permissions to target directory

EOF
}

# === VALIDATION FUNCTIONS ===
validate_environment() {
    local platform
    platform=$(detect_platform)
    
    header "${GEAR} Validating Environment..."
    info "Platform detected: ${CYAN}$platform${RESET}"
    
    # Check if we're in the correct directory
    if [[ ! -f "$MCP_CLI_PATH" ]]; then
        error "mcp-cli.js not found at: $MCP_CLI_PATH"
        error "Please run this script from the GitHub MCP Server project directory"
        exit 1
    fi
    
    # Check if Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js is not installed or not in PATH"
        case "$platform" in
            "linux")
                error "Install with: ${WHITE}curl -fsSL https://fnm.vercel.app/install | bash${RESET}"
                ;;
            "macos")
                error "Install with: ${WHITE}brew install node${RESET} or visit https://nodejs.org/"
                ;;
            "windows-"*)
                error "Install from: ${WHITE}https://nodejs.org/${RESET} or use ${WHITE}winget install nodejs${RESET}"
                ;;
            *)
                error "Please install Node.js first: https://nodejs.org/"
                ;;
        esac
        exit 1
    fi
    
    # Display Node.js version for confirmation
    local node_version
    node_version=$(node --version 2>/dev/null || echo "unknown")
    info "Node.js version: ${GREEN}$node_version${RESET}"
    
    # Check if project is built
    if [[ ! -f "$PROJECT_DIR/dist/index.js" ]]; then
        warning "Project not built. Running build command..."
        cd "$PROJECT_DIR"
        
        # Check if npm is available
        if ! command -v npm >/dev/null 2>&1; then
            error "npm is not available. Please install Node.js with npm."
            exit 1
        fi
        
        npm run build || {
            error "Failed to build project"
            exit 1
        }
    fi
    
    # Make mcp-cli.js executable (cross-platform)
    chmod +x "$MCP_CLI_PATH" 2>/dev/null || {
        warning "Could not set executable permissions on mcp-cli.js"
        warning "You may need to run: ${WHITE}chmod +x $MCP_CLI_PATH${RESET}"
    }
    
    success "Environment validation completed"
}

# === TARGET DIRECTORY FUNCTIONS ===
determine_target_directory() {
    local target_dir=""
    local platform
    platform=$(detect_platform)
    
    if [[ $# -eq 0 ]]; then
        # Platform-specific default directories
        case "$platform" in
            "linux"|"freebsd")
                target_dir="/usr/local/bin"
                ;;
            "macos")
                target_dir="/usr/local/bin"
                ;;
            "windows-wsl"|"windows-cygwin"|"windows-msys")
                target_dir="$HOME/.local/bin"
                warning "Windows environment detected - using user installation by default"
                ;;
            *)
                target_dir="$HOME/.local/bin"
                warning "Unknown platform - using user installation by default"
                ;;
        esac
        
        # Check for sudo requirement (except on Windows environments)
        if [[ "$platform" != "windows-"* && "$target_dir" == "/usr/local/bin" && $EUID -ne 0 ]]; then
            error "Default installation requires sudo privileges"
            info "Run: ${WHITE}sudo $0${RESET}"
            info "Or use: ${WHITE}$0 --user${RESET} for user installation"
            exit 1
        fi
        
        # Create directory if it doesn't exist
        if [[ ! -d "$target_dir" ]]; then
            mkdir -p "$target_dir" 2>/dev/null || {
                error "Failed to create directory: $target_dir"
                exit 1
            }
        fi
        
    elif [[ "$1" == "--user" ]]; then
        # User installation - platform specific
        case "$platform" in
            "windows-"*)
                target_dir="$HOME/.local/bin"
                ;;
            *)
                target_dir="$HOME/.local/bin"
                ;;
        esac
        mkdir -p "$target_dir"
        
    elif [[ "$1" == "--help" || "$1" == "-h" ]]; then
        show_help
        exit 0
    elif [[ "$1" == "--remove" ]]; then
        remove_symbolic_links
        exit 0
    else
        # Custom directory
        target_dir="$1"
        
        if [[ ! -d "$target_dir" ]]; then
            error "Directory does not exist: $target_dir"
            info "Create it first: ${WHITE}mkdir -p \"$target_dir\"${RESET}"
            exit 1
        fi
        
        if [[ ! -w "$target_dir" ]]; then
            error "No write permission to: $target_dir"
            exit 1
        fi
    fi
    
    echo "$target_dir"
}

# === SYMBOLIC LINK CREATION ===
create_symbolic_links() {
    local target_dir="$1"
    local created_count=0
    local skipped_count=0
    
    header "${LINK} Creating Symbolic Links in: ${WHITE}$target_dir${RESET}"
    echo ""
    
    for alias in "${GIT_ALIASES[@]}"; do
        local link_path="$target_dir/$alias"
        
        if [[ -L "$link_path" ]]; then
            # Existing symbolic link - check if it points to our script
            local current_target
            current_target=$(readlink "$link_path")
            
            if [[ "$current_target" == "$MCP_CLI_PATH" ]]; then
                info "${GRAY}$alias${RESET} - ${DIM}already exists (correct target)${RESET}"
                ((skipped_count++))
                continue
            else
                warning "$alias - updating existing link"
                rm -f "$link_path"
            fi
        elif [[ -e "$link_path" ]]; then
            error "$alias - file exists (not a symbolic link)"
            warning "Manual intervention required: $link_path"
            continue
        fi
        
        # Create the symbolic link
        if ln -s "$MCP_CLI_PATH" "$link_path" 2>/dev/null; then
            success "$alias - ${GREEN}created${RESET}"
            ((created_count++))
        else
            error "$alias - ${RED}failed to create${RESET}"
        fi
    done
    
    echo ""
    header "${CHECKMARK} Summary:"
    info "Created: ${GREEN}$created_count${RESET} symbolic links"
    info "Skipped: ${YELLOW}$skipped_count${RESET} existing links"
    info "Target: ${WHITE}$target_dir${RESET}"
}

# === PATH VERIFICATION ===
verify_path_access() {
    local target_dir="$1"
    local platform
    platform=$(detect_platform)
    
    header "${GEAR} Verifying PATH Configuration..."
    
    if echo "$PATH" | grep -q "$target_dir"; then
        success "Directory is in PATH: $target_dir"
    else
        warning "Directory is NOT in PATH: $target_dir"
        echo ""
        
        # Platform-specific PATH configuration instructions
        case "$platform" in
            "linux"|"freebsd")
                info "Add to your shell profile:"
                echo -e "    ${WHITE}~/.bashrc${RESET} (Bash)"
                echo -e "    ${WHITE}~/.zshrc${RESET} (Zsh)"
                echo -e "    ${WHITE}~/.profile${RESET} (Generic)"
                echo ""
                echo -e "    ${WHITE}export PATH=\"$target_dir:\$PATH\"${RESET}"
                ;;
            "macos")
                info "Add to your shell profile:"
                echo -e "    ${WHITE}~/.zshrc${RESET} (Default on macOS)"
                echo -e "    ${WHITE}~/.bash_profile${RESET} (If using Bash)"
                echo ""
                echo -e "    ${WHITE}export PATH=\"$target_dir:\$PATH\"${RESET}"
                ;;
            "windows-wsl")
                info "Add to your WSL shell profile:"
                echo -e "    ${WHITE}~/.bashrc${RESET} (WSL Bash)"
                echo -e "    ${WHITE}~/.zshrc${RESET} (WSL Zsh)"
                echo ""
                echo -e "    ${WHITE}export PATH=\"$target_dir:\$PATH\"${RESET}"
                ;;
            "windows-cygwin"|"windows-msys")
                info "Add to your Windows shell profile:"
                echo -e "    ${WHITE}~/.bashrc${RESET} (Git Bash/MSYS2)"
                echo ""
                echo -e "    ${WHITE}export PATH=\"$target_dir:\$PATH\"${RESET}"
                ;;
            *)
                info "Add to your shell profile:"
                echo ""
                echo -e "    ${WHITE}export PATH=\"$target_dir:\$PATH\"${RESET}"
                ;;
        esac
        
        echo ""
        info "Or apply immediately:"
        echo ""
        echo -e "    ${WHITE}export PATH=\"$target_dir:\$PATH\"${RESET}"
        
        # Platform-specific source command
        case "$platform" in
            "macos")
                echo -e "    ${WHITE}source ~/.zshrc${RESET}  ${GRAY}# or ~/.bash_profile${RESET}"
                ;;
            *)
                echo -e "    ${WHITE}source ~/.bashrc${RESET}  ${GRAY}# or your shell's profile${RESET}"
                ;;
        esac
    fi
}

# === TESTING ===
test_installation() {
    header "${ROCKET} Testing Installation..."
    
    local test_commands=("gstatus --help" "glist --help" "gflow --help")
    local success_count=0
    
    for cmd in "${test_commands[@]}"; do
        local cmd_name
        cmd_name=$(echo "$cmd" | cut -d' ' -f1)
        
        if command -v "$cmd_name" >/dev/null 2>&1; then
            if $cmd >/dev/null 2>&1; then
                success "$cmd_name - ${GREEN}working${RESET}"
                ((success_count++))
            else
                error "$cmd_name - ${RED}command found but failed to execute${RESET}"
            fi
        else
            error "$cmd_name - ${RED}command not found${RESET}"
        fi
    done
    
    echo ""
    if [[ $success_count -eq ${#test_commands[@]} ]]; then
        success "All commands working correctly! 🎉"
        echo ""
        info "Try these commands:"
        echo -e "    ${GREEN}gstatus${RESET}           - Show git repository status"
        echo -e "    ${GREEN}glist${RESET}             - List all available git tools"  
        echo -e "    ${GREEN}gflow \"message\"${RESET}    - Complete git workflow (add→commit→push)"
    else
        warning "Some commands failed. Check PATH configuration above."
    fi
}

# === REMOVAL FUNCTION ===
remove_symbolic_links() {
    header "${TRASH} Removing Symbolic Links..."
    
    local platform
    platform=$(detect_platform)
    
    # Platform-specific common directories
    local common_dirs=()
    case "$platform" in
        "linux"|"freebsd")
            common_dirs=("/usr/local/bin" "$HOME/.local/bin" "/opt/local/bin" "/usr/bin")
            ;;
        "macos")
            common_dirs=("/usr/local/bin" "$HOME/.local/bin" "/opt/local/bin" "/opt/homebrew/bin")
            ;;
        "windows-"*)
            common_dirs=("$HOME/.local/bin" "$HOME/bin" "/usr/local/bin")
            ;;
        *)
            common_dirs=("/usr/local/bin" "$HOME/.local/bin" "/opt/local/bin")
            ;;
    esac
    
    local removed_count=0
    
    for dir in "${common_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            info "Checking directory: $dir"
            
            for alias in "${GIT_ALIASES[@]}"; do
                local link_path="$dir/$alias"
                
                if [[ -L "$link_path" ]]; then
                    local target
                    target=$(readlink "$link_path")
                    
                    # Check if it points to our mcp-cli.js (anywhere in path)
                    if [[ "$target" == *"mcp-cli.js" ]]; then
                        if rm -f "$link_path" 2>/dev/null; then
                            success "Removed: $link_path"
                            ((removed_count++))
                        else
                            error "Failed to remove: $link_path"
                        fi
                    fi
                fi
            done
        fi
    done
    
    echo ""
    if [[ $removed_count -gt 0 ]]; then
        success "Removed $removed_count symbolic links"
    else
        info "No symbolic links found to remove"
    fi
}

# === MAIN FUNCTION ===
main() {
    show_banner
    
    # Handle removal case early
    if [[ $# -gt 0 && "$1" == "--remove" ]]; then
        remove_symbolic_links
        exit 0
    fi
    
    # Handle help case
    if [[ $# -gt 0 && ("$1" == "--help" || "$1" == "-h") ]]; then
        show_help
        exit 0
    fi
    
    # Validate environment
    validate_environment
    
    # Determine target directory
    local target_dir
    target_dir=$(determine_target_directory "$@")
    
    # Create symbolic links
    create_symbolic_links "$target_dir"
    
    # Verify PATH configuration
    verify_path_access "$target_dir"
    
    # Test installation
    test_installation
    
    echo ""
    header "${STAR} Setup Complete!"
    info "All git aliases are now available globally"
    info "Run ${WHITE}glist${RESET} to see all available commands"
}

# === SCRIPT EXECUTION ===
# Ensure script is executable
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
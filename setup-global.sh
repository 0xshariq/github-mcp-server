#!/bin/bash

# GitHub MCP Server - Global Setup Script
# This script sets up the MCP server for global usage

echo "🚀 Setting up GitHub MCP Server for global access..."

# Ensure we're in the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Build the project first
echo "📦 Building the MCP server..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please check for errors."
    exit 1
fi

# Create global npm link
echo "🔗 Creating global npm link..."
npm link

if [ $? -eq 0 ]; then
    echo "✅ Global link created successfully!"
    echo ""
    echo "🎉 Setup complete! You can now use the MCP server from anywhere:"
    echo ""
    echo "   github-mcp-server git-status"
    echo "   github-mcp-server git-add-all"
    echo "   github-mcp-server git-commit \"Your message\""
    echo "   github-mcp-server git-push"
    echo ""
    echo "📝 To test it, navigate to any Git repository and run:"
    echo "   github-mcp-server git-status"
    echo ""
else
    echo "❌ Failed to create global link. You may need to run with sudo:"
    echo "   sudo npm link"
fi

# Offer to create aliases
echo ""
read -p "🔧 Would you like to create convenient aliases? (y/n): " create_aliases

if [[ $create_aliases =~ ^[Yy]$ ]]; then
    SHELL_RC=""
    if [[ "$SHELL" == *"zsh"* ]]; then
        SHELL_RC="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        SHELL_RC="$HOME/.bashrc"
    else
        echo "📝 Please manually add these aliases to your shell configuration:"
    fi

    ALIASES="
# GitHub MCP Server aliases
alias gmcp='github-mcp-server'
alias gstatus='github-mcp-server git-status'
alias gadd='github-mcp-server git-add-all'
alias gcommit='github-mcp-server git-commit'
alias gpush='github-mcp-server git-push'
alias gflow='github-mcp-server git-add-all && github-mcp-server git-commit \"Auto commit\" && github-mcp-server git-push'"

    if [[ -n "$SHELL_RC" ]]; then
        echo "$ALIASES" >> "$SHELL_RC"
        echo "✅ Aliases added to $SHELL_RC"
        echo "🔄 Please restart your terminal or run: source $SHELL_RC"
        echo ""
        echo "🎯 New aliases available:"
        echo "   gstatus     - Check git status"
        echo "   gadd        - Add all files"
        echo "   gcommit     - Commit with message"
        echo "   gpush       - Push to remote"
        echo "   gflow       - Complete add->commit->push workflow"
    else
        echo "$ALIASES"
    fi
fi

echo ""
echo "🌟 Your GitHub MCP Server is now ready for global use!"
echo "📖 Check the README.md for more usage examples and integration options."

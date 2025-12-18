# GitHub MCP Server - Universal Configuration Guide

## 🚀 Universal MCP Server Setup

This guide provides configuration examples for using GitHub MCP Server with various LLM clients that support the Model Context Protocol (MCP).

---

## 📋 **Prerequisites**

### Option 1: NPX Installation (Recommended - Easiest)
✅ Node.js v16+ installed  
✅ Internet connection for package download  
✅ No build or setup required

### Option 2: Manual Installation
✅ Node.js v24.4.1 (managed by fnm)  
✅ GitHub MCP Server built (`npm run build`)  
✅ Universal startup script (`start-mcp.sh`)

---

## 🚀 **Quick Start with NPX (Recommended)**

The easiest way to use GitHub MCP Server is via NPX. This method requires no installation, no building, and automatically uses the latest version.

### **Universal NPX Configuration**

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "npx",
      "args": ["-y", "@0xshariq/github-mcp-server@latest"]
    }
  }
}
```

**✅ Benefits:**
- ✅ **No installation required** - Downloads and runs automatically
- ✅ **Always latest version** - Automatically uses the newest release
- ✅ **No maintenance** - No need to update or rebuild
- ✅ **Cross-platform** - Works on Windows, macOS, Linux
- ✅ **Simple configuration** - Just 4 lines of JSON

**📝 Use this configuration with:**
- Claude Desktop
- VS Code (.vscode/mcp.json)
- Continue Extension
- Cursor IDE
- Zed Editor
- Any MCP-compatible client

---

## 🔧 **Configuration for Different LLM Clients**

### 1. **Claude Desktop (Anthropic)** ⭐ Recommended with NPX

**File**: `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/.config/claude/claude_desktop_config.json` (Linux/Mac)

**Option A: NPX Method (Easiest - Recommended)**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "npx",
      "args": ["-y", "@0xshariq/github-mcp-server@latest"]
    }
  }
}
```

**Option B: Manual Installation with Custom Script**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "wsl",
      "args": [
        "bash",
        "/home/simplysabir/desktop/shariq-projects/github-mcp-server/start-mcp.sh"
      ],
      "env": {}
    }
  }
}
```

### 2. **VS Code (.vscode/mcp.json)** ⭐ Recommended with NPX

**File**: Create `.vscode/mcp.json` in your workspace root

**Option A: NPX Method (Easiest - Recommended)**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "npx",
      "args": ["-y", "@0xshariq/github-mcp-server@latest"]
    }
  }
}
```

**Option B: Manual Installation**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp-server/dist/index.js"]
    }
  }
}
```

### 3. **Continue (VS Code Extension)** ⭐ Recommended with NPX

**File**: `~/.continue/config.json`

**Option A: NPX Method (Easiest - Recommended)**
```json
{
  "models": [
    {
      "title": "GitHub MCP Assistant",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "contextLength": 200000,
      "mcpServers": [
        {
          "name": "github-mcp-server",
          "command": "npx",
          "args": ["-y", "@0xshariq/github-mcp-server@latest"]
        }
      ]
    }
  ]
}
```

**Option B: Manual Installation with Custom Script**

**Option B: Manual Installation with Custom Script**
```json
{
  "models": [
    {
      "title": "GitHub MCP Assistant",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "contextLength": 200000,
      "mcpServers": [
        {
          "name": "github-mcp-server",
          "command": "bash",
          "args": ["/home/simplysabir/desktop/shariq-projects/github-mcp-server/start-mcp.sh"],
          "env": {}
        }
      ]
    }
  ]
}
```

### 4. **Cursor IDE** ⭐ Recommended with NPX

**File**: `~/.cursor/mcp_config.json`

**Option A: NPX Method (Easiest - Recommended)**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "npx",
      "args": ["-y", "@0xshariq/github-mcp-server@latest"],
      "capabilities": ["tools", "resources", "prompts"]
    }
  }
}
```

**Option B: Manual Installation**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "bash",
      "args": ["/home/simplysabir/desktop/shariq-projects/github-mcp-server/start-mcp.sh"],
      "env": {},
      "capabilities": ["tools", "resources", "prompts"]
    }
  }
}
```

### 5. **Zed Editor** ⭐ Recommended with NPX

**File**: `~/.config/zed/settings.json`

**Option A: NPX Method (Easiest - Recommended)**
```json
{
  "assistant": {
    "mcp_servers": {
      "github-mcp-server": {
        "command": "npx",
        "args": ["-y", "@0xshariq/github-mcp-server@latest"]
      }
    }
  }
}
```

**Option B: Manual Installation**

**Option B: Manual Installation**
```json
{
  "assistant": {
    "mcp_servers": {
      "github-mcp-server": {
        "command": "bash",
        "args": ["/home/simplysabir/desktop/shariq-projects/github-mcp-server/start-mcp.sh"],
        "env": {}
      }
    }
  }
}
```

### 6. **Open WebUI**

**Configuration**: In Open WebUI Admin Panel → Tools → MCP Servers

**Option A: NPX Method (Recommended)**
```json
{
  "name": "github-mcp-server",
  "command": ["npx", "-y", "@0xshariq/github-mcp-server@latest"],
  "env": {},
  "description": "GitHub MCP Server for Git operations"
}
```

**Option B: Manual Installation**
```json
{
  "name": "github-mcp-server",
  "command": ["bash", "/home/simplysabir/desktop/shariq-projects/github-mcp-server/start-mcp.sh"],
  "env": {},
  "description": "GitHub MCP Server for Git operations"
}
```

### 7. **Generic MCP Client**

**Option A: NPX Method (Recommended)**
```bash
npx -y @0xshariq/github-mcp-server@latest
```

**Option B: Manual Installation**

```bash
# Direct command execution
bash /home/simplysabir/desktop/shariq-projects/github-mcp-server/start-mcp.sh

# Or with explicit shell
/bin/bash /home/simplysabir/desktop/shariq-projects/github-mcp-server/start-mcp.sh
```

---

## 🔧 **Environment Variables**

The startup script sets these environment variables automatically:

```bash
NODE_ENV=production
MCP_SERVER_NAME=github-mcp-server
MCP_SERVER_VERSION=1.8.3
FNM_PATH=$HOME/.local/share/fnm
```

---

## 🛠️ **Platform-Specific Notes**

### **Windows (WSL)**
- Use `wsl` command prefix for Windows clients
- Ensure WSL has access to the project directory
- Path should use forward slashes: `/home/user/...`

### **Linux/macOS**
- Use direct `bash` command
- Ensure script has executable permissions: `chmod +x start-mcp.sh`
- Path can use native format

### **Docker Alternative**
```json
{
  "command": "docker",
  "args": [
    "run", "--rm", "-i",
    "-v", "/home/simplysabir/desktop/shariq-projects/github-mcp-server:/app",
    "-w", "/app",
    "node:24.4.1-alpine",
    "node", "dist/index.js"
  ]
}
```

---

## ✅ **Verification**

Test the setup with any client:

1. **Check Node.js version**: Should be v24.4.1
2. **Verify MCP tools**: Should list 29 Git operations
3. **Test basic operation**: Try `git_status` tool
4. **Check logs**: Look for startup messages in client

---

## 🚨 **Troubleshooting**

### Common Issues:

1. **"Node not found"**
   ```bash
   # Reload shell environment
   source ~/.bashrc
   fnm use 24.4.1
   ```

2. **"Permission denied"**
   ```bash
   chmod +x /home/simplysabir/desktop/shariq-projects/github-mcp-server/start-mcp.sh
   ```

3. **"Directory not found"**
   - Update `PROJECT_DIR` in `start-mcp.sh`
   - Ensure all paths are absolute

4. **"Server exits immediately"**
   - Check if `dist/index.js` exists
   - Run `npm run build` to rebuild

---

## 📚 **Available Tools**

After successful setup, these tools will be available:

### Basic Operations (15)
`git_add`, `git_commit`, `git_push`, `git_pull`, `git_status`, `git_branch`, `git_checkout`, `git_log`, `git_diff`, `git_stash`, `git_stash_pop`, `git_reset`, `git_clone`, `git_remote`, `git_init`

### Advanced Operations (14)
`git_tag`, `git_merge`, `git_rebase`, `git_cherry_pick`, `git_blame`, `git_bisect_start`, `git_bisect_bad`, `git_bisect_good`, `git_bisect_reset`, `git_show`, `git_reflog`, `git_clean`, `git_archive`, `git_worktree`

All tools include comprehensive error handling, validation, and helpful output formatting.

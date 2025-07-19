# GitHub MCP Server

A comprehensive **Model Context Protocol (MCP) server** that provides Git repository management capabilities for AI assistants. This server exposes Git operations through a standardized interface, enabling AI models to safely and efficiently manage version control tasks.

## 🎯 What is this project?

**GitHub MCP Server** is a bridge between AI assistants and Git repositories. It provides:
- **Safe Git operations** through a standardized MCP interface
- **Comprehensive version control** capabilities (add, commit, push, branch management, etc.)
- **Error handling and validation** to prevent common Git mistakes
- **Direct integration** with VS Code and AI assistants like GitHub Copilot
- **CLI wrapper** for terminal access and automation

## 🏗️ Architecture

The server is built with a modular architecture:

### **Core Files:**
- **`src/index.ts`**: MCP server setup, tool registration, and request handling
- **`src/github.ts`**: All Git operations with validation and error handling
- **`mcp-cli.js`**: CLI wrapper for terminal access to MCP server

### **Key Features:**
- **TypeScript-based** for type safety and better development experience
- **Comprehensive error handling** with meaningful error messages
- **Timeout protection** (30s for operations, 5s for validation)
- **Flexible directory support** - work in any Git repository
- **Standardized responses** following MCP protocol specifications
- **CLI wrapper** for direct terminal access and automation

## 🚀 Features

### **📁 File Management**
- **`git-add`** - Add specific files to staging area
- **`git-add-all`** - Add all modified/untracked files
- **`git-remove`** - Remove files from staging area
- **`git-remove-all`** - Remove all files from staging area

### **📝 Repository Information**
- **`git-status`** - Show repository status (staged, modified, untracked files)
- **`git-log`** - Display commit history with customizable count
- **`git-diff`** - Show differences between commits/branches/working directory

### **💾 Commit Operations**
- **`git-commit`** - Create commits with custom messages
- **`git-push`** - Push changes to remote repository
- **`git-pull`** - Pull changes from remote repository

### **🌿 Branch Management**
- **`git-branch`** - List branches or create new ones
- **`git-checkout`** - Switch branches or create and switch to new branches

### **💼 Stash Operations**
- **`git-stash`** - Temporarily save changes
- **`git-stash-pop`** - Apply most recent stash

### **🔄 Advanced Operations**
- **`git-reset`** - Reset repository to specific state (soft/mixed/hard)
- **`git-clone`** - Clone repositories from remote URLs

---

## 📋 Complete Tool Reference

### File Staging Operations

#### `git-add`
Adds specific files to the staging area.
```json
{
  "name": "git-add",
  "parameters": {
    "files": ["file1.txt", "src/file2.js"],  // Required: Array of file paths
    "directory": "/path/to/repo"              // Optional: Working directory
  }
}
```

#### `git-add-all`
Adds all modified and untracked files to staging area.
```json
{
  "name": "git-add-all",
  "parameters": {
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

#### `git-remove`
Removes a specific file from staging area (unstages it).
```json
{
  "name": "git-remove",
  "parameters": {
    "file": "filename.txt",       // Required: File to unstage
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

#### `git-remove-all`
Removes all files from staging area.
```json
{
  "name": "git-remove-all",
  "parameters": {
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

### Repository Information

#### `git-status`
Shows current repository status.
```json
{
  "name": "git-status",
  "parameters": {
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

#### `git-log`
Displays commit history.
```json
{
  "name": "git-log",
  "parameters": {
    "maxCount": 5,                // Optional: Number of commits (default: 10)
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

#### `git-diff`
Shows differences between commits, branches, or working directory.
```json
{
  "name": "git-diff",
  "parameters": {
    "target": "main",             // Optional: Compare target (branch/commit)
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

### Commit & Sync Operations

#### `git-commit`
Creates a commit with staged changes.
```json
{
  "name": "git-commit",
  "parameters": {
    "message": "Add new feature",  // Required: Commit message
    "directory": "/path/to/repo"   // Optional: Working directory
  }
}
```

#### `git-push`
Pushes local commits to remote repository.
```json
{
  "name": "git-push",
  "parameters": {
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

#### `git-pull`
Pulls changes from remote repository.
```json
{
  "name": "git-pull",
  "parameters": {
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

### Branch Management

#### `git-branch`
Lists all branches or creates a new branch.
```json
{
  "name": "git-branch",
  "parameters": {
    "branchName": "new-feature",  // Optional: Create branch with this name
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

#### `git-checkout`
Switches to a branch or creates and switches to a new branch.
```json
{
  "name": "git-checkout",
  "parameters": {
    "branchName": "feature-branch",  // Required: Branch name
    "createNew": true,               // Optional: Create if doesn't exist (default: false)
    "directory": "/path/to/repo"     // Optional: Working directory
  }
}
```

### Stash Operations

#### `git-stash`
Temporarily saves current changes.
```json
{
  "name": "git-stash",
  "parameters": {
    "message": "Work in progress",  // Optional: Stash message
    "directory": "/path/to/repo"    // Optional: Working directory
  }
}
```

#### `git-stash-pop`
Applies the most recent stash.
```json
{
  "name": "git-stash-pop",
  "parameters": {
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

### Advanced Operations

#### `git-reset`
Resets repository to a specific state.
```json
{
  "name": "git-reset",
  "parameters": {
    "mode": "mixed",              // Optional: "soft"|"mixed"|"hard" (default: "mixed")
    "target": "HEAD~1",           // Optional: Target commit (default: "HEAD")
    "directory": "/path/to/repo"  // Optional: Working directory
  }
}
```

#### `git-clone`
Clones a repository from a remote URL.
```json
{
  "name": "git-clone",
  "parameters": {
    "url": "https://github.com/user/repo.git",  // Required: Repository URL
    "targetDir": "my-project",                  // Optional: Target directory name
    "directory": "/path/to/parent"              // Optional: Parent directory
  }
}
```

---

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 16+ 
- Git installed and accessible in PATH
- TypeScript (for development)

### **1. Clone and Install**
```bash
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server
npm install
```

### **2. Build the Server**
```bash
npm run build
```

### **3. Test the Server**
```bash
# Test MCP server functionality
npm run inspect

# Run in development mode (auto-rebuild)
npm run dev
```

---

## 🔧 VS Code Integration

### **Method 1: Project-Level Setup**

1. **Add to your project's `.vscode/settings.json`:**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

### **Method 2: Global Setup**

1. **Open VS Code User Settings** (`Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)")

2. **Add MCP server configuration:**
```json
{
  "chat.mcp.discovery.enabled": true,
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

3. **For WSL users:**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "wsl",
      "args": [
        "node", 
        "/home/username/path/to/github-mcp-server/dist/index.js"
      ],
      "env": {},
      "disabled": false
    }
  }
}
```

4. **Restart VS Code** and the tools will be available in GitHub Copilot Chat

---

## � Recommended Integration Methods

### **Method 3: CLI Access from Any Project (Recommended)**
Use the CLI wrapper from any directory without any setup:

```bash
# From any project directory
node /home/simplysabir/desktop/shariq-projects/github-mcp-server/mcp-cli.js git-status
node /home/simplysabir/desktop/shariq-projects/github-mcp-server/mcp-cli.js git-add-all
node /home/simplysabir/desktop/shariq-projects/github-mcp-server/mcp-cli.js git-commit "message"
node /home/simplysabir/desktop/shariq-projects/github-mcp-server/mcp-cli.js git-push
```

**Benefits:**
- ✅ **Works anywhere** - No project-specific configuration needed
- ✅ **Instant setup** - Just run commands from any Git repository
- ✅ **Full feature access** - All 17 git operations available
- ✅ **No VS Code dependency** - Works in any terminal

### **Method 4: Global NPM Link (Best for Power Users)**
Make it available as a global command:

```bash
# One-time setup in your MCP server directory
cd /home/simplysabir/desktop/shariq-projects/github-mcp-server
npm link

# Now from any project anywhere:
github-mcp-server git-status
github-mcp-server git-add-all
github-mcp-server git-commit "Complete feature"
github-mcp-server git-push
```

**Benefits:**
- ✅ **Global command** - Simple `github-mcp-server` command from anywhere
- ✅ **Clean syntax** - Shortest command format
- ✅ **Cross-project** - Works in any directory on your system
- ✅ **Easy to remember** - Consistent command structure

### **Create Aliases for Even Easier Usage**
Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Short aliases for git operations
alias gmcp='node /home/simplysabir/desktop/shariq-projects/github-mcp-server/mcp-cli.js'
alias gstatus='gmcp git-status'
alias gadd='gmcp git-add-all'
alias gcommit='gmcp git-commit'
alias gpush='gmcp git-push'

# Ultra-short workflow alias
alias gflow='gmcp git-add-all && gmcp git-commit "Auto commit" && gmcp git-push'
```

**Usage after aliases:**
```bash
gstatus                    # Check status
gadd                       # Add all files
gcommit "Fix bug"          # Commit with message
gpush                      # Push to remote
gflow                      # Complete workflow in one command
```

---

## �🎮 Usage Examples

### **Basic Git Workflow**
```bash
# Check repository status
@mcp git-status

# Add specific files
@mcp git-add {"files": ["src/index.ts", "README.md"]}

# Add all files  
@mcp git-add-all

# Commit changes
@mcp git-commit {"message": "Add new features and documentation"}

# Push to remote
@mcp git-push
```

### **Using the CLI Wrapper**
The MCP CLI wrapper (`mcp-cli.js`) allows direct terminal access to your MCP server:

```bash
# Basic operations
npm run mcp git-status
npm run mcp git-add-all
npm run mcp git-commit "Fix authentication bug"
npm run mcp git-push

# File operations with simple syntax
npm run mcp git-add package.json README.md src/index.ts
npm run mcp git-remove unwanted-file.txt

# Branch management
npm run mcp git-branch feature-auth
npm run mcp git-checkout main
npm run mcp git-checkout feature-auth --create

# History and information
npm run mcp git-log 10
npm run mcp git-diff main
npm run mcp git-stash "Work in progress"

# Advanced operations
npm run mcp git-reset soft HEAD~1
npm run mcp git-clone https://github.com/user/repo.git my-project
```

**Benefits of CLI Wrapper:**
- 🚀 **Easy terminal access** - Use MCP tools directly from command line
- 🎯 **Simple syntax** - Natural command structure with clear arguments
- 🔧 **Perfect for automation** - Ideal for scripts and CI/CD pipelines
- ✅ **Full MCP feature access** - All 17 git operations available
- 🛡️ **Built-in validation** - Comprehensive error handling and safety checks

### **CLI vs MCP Server Usage**

| Context | Command Format | Example | 
|---------|---------------|---------|
| **VS Code/Copilot** | `@mcp tool-name {args}` | `@mcp git-commit {"message": "Fix bug"}` |
| **Terminal CLI** | `npm run mcp tool-name args` | `npm run mcp git-commit "Fix bug"` |
| **Direct Node** | `node mcp-cli.js tool-name args` | `node mcp-cli.js git-commit "Fix bug"` |

### **Branch Management**
```bash
# List all branches
@mcp git-branch

# Create and switch to new branch
@mcp git-checkout {"branchName": "feature/new-feature", "createNew": true}

# Switch to existing branch
@mcp git-checkout {"branchName": "main"}
```

### **Advanced Operations**
```bash
# View commit history
@mcp git-log {"maxCount": 5}

# See differences
@mcp git-diff {"target": "main"}

# Stash current work
@mcp git-stash {"message": "Work in progress"}

# Apply stash later
@mcp git-stash-pop

# Reset to previous commit
@mcp git-reset {"mode": "soft", "target": "HEAD~1"}
```

---

## 📊 Development Scripts

```bash
# Build TypeScript to JavaScript
npm run build

# Start the MCP server
npm start

# Development mode with auto-rebuild
npm run dev

# Test MCP server with inspector
npm run inspect

# Test MCP server functionality
npm run test-mcp

# Use MCP CLI wrapper
npm run mcp <tool> [args...]
```

**Quick Commands Reference:**
```bash
# MCP Server approach (via protocol)
npm run mcp git-status
npm run mcp git-add-all  
npm run mcp git-commit "message"
npm run mcp git-push

# Direct CLI approach
node mcp-cli.js git-status
node mcp-cli.js git-add-all
node mcp-cli.js git-commit "message"  
node mcp-cli.js git-push
```

---

## 🏗️ Project Structure
```
github-mcp-server/
├── src/
│   ├── index.ts          # MCP server setup and tool registration
│   └── github.ts         # Git operations implementation
├── dist/                 # Compiled JavaScript (generated)
├── mcp-cli.js           # CLI wrapper for MCP server access
├── package.json         # Project configuration and scripts
├── tsconfig.json        # TypeScript configuration
├── .gitignore           # Git ignore patterns
└── README.md            # This documentation
```

## 🔧 Code Architecture

### **`src/index.ts`** - MCP Server Core
- **Server Initialization**: Sets up MCP server with metadata and capabilities
- **Tool Registration**: Defines all available Git tools with schemas
- **Request Handling**: Processes tool calls and routes to appropriate functions
- **Error Management**: Centralized error handling and response formatting

### **`src/github.ts`** - Git Operations Engine  
- **Utility Functions**: Command execution, repository validation, error handling
- **File Operations**: Add, remove, status checking with comprehensive validation
- **Commit Management**: Commit creation, push/pull with conflict detection
- **Branch Operations**: Branch creation, switching, listing
- **Advanced Features**: Stashing, resetting, cloning, diff analysis

### **Key Design Principles:**
1. **Type Safety**: Full TypeScript implementation with proper interfaces
2. **Error Resilience**: Comprehensive error handling with meaningful messages  
3. **Validation**: Input validation and repository state checking
4. **Modularity**: Clear separation between MCP protocol and Git operations
5. **Timeout Protection**: All operations have appropriate timeouts

---

## 🛡️ Error Handling & Safety

The server includes comprehensive error handling:

- **🔍 Repository Validation**: Ensures directory is a valid Git repository
- **📁 File Existence Checks**: Validates files exist before Git operations
- **⏱️ Timeout Protection**: 30-second timeout for operations, 5-second for validation
- **🚫 Input Sanitization**: Prevents command injection and handles special characters
- **📝 Detailed Error Messages**: Clear, actionable error descriptions
- **🔄 Graceful Degradation**: Operations fail safely without corrupting repository state

### **Common Error Scenarios:**
- **Not a Git repository** → Clear guidance on repository initialization
- **File not found** → Specific file path and existence details
- **No staged changes** → Instructions on staging files before commit
- **Network issues** → Detailed connection and authentication guidance
- **Merge conflicts** → Conflict resolution recommendations

---

## 🤝 Usage in AI Assistants

### **GitHub Copilot Integration**
Once configured in VS Code, use tools directly in Copilot Chat:
```
@github Use git-add to stage my changes
@github Commit these changes with message "Fix authentication bug"  
@github Push the changes to the remote repository
```

### **Custom AI Applications**
The MCP server can be integrated into any application supporting the Model Context Protocol:

```typescript
// Example integration
const mcpClient = new MCPClient();
await mcpClient.connect("github-mcp-server");

// Use Git operations
const result = await mcpClient.callTool("git-status", {});
const statusInfo = JSON.parse(result.content[0].text);
```

### **Workflow Automation**
Common AI-assisted workflows:
- **Code Review Prep**: Status check → Add files → Commit → Push
- **Branch Management**: Create branch → Switch → Make changes → Merge
- **Emergency Fixes**: Stash work → Switch to main → Fix → Commit → Push → Switch back → Pop stash

---

## 🔍 Troubleshooting

### **MCP Server Not Recognized**
1. Check VS Code settings syntax (valid JSON)
2. Verify absolute path to `dist/index.js` 
3. Ensure server builds successfully (`npm run build`)
4. Restart VS Code after configuration changes
5. Check VS Code Developer Console for error messages

### **CLI Wrapper Issues**
```bash
# Test if MCP server builds correctly
npm run build

# Test MCP server directly
npm run inspect

# Test CLI with debug output
node mcp-cli.js git-status

# Check if dist/index.js exists
ls -la dist/
```

### **Git Operations Failing**
1. Verify Git is installed and in PATH
2. Check repository is properly initialized (`git status` works)
3. Ensure proper permissions for file operations
4. Validate network connectivity for push/pull operations

### **Common CLI Errors**
- **"No output received"** → Server not starting, check `npm run build`
- **"Parse error"** → MCP server response format issue, check server logs
- **"Operation timed out"** → Network issues or large repository operations
- **"Process exited with code 1"** → Git command failed, check git status manually

### **Performance Issues**
1. Large repositories may have slower status checks
2. Network operations (push/pull/clone) depend on connection speed
3. Use `maxCount` parameter in `git-log` to limit output
4. Consider using `git-diff` with specific targets for large repositories

---

## 🎯 Best Practices

### **For AI Assistant Usage:**
- Always check status before major operations
- Use descriptive commit messages  
- Stash work before switching branches
- Pull latest changes before starting new work

### **For Developers:**
- Test MCP server locally before deployment
- Use TypeScript for type safety when extending
- Follow existing error handling patterns
- Add timeout protection for new operations

### **For Repository Management:**
- Keep operations atomic (one logical change per commit)
- Use branch operations for feature development
- Regular status checks to maintain awareness
- Utilize stash for temporary work preservation

---
```
github-mcp-server/
├── src/
│   ├── index.ts      # MCP server setup and tool definitions
│   └── github.ts     # Git operation functions and error handling
├── package.json      # Project configuration
├── tsconfig.json     # TypeScript config
└── README.md         # This file
```

---

## Architecture (How it’s built)
- **src/index.ts**: Sets up the MCP server and maps incoming tool requests to Git functions.
- **src/github.ts**: Implements all Git operations, with validation and error handling.

**Each operation:**
1. Checks if the directory is a Git repo
2. Runs the Git command
3. Returns a structured response (success/error/info)
4. Handles errors (missing files, invalid directories, network issues, etc.)

---

## Code Quality & Documentation
- **Well-commented code**: Both main files include clear, meaningful comments explaining functionality
- **Logical organization**: Code is grouped into related sections for easy navigation
- **TypeScript**: Full type safety with proper interfaces and error handling
- **Modular design**: Separation of concerns between MCP server setup and Git operations
## Error Handling
The server includes comprehensive error handling for:
- File missing? Clear error message.
- Invalid directory? Clear error message.
- Git command fails? Error details provided.
- Network issues (push/pull)? Error details provided.

---

## Requirements
- Node.js 16+
- Git installed and in PATH
- TypeScript (for development)

---

## Dependencies
- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `zod`: Schema validation
- `@types/node`: TypeScript types for Node.js

---

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if possible
5. Submit a pull request

---

## License
ISC License

---

## Author
Created for use with AI assistants that support the Model Context Protocol.

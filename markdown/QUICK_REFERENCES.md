# Quick Reference Guide

Simple cheat sheet for GitHub MCP Server commands. Copy and paste these!

## 🚀 Quick Installation

### MCP Server Configuration (Easiest Method)
Add this to your MCP configuration file (.vscode/mcp.json, Claude config, etc.):

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
- No installation required
- Always uses latest version
- Works on all platforms
- Zero maintenance

### CLI Installation
```bash
# Install globally for terminal use
npm install -g @0xshariq/github-mcp-server

# Test installation
gstatus
glist
```

---

## 🚀 Most Used Commands

### Check Status
```bash
gstatus                     # See what changed
```

### Add & Commit
```bash
gadd                        # Add all files
gcommit "your message"      # Commit with message
```

### Push & Pull
```bash
gpush                       # Send to remote
gpull                       # Get from remote
```

### Quick Workflow (All in One)
```bash
gflow "your message"        # Add + commit + push together
```

---

## 📝 Basic Commands

### File Operations
```bash
gstatus                     # Check what's changed
gadd                        # Add all files
gadd file.js               # Add specific file
```

### Commits
```bash
gcommit "fix bug"          # Commit with message
gflow "add feature"        # Add + commit + push all at once
```

### Push & Pull
```bash
gpush                      # Send your changes
gpull                      # Get latest changes
```

### History
```bash
glog                       # See recent commits
gdiff                      # See what changed
```

---

## 🌿 Branch Commands

### List & Switch
```bash
gbranch                    # List all branches
gcheckout main            # Switch to main branch
gcheckout feature-login   # Switch to feature branch
```

### Create New Branch
```bash
gbranch new-feature       # Create new branch
gcheckout -b new-feature  # Create and switch to new branch
```

---

## 🔧 Advanced Commands

### Development Workflows
```bash
gdev                       # Start development session
gsave "work in progress"   # Quick save
gfix "small bug fix"       # Quick fix
```

### Stash (Temporary Save)
```bash
gstash                     # Save work temporarily
gstash "trying new idea"   # Save with message
gpop                       # Get back saved work
```

### Reset (Undo Things)
```bash
greset                     # Undo staging (safe)
greset --hard              # ⚠️ DANGER: Delete all changes
```

---

## 📡 Remote Management

### View & Manage Remotes
```bash
gremote                    # List all remotes
gremote add origin <url>   # Add new remote
gremote set-url <url>      # Change remote URL
```

### Clone & Initialize
```bash
gclone <url>              # Copy remote repository
ginit                     # Start new repository
```

---

## 🔥 Workflow Examples

### Daily Development
```bash
# Start your day
gstatus                   # Check what's changed
gpull                     # Get latest updates

# Work on stuff
# ... make changes ...
gadd                      # Stage your changes
gcommit "add new feature" # Save your work
gpush                     # Share with team
```

### Quick Changes
```bash
# Make small changes and push quickly
gflow "fix typo in header"
```

### Feature Development
```bash
# Create feature branch
gbranch feature-login
gcheckout feature-login

# Work on feature
# ... make changes ...
gflow "implement login form"

# Back to main
gcheckout main
```

### Emergency Fixes
```bash
# Save current work
gstash "work in progress"

# Switch to main and fix
gcheckout main
gpull
# ... fix the bug ...
gflow "emergency bug fix"

# Back to your work
gcheckout your-branch
gpop                      # Restore your work
```

---

## 📱 VS Code Setup

Add this to your VS Code settings:

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/path/to/github-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

Replace `/path/to/github-mcp-server` with where you installed it.

---

## 🐳 Docker Commands

### One-Time Use
```bash
# Try it quickly
docker run -it --rm 0xshariq/github-mcp-server:latest

# Use with your project
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest
```

### Make It Easy
Create an alias:
```bash
# Add to ~/.bashrc or ~/.zshrc
alias gmcp='docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest'

# Then just use:
gmcp gstatus
gmcp gflow "my message"
```

---

## 🔍 Get Help

### Find Commands
```bash
glist                     # See all available commands
glist --help             # More detailed help
```

### Command Help
```bash
gstatus --help           # Help for specific command
gcommit --help           # Help for commit command
```

---

## ❓ Common Problems

### "Command not found"
**Problem:** `gstatus` doesn't work.
**Fix:** Make sure you installed with `npm link` or use Docker.

### "Not a git repository"
**Problem:** Git commands fail.
**Fix:** Make sure you're in a Git repository folder, or run `ginit` first.

### "Permission denied"
**Problem:** Can't push to remote.
**Fix:** Check your Git credentials and repository permissions.

---

## 🎯 Quick Tips

1. **Always check status first:** `gstatus`
2. **Use gflow for quick commits:** `gflow "message"`
3. **Save work before switching branches:** `gstash`
4. **Get help anytime:** `glist`
5. **Pull before starting work:** `gpull`

That's all you need! These commands cover 99% of daily Git work.
gbranch                     # List all branches
gbranch feature-auth        # Create new branch
gcheckout main              # Switch to main
gcheckout feature-auth      # Switch to feature-auth
```

### **📡 Remote Management**
```bash
gremote                     # List all remotes
gremote-add origin url      # Add new remote
gremote-remove backup       # Remove remote
gremote-set-url origin url  # Change remote URL
```

### **💼 Advanced Operations**
```bash
gstash                      # Stash current changes
gstash "WIP message"        # Stash with custom message
gpop                        # Apply most recent stash
greset                      # Reset to HEAD (mixed)
greset soft HEAD~1          # Soft reset to previous commit
gclone https://repo.git     # Clone repository
```

### **⚡ Workflow Shortcuts**
```bash
gflow "message"             # gadd + gcommit + gpush
gquick "message"            # gadd + gcommit (no push)
gsync                       # gpull + gstatus
```

## 🔍 GLIST - Advanced Tool Explorer

**The ultimate discovery tool** for exploring all Git operations with examples and smart categorization.

### **🚀 Enhanced glist Features:**
```bash
glist                           # Complete tool catalog with examples
glist --simple                  # Clean list without examples
glist --help                    # Advanced usage guide  
glist --category "File Operations"  # Show specific category only
```

### **📊 What glist reveals:**
- **20 Git Operations** organized by functionality
- **3 Workflow Shortcuts** for common patterns
- **Real Examples** for each command
- **Alias Mappings** showing fastest access methods
- **Pro Tips** for efficient Git workflows

### **🎯 glist Output Example:**
```
🚀 GLIST - GitHub MCP Server Tool Explorer

📊 Total Available: 20 Git operations + 3 workflow combinations

📁 File Operations
   Manage staging area and file tracking

   git-add-all       (gadd)     - Add all modified files to staging
                     Example: gadd

📁 Information & History  
   Repository status, history, and comparison tools

   git-status        (gstatus)  - Show repository status
                     Example: gstatus

⚡ Usage Methods:
   🔥 Ultra-fast:  gms git-status
   🚀 Aliases:     gstatus  
   📋 Full:        npm run mcp git-status
```

### **💡 Smart glist Usage:**
```bash
# Discovery workflow
gstatus                         # Check current state
glist                          # See all available options
glist --category "Branch Management"  # Focus on specific needs

# Learning and reference
glist | grep -i "remote"       # Find remote-related tools
glist --simple | wc -l         # Count total tools available
glist --help                   # Advanced features guide
```

## 📋 NPM Run Commands (Full Format)

### **Basic Operations**
```bash
npm run mcp git-status
npm run mcp git-add-all
npm run mcp git-add package.json README.md
npm run mcp git-commit "Your commit message"
npm run mcp git-push
npm run mcp git-pull
```

### **Branch Operations**
```bash
npm run mcp git-branch
npm run mcp git-branch feature-name
npm run mcp git-checkout main
npm run mcp git-checkout feature-name --create
```

### **Information & History**
```bash
npm run mcp git-log
npm run mcp git-log 15
npm run mcp git-diff
npm run mcp git-diff main develop
```

### **Remote Operations**
```bash
npm run mcp git-remote-list
npm run mcp git-remote-add origin https://github.com/user/repo.git
npm run mcp git-remote-remove backup
npm run mcp git-remote-set-url origin https://new-url.git
```

### **Advanced Operations**
```bash
npm run mcp git-stash
npm run mcp git-stash "Work in progress"
npm run mcp git-stash-pop
npm run mcp git-reset
npm run mcp git-reset soft HEAD~1
npm run mcp git-reset hard HEAD~2
npm run mcp git-clone https://github.com/user/repo.git
npm run mcp git-clone https://github.com/user/repo.git custom-folder
npm run mcp git-remove unwanted-file.txt
npm run mcp git-remove-all
```

## 🎮 Common Workflows (Copy & Use)

### **🚀 Quick Daily Workflow**
```bash
# Check status → Add all → Commit → Push
gstatus
gadd
gcommit "Implement user authentication"
gpush

# OR use single command:
gflow "Implement user authentication"
```

### **🌿 Feature Branch Development**
```bash
# Create and switch to feature branch
gbranch feature-login
gcheckout feature-login

# Work on feature...
gstatus
gadd
gcommit "Add login form"
gcommit "Add validation"
gcommit "Add tests"

# Push feature branch
gpush

# Switch back to main
gcheckout main
```

### **🔄 Sync with Remote**
```bash
# Pull latest and check status
gsync

# OR manually:
gpull
gstatus
```

### **💼 Emergency Stash & Switch**
```bash
# Save current work
gstash "WIP: refactoring auth module"

# Switch to main for hotfix
gcheckout main
gflow "Hotfix: critical security issue"

# Return to work
gcheckout feature-branch
gpop
```

### **📡 Remote Management Setup**
```bash
# Clone and setup remotes
gclone https://github.com/original/repo.git
cd repo
gremote-add upstream https://github.com/upstream/repo.git
gremote                     # Verify remotes
```

### **🔍 Investigation & History**
```bash
# Check what changed
gstatus
gdiff

# Check recent commits
glog 5

# Compare branches
gdiff main feature-branch

# See all available tools
glist
```

### **🧹 Cleanup & Reset**
```bash
# Remove unwanted files from staging
git-remove unwanted.txt

# Remove all from staging
git-remove-all

# Reset to previous commit (keep changes)
greset soft HEAD~1

# Hard reset (lose changes)
greset hard HEAD~1
```

## 🛠️ Installation Quick Start

```bash
# 1. Clone and setup (run in terminal)
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server
npm install
npm run build

# 2. Link globally (IMPORTANT: run this INSIDE github-mcp-server directory)
npm link

# 3. Now aliases work from ANY directory
cd ~/any-git-project
gstatus                     # ✅ Works globally
glist                       # ✅ Works globally
```

**📍 Key Point:** Run `npm link` INSIDE the `github-mcp-server` directory, then use aliases from anywhere!

**Test installation:**
```bash
gms git-status              # Test ultra-short command
glist                       # Test tool explorer
which gstatus              # Verify global installation
```

## 💡 Pro Tips

### **Speed Tips:**
- **Use `gms`** for shortest commands: `gms git-status`
- **Use workflow aliases:** `gflow` instead of gadd + gcommit + gpush
- **Use `glist`** to discover tools with examples and categories
- **Chain operations:** `gstatus && gadd && gcommit "message" && gpush`

### **Discovery Tips:**
- **Use `glist`** when unsure what tool to use
- **Use `glist --category "Remote Management"`** for specific workflows
- **Use `glist --simple`** for quick reference without examples
- **Bookmark `glist`** as your primary discovery tool

### **Safety Tips:**
- **Always `gstatus`** before major operations
- **Use `gstash`** before switching branches
- **Use `gdiff`** to review changes before commit
- **Use `glog`** to understand recent history
- **Use `glist` when exploring** new operations safely

### **Workflow Tips:**
- **Feature branches:** `gbranch feature-name` → work → `gflow`
- **Daily sync:** `gsync` at start of day
- **Emergency save:** `gstash "WIP"` + `gcheckout main`
- **Remote setup:** `gremote-add upstream url` for forks

## 🎯 VS Code Integration

Add to `.vscode/settings.json`:
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/path/to/github-mcp-server/dist/index.js"]
    }
  }
}
```

Use in Copilot Chat:
```
@mcp git-status
@mcp git-add-all
@mcp git-commit {"message": "Add feature"}
```

## 📊 Command Comparison

| **Task** | **Alias** | **NPM Command** | **Description** |
|----------|-----------|----------------|----------------|
| Status | `gstatus` | `npm run mcp git-status` | Show repository status |
| Add all | `gadd` | `npm run mcp git-add-all` | Add all files to staging |
| Commit | `gcommit "msg"` | `npm run mcp git-commit "msg"` | Commit with message |
| Push | `gpush` | `npm run mcp git-push` | Push to remote |
| Full workflow | `gflow "msg"` | N/A | Add + Commit + Push |
| List tools | `glist` | N/A | Show all MCP tools |

## 🔥 Most Used Commands

**Top 10 daily operations:**
1. `gstatus` - Check repository status
2. `glist` - **🔥 Explore all available tools with examples**
3. `gadd` - Add all files
4. `gcommit "message"` - Commit changes
5. `gpush` - Push to remote
6. `gflow "message"` - Complete workflow
7. `glog` - Check recent commits
8. `gdiff` - Review changes
9. `gcheckout branch` - Switch branches
10. `gpull` - Pull latest changes

---

**Ready to Git with AI? 🚀**

# 🚀 Basic Git Operations

Essential Git commands that every developer uses daily - made simple and safe!

## 📋 Quick Overview

These are the 15 most important Git commands you'll use every day. Each command is designed to be simple, safe, and just work.

### 🎯 What's Included

✅ **15 Essential Git Commands** - Everything you need for daily development  
✅ **Safe Operations** - Built-in validation and safety checks  
✅ **Simple Syntax** - Easy to remember and use  
✅ **Comprehensive Help** - Every command supports `--help`

---

## 📋 All Basic Commands

| Command | Purpose | Common Usage |
|---------|---------|--------------|
| `gadd` | Stage files for commit | `gadd .` or `gadd file.js` |
| `gbranch` | List/create branches | `gbranch` or `gbranch new-feature` |
| `gcheckout` | Switch branches | `gcheckout main` |
| `gclone` | Clone repositories | `gclone https://github.com/user/repo.git` |
| `gcommit` | Create commits | `gcommit "Added new feature"` |
| `gdiff` | Show changes | `gdiff` or `gdiff HEAD~1` |
| `ginit` | Initialize repository | `ginit` |
| `glog` | View commit history | `glog` or `glog --oneline` |
| `gpop` | Apply stashed changes | `gpop` |
| `gpull` | Pull from remote | `gpull` |
| `gpush` | Push to remote | `gpush` |
| `gremote` | Manage remotes | `gremote -v` |
| `greset` | Reset changes | `greset HEAD~1` |
| `gstash` | Stash changes | `gstash "Work in progress"` |
| `gstatus` | Show repo status | `gstatus` |

---

## 🎯 Common Workflows

### Quick Daily Workflow
```bash
# Check what changed
gstatus

# Add your changes  
gadd .

# Commit with message
gcommit "Fixed bug in user authentication"

# Push to remote
gpush
```

### Working with Branches
```bash
# See all branches
gbranch

# Create and switch to new branch
gcheckout -b feature/new-login

# Work on your changes...
gadd .
gcommit "Added new login system"

# Switch back to main
gcheckout main

# Pull latest changes
gpull
```

### Emergency Stash
```bash
# Quick stash when switching branches
gstash "Work in progress on user profile"

# Switch branches and come back later
gcheckout main
# ... do other work ...
gcheckout feature/user-profile

# Get your work back
gpop
```

---

## 💡 Pro Tips

### Quick Help
Every command supports help:
```bash
gadd --help              # Detailed help for gadd
gbranch -h               # Short help for gbranch  
```

### Combining Commands
```bash
# Quick commit workflow
gadd . && gcommit "Quick fix" && gpush

# Create feature branch and start working
gbranch feature/new-login && gcheckout feature/new-login
```

### Safety First
- Commands include validation and safety checks
- Use `--dry-run` options where available to preview actions
- Check `gstatus` before major operations

---

## 🔗 Related Documentation

- **Advanced Operations:** See `/bin/advanced/README.md` for power-user features
- **MCP Server:** Full Git operations available via Model Context Protocol
- **Installation:** See main README for setup instructions

**Need help?** Every command has built-in help with `--help` option!
